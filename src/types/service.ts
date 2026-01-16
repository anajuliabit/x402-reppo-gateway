export interface Service {
  id: string;
  name: string;
  description: string;
  pricePerQuery: string;
}

export interface ServiceCatalogResponse {
  services: Service[];
}

export interface ServiceSubnetMapping {
  subnets: string[];
  pricePerQuery: string;
}
