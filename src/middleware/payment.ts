import { paymentMiddleware, type Network } from '@x402/express';
import { x402ResourceServer, HTTPFacilitatorClient } from '@x402/core/server';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { payTo, network, facilitatorUrl, ragQueryPrice } from '../config/x402.js';

// Create facilitator client
const facilitatorClient = new HTTPFacilitatorClient({
  url: facilitatorUrl,
});

// Cast network to proper type
const networkId = network as Network;

// Create and configure the x402 resource server
const server = new x402ResourceServer(facilitatorClient);
server.register(networkId, new ExactEvmScheme());

// Routes configuration
const routes = {
  'GET /api/rag/query': {
    accepts: [
      {
        scheme: 'exact' as const,
        price: ragQueryPrice,
        network: networkId,
        payTo: payTo,
      },
    ],
    description: 'RAG query via Reppo subnet',
    mimeType: 'application/json',
  },
};

export const payment = paymentMiddleware(routes, server);
