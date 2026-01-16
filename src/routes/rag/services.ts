import { Request, Response, NextFunction } from 'express';
import { getServiceRegistry } from '../../services/catalog/index.js';
import type { ServiceCatalogResponse } from '../../types/service.js';

export async function servicesHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const registry = getServiceRegistry();
    const services = registry.getServices();

    const response: ServiceCatalogResponse = {
      services,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}
