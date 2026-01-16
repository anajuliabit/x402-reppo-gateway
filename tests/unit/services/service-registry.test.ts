import {
  MockServiceRegistry,
  getServiceRegistry,
} from '../../../src/services/catalog/registry.js';

describe('MockServiceRegistry', () => {
  let registry: MockServiceRegistry;

  beforeEach(() => {
    registry = new MockServiceRegistry();
  });

  describe('getServices', () => {
    it('should return all services', () => {
      const services = registry.getServices();

      expect(services).toBeInstanceOf(Array);
      expect(services.length).toBe(4);
    });

    it('should return services with correct structure', () => {
      const services = registry.getServices();
      const service = services[0];

      expect(service).toHaveProperty('id');
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('description');
      expect(service).toHaveProperty('pricePerQuery');
    });

    it('should include expected services', () => {
      const services = registry.getServices();
      const ids = services.map((s) => s.id);

      expect(ids).toContain('general');
      expect(ids).toContain('scientific');
      expect(ids).toContain('code');
      expect(ids).toContain('financial');
    });
  });

  describe('getService', () => {
    it('should return service by id', () => {
      const service = registry.getService('general');

      expect(service).toBeDefined();
      expect(service?.id).toBe('general');
      expect(service?.name).toBe('General Knowledge');
    });

    it('should return undefined for unknown service', () => {
      const service = registry.getService('unknown');

      expect(service).toBeUndefined();
    });
  });

  describe('getSubnetMapping', () => {
    it('should return subnets for known service', () => {
      const mapping = registry.getSubnetMapping('scientific');

      expect(mapping).toBeDefined();
      expect(mapping?.subnets).toContain('subnet-3');
      expect(mapping?.subnets).toContain('subnet-7');
    });

    it('should return undefined for unknown service', () => {
      const mapping = registry.getSubnetMapping('unknown');

      expect(mapping).toBeUndefined();
    });

    it('should return correct subnets for each service', () => {
      expect(registry.getSubnetMapping('general')?.subnets).toEqual([
        'subnet-1',
        'subnet-2',
        'subnet-5',
      ]);
      expect(registry.getSubnetMapping('scientific')?.subnets).toEqual([
        'subnet-3',
        'subnet-7',
      ]);
      expect(registry.getSubnetMapping('code')?.subnets).toEqual([
        'subnet-4',
        'subnet-6',
      ]);
      expect(registry.getSubnetMapping('financial')?.subnets).toEqual([
        'subnet-8',
        'subnet-9',
      ]);
    });
  });

  describe('getPrice', () => {
    it('should return price for known service', () => {
      expect(registry.getPrice('general')).toBe('0.01');
      expect(registry.getPrice('scientific')).toBe('0.02');
      expect(registry.getPrice('code')).toBe('0.015');
      expect(registry.getPrice('financial')).toBe('0.025');
    });

    it('should return undefined for unknown service', () => {
      const price = registry.getPrice('unknown');

      expect(price).toBeUndefined();
    });
  });
});

describe('getServiceRegistry', () => {
  it('should return a service registry instance', () => {
    const registry = getServiceRegistry();

    expect(registry).toBeDefined();
    expect(typeof registry.getServices).toBe('function');
    expect(typeof registry.getService).toBe('function');
    expect(typeof registry.getSubnetMapping).toBe('function');
    expect(typeof registry.getPrice).toBe('function');
  });

  it('should return the same instance on multiple calls', () => {
    const registry1 = getServiceRegistry();
    const registry2 = getServiceRegistry();

    expect(registry1).toBe(registry2);
  });
});
