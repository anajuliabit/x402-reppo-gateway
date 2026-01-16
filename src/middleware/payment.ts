import { Request, Response, NextFunction } from 'express';
import { paymentMiddleware, type Network } from '@x402/express';
import { x402ResourceServer, HTTPFacilitatorClient } from '@x402/core/server';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { payTo, network, facilitatorUrl } from '../config/x402.js';
import { getServiceRegistry } from '../services/catalog/index.js';

// Create facilitator client
const facilitatorClient = new HTTPFacilitatorClient({
  url: facilitatorUrl,
});

// Cast network to proper type
const networkId = network as Network;

// Create and configure the x402 resource server
const server = new x402ResourceServer(facilitatorClient);
server.register(networkId, new ExactEvmScheme());

// Default price for fallback
const DEFAULT_PRICE = '$0.01';

// Dynamic pricing middleware
export const payment = (req: Request, res: Response, next: NextFunction) => {
  // Extract service from query params for pricing
  const service =
    typeof req.query.service === 'string' ? req.query.service : undefined;

  // Get price from registry or use default
  const registry = getServiceRegistry();
  let price = DEFAULT_PRICE;

  if (service) {
    const priceStr = registry.getPrice(service);
    if (priceStr) {
      price = `$${priceStr}`;
    }
  }

  // Create dynamic routes config with service-specific price
  const routes = {
    'GET /api/rag/query': {
      accepts: [
        {
          scheme: 'exact' as const,
          price,
          network: networkId,
          payTo: payTo,
        },
      ],
      description: `RAG query via Reppo subnet (${service || 'default'})`,
      mimeType: 'application/json',
    },
  };

  // Create middleware with dynamic pricing
  const dynamicPayment = paymentMiddleware(routes, server);

  // Execute the payment middleware
  return dynamicPayment(req, res, next);
};
