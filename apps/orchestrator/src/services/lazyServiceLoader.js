import { logger } from '../utils/logger.js';

export class LazyServiceLoader {
  constructor() {
    this.services = new Map();
    this.factories = new Map();
    this.loading = new Set();
  }

  register(name, factory) {
    this.factories.set(name, factory);
    logger.debug('Service factory registered', { service: name });
  }

  async get(name) {
    // Return cached service if available
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    // Prevent concurrent loading
    if (this.loading.has(name)) {
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.services.has(name)) {
            resolve(this.services.get(name));
          } else {
            setTimeout(checkLoaded, 10);
          }
        };
        checkLoaded();
      });
    }

    // Load service
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`Service factory not found: ${name}`);
    }

    this.loading.add(name);
    
    try {
      logger.debug('Loading service', { service: name });
      const service = await factory();
      this.services.set(name, service);
      logger.debug('Service loaded', { service: name });
      return service;
    } finally {
      this.loading.delete(name);
    }
  }

  unload(name) {
    if (this.services.has(name)) {
      const service = this.services.get(name);
      
      // Call cleanup if available
      if (service && typeof service.cleanup === 'function') {
        service.cleanup();
      }
      
      this.services.delete(name);
      logger.debug('Service unloaded', { service: name });
    }
  }

  unloadAll() {
    const serviceNames = Array.from(this.services.keys());
    for (const name of serviceNames) {
      this.unload(name);
    }
    logger.info('All services unloaded', { count: serviceNames.length });
  }

  getLoadedServices() {
    return Array.from(this.services.keys());
  }

  getStats() {
    return {
      registered: this.factories.size,
      loaded: this.services.size,
      loading: this.loading.size,
      loadedServices: this.getLoadedServices()
    };
  }
}