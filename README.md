# x402-reppo-gateway

A payment gateway for Reppo subnet data using the x402 protocol. This service provides RAG (Retrieval-Augmented Generation) queries with per-service pricing and subnet provenance.

## Features

- **Service-Based RAG Queries**: Query different data domains (general, scientific, code, financial)
- **x402 Payment Protocol**: Micropayments via Base Sepolia USDC
- **Dynamic Pricing**: Per-service pricing based on data domain
- **Subnet Provenance**: Transparent tracking of which subnets contributed data
- **Free Service Catalog**: Browse available services without payment

## Quick Start

### Prerequisites

- Node.js 18+
- A wallet with Base Sepolia ETH and USDC (for testing)

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file:

```env
PORT=4021
NODE_ENV=development
WALLET_ADDRESS=0xYourWalletAddress
NETWORK=eip155:84532
FACILITATOR_URL=https://x402.org/facilitator
LOG_LEVEL=info
```

### Running

```bash
# Development
npm run dev

# Production
npm run build && npm start
```

## API Reference

### Service Catalog (Free)

```
GET /api/rag/services
```

Returns available services with pricing:

```json
{
  "services": [
    {
      "id": "general",
      "name": "General Knowledge",
      "description": "Broad domain knowledge base",
      "pricePerQuery": "$0.01"
    },
    {
      "id": "scientific",
      "name": "Scientific Papers",
      "description": "Academic research and citations",
      "pricePerQuery": "$0.02"
    },
    {
      "id": "code",
      "name": "Code & Documentation",
      "description": "Programming resources",
      "pricePerQuery": "$0.015"
    },
    {
      "id": "financial",
      "name": "Financial Data",
      "description": "Market data and financial reports",
      "pricePerQuery": "$0.025"
    }
  ]
}
```

### RAG Query (Paid)

```
GET /api/rag/query?q=<query>&service=<service>&maxResults=5
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (1-1000 chars) |
| `service` | string | Yes | Service ID from catalog |
| `maxResults` | number | No | Max results (1-20, default: 5) |

**Response:**

```json
{
  "query": "What is machine learning?",
  "service": "scientific",
  "results": [
    {
      "text": "Machine learning is...",
      "relevanceScore": 0.95,
      "source": {
        "subnet": "subnet-3",
        "document": "doc-12345",
        "uri": "reppo:scientific:subnet-3:doc-12345"
      }
    }
  ],
  "provenance": {
    "subnets": ["subnet-3", "subnet-7"],
    "totalSources": 2,
    "responseTimeBySubnet": {
      "subnet-3": 120,
      "subnet-7": 150
    }
  },
  "qualityScore": 0.87,
  "processingTimeMs": 180,
  "pricing": {
    "service": "scientific",
    "price": "$0.02"
  }
}
```

### Health Check (Free)

```
GET /health
```

## Payment Flow

1. Client requests `/api/rag/query` without payment
2. Server returns `402 Payment Required` with `PAYMENT-REQUIRED` header
3. Client creates payment payload using x402 client SDK
4. Client retries request with `PAYMENT-SIGNATURE` header
5. Server verifies payment and returns data

## Service-to-Subnet Mapping

| Service | Subnets | Price |
|---------|---------|-------|
| general | subnet-1, subnet-2, subnet-5 | $0.01 |
| scientific | subnet-3, subnet-7 | $0.02 |
| code | subnet-4, subnet-6 | $0.015 |
| financial | subnet-8, subnet-9 | $0.025 |

## Testing

```bash
# Run unit and integration tests
npm test

# Run with watch mode
npm run test:watch

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Test Client

Test the full payment flow:

```bash
# Get testnet tokens first:
# ETH: https://portal.cdp.coinbase.com/products/faucet
# USDC: https://faucet.circle.com/ (select Base Sepolia)

TEST_PRIVATE_KEY=0x... npm run test:client
```

## Project Structure

```
src/
├── config/           # Environment and x402 configuration
├── middleware/       # Express middleware (payment, error, logging)
├── routes/
│   ├── health.ts     # Health check endpoint
│   └── rag/          # RAG API routes
│       ├── index.ts  # Route registration
│       ├── query.ts  # Query handler
│       ├── services.ts # Service catalog handler
│       └── types.ts  # Request/response types
├── services/
│   ├── catalog/      # Service registry
│   └── reppo/        # Reppo RFD service (mock)
├── types/            # Shared TypeScript types
├── utils/            # Utilities (logger, errors)
├── server.ts         # Express app setup
└── index.ts          # Entry point
```

## Architecture

```
Client Request (Intent):
{ "service": "scientific", "query": "machine learning" }
           ↓
x402 Payment Middleware (verifies payment)
           ↓
Query Handler (validates service)
           ↓
MockReppoService (simulates subnet queries)
           ↓
Response with data + subnet provenance
```

## License

MIT
