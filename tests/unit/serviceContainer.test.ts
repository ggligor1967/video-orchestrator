import { describe, it, expect } from 'vitest';
import { ServiceContainer } from '../../apps/orchestrator/src/container/serviceContainer.js';

describe('ServiceContainer', () => {
  it('resolves registered values', () => {
    const container = new ServiceContainer();
    const config = { port: 1234 };
    container.registerValue('config', config);

    expect(container.resolve('config')).toBe(config);
  });

  it('creates new instances for factories', () => {
    const container = new ServiceContainer();
    let counter = 0;

    container.registerFactory('id', () => ++counter);

    expect(container.resolve('id')).toBe(1);
    expect(container.resolve('id')).toBe(2);
  });

  it('reuses singletons after the first resolution', () => {
    const container = new ServiceContainer();
    const created: Array<Record<string, number>> = [];

    container.registerSingleton('singleton', () => {
      const instance = { id: created.length };
      created.push(instance);
      return instance;
    });

    const first = container.resolve('singleton');
    const second = container.resolve('singleton');

    expect(first).toBe(second);
    expect(created).toHaveLength(1);
  });

  it('supports overriding registrations', () => {
    const container = new ServiceContainer();
    container.registerValue('logger', { level: 'info' });
    expect(container.resolve('logger')).toEqual({ level: 'info' });

    container.override('logger', { level: 'debug' });
    expect(container.resolve('logger')).toEqual({ level: 'debug' });

    container.override('factory', () => 'value');
    expect(container.resolve('factory')).toBe('value');
  });

  it('throws when resolving an unknown service', () => {
    const container = new ServiceContainer();
    expect(() => container.resolve('missing')).toThrowError(
      'Service "missing" has not been registered in the container'
    );
  });
});
