export class ServiceContainer {
  constructor() {
    this.registrations = new Map();
    this.singletons = new Map();
  }

  registerValue(name, value) {
    this.registrations.set(name, {
      type: 'value',
      value
    });
  }

  registerFactory(name, factory) {
    this.registrations.set(name, {
      type: 'factory',
      factory
    });
  }

  registerSingleton(name, factory) {
    this.registrations.set(name, {
      type: 'singleton',
      factory
    });
  }

  resolve(name) {
    if (this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    const registration = this.registrations.get(name);

    if (!registration) {
      throw new Error(`Service "${name}" has not been registered in the container`);
    }

    if (registration.type === 'value') {
      return registration.value;
    }

    if (registration.type === 'factory') {
      return registration.factory(this);
    }

    if (registration.type === 'singleton') {
      const instance = registration.factory(this);
      this.singletons.set(name, instance);
      return instance;
    }

    throw new Error(`Unknown registration type for service "${name}"`);
  }

  override(name, value) {
    if (typeof value === 'function') {
      this.registerFactory(name, value);
    } else {
      this.registerValue(name, value);
    }
    this.singletons.delete(name);
  }
}
