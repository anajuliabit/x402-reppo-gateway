// Set test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.WALLET_ADDRESS = '0x1234567890123456789012345678901234567890';
process.env.NETWORK = 'eip155:84532';
process.env.FACILITATOR_URL = 'https://x402.org/facilitator';
process.env.RAG_QUERY_PRICE = '0.01';
process.env.LOG_LEVEL = 'error'; // Reduce noise in tests
