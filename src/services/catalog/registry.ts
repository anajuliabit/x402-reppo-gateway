import type { Service, ServiceSubnetMapping } from '../../types/service.js';

export interface ServiceRegistry {
  getServices(): Service[];
  getService(id: string): Service | undefined;
  getSubnetMapping(serviceId: string): ServiceSubnetMapping | undefined;
  getPrice(serviceId: string): string | undefined;
}

// Service → Subnet mapping with prices
const SERVICE_SUBNET_MAP: Record<string, ServiceSubnetMapping> = {
  general: {
    subnets: ['subnet-1', 'subnet-2', 'subnet-5'],
    pricePerQuery: '0.01',
  },
  scientific: {
    subnets: ['subnet-3', 'subnet-7'],
    pricePerQuery: '0.02',
  },
  code: {
    subnets: ['subnet-4', 'subnet-6'],
    pricePerQuery: '0.015',
  },
  financial: {
    subnets: ['subnet-8', 'subnet-9'],
    pricePerQuery: '0.025',
  },
};

// Service catalog with metadata
const SERVICES: Service[] = [
  {
    id: 'general',
    name: 'General Knowledge',
    description: 'Broad domain knowledge base',
    pricePerQuery: '$0.01',
  },
  {
    id: 'scientific',
    name: 'Scientific Papers',
    description: 'Academic research and citations',
    pricePerQuery: '$0.02',
  },
  {
    id: 'code',
    name: 'Code & Documentation',
    description: 'Programming resources',
    pricePerQuery: '$0.015',
  },
  {
    id: 'financial',
    name: 'Financial Data',
    description: 'Market data and financial reports',
    pricePerQuery: '$0.025',
  },
];

export class MockServiceRegistry implements ServiceRegistry {
  getServices(): Service[] {
    return SERVICES;
  }

  getService(id: string): Service | undefined {
    return SERVICES.find((s) => s.id === id);
  }

  getSubnetMapping(serviceId: string): ServiceSubnetMapping | undefined {
    return SERVICE_SUBNET_MAP[serviceId];
  }

  getPrice(serviceId: string): string | undefined {
    const mapping = SERVICE_SUBNET_MAP[serviceId];
    return mapping?.pricePerQuery;
  }
}

// Singleton instance
let registryInstance: ServiceRegistry | null = null;

export function getServiceRegistry(): ServiceRegistry {
  if (!registryInstance) {
    registryInstance = new MockServiceRegistry();
  }
  return registryInstance;
}

export function setServiceRegistry(registry: ServiceRegistry): void {
  registryInstance = registry;
}
