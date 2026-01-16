/**
 * Test client for x402-reppo-gateway (v2 protocol)
 *
 * Prerequisites:
 * 1. Get Base Sepolia ETH from https://portal.cdp.coinbase.com/products/faucet
 * 2. Get testnet USDC from https://faucet.circle.com/ (select Base Sepolia)
 * 3. Set TEST_PRIVATE_KEY environment variable with your wallet's private key
 *
 * Usage:
 *   TEST_PRIVATE_KEY=0x... npx tsx scripts/test-client.ts
 */

import 'dotenv/config';
import { x402HTTPClient, decodePaymentRequiredHeader } from '@x402/core/http';
import { x402Client } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { privateKeyToAccount } from 'viem/accounts';

// Load environment
const PRIVATE_KEY = process.env.TEST_PRIVATE_KEY;
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:4021';

if (!PRIVATE_KEY) {
  console.error('Error: TEST_PRIVATE_KEY environment variable is required');
  console.error('');
  console.error('Usage:');
  console.error('  TEST_PRIVATE_KEY=0x... npx tsx scripts/test-client.ts');
  console.error('');
  console.error('Get testnet tokens:');
  console.error('  1. ETH: https://portal.cdp.coinbase.com/products/faucet');
  console.error('  2. USDC: https://faucet.circle.com/ (select Base Sepolia)');
  process.exit(1);
}

async function main() {
  console.log('=== x402 Gateway Test Client (v2) ===\n');

  // Create account from private key
  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  console.log(`Wallet address: ${account.address}`);
  console.log(`Gateway URL: ${GATEWAY_URL}`);
  console.log('');

  // Create x402 client with EVM scheme using account as signer
  const client = new x402Client();
  registerExactEvmScheme(client, { signer: account });

  // Create HTTP client wrapper
  const httpClient = new x402HTTPClient(client);

  // Test 1: Health check (no payment required)
  console.log('--- Test 1: Health Check ---');
  try {
    const healthRes = await fetch(`${GATEWAY_URL}/health`);
    const healthData = await healthRes.json();
    console.log('Health:', JSON.stringify(healthData, null, 2));
    console.log('Status: PASS\n');
  } catch (error) {
    console.error('Health check failed:', error);
    console.log('Status: FAIL\n');
  }

  // Test 2: RAG query with payment
  console.log('--- Test 2: RAG Query (with payment) ---');
  try {
    const query = encodeURIComponent('What is machine learning?');
    const url = `${GATEWAY_URL}/api/rag/query?q=${query}&maxResults=3`;

    console.log(`Request: GET ${url}`);
    console.log('Step 1: Making initial request...');

    // First request - will get 402
    const initialResponse = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (initialResponse.status !== 402) {
      console.log(`Unexpected status: ${initialResponse.status}`);
      const body = await initialResponse.text();
      console.log('Body:', body);
      return;
    }

    console.log('Step 2: Got 402 Payment Required, creating payment...');

    // Extract payment requirements from header
    const paymentRequiredHeader = initialResponse.headers.get('PAYMENT-REQUIRED');
    if (!paymentRequiredHeader) {
      throw new Error('No PAYMENT-REQUIRED header in 402 response');
    }

    const paymentRequired = decodePaymentRequiredHeader(paymentRequiredHeader);
    console.log('Payment required:', JSON.stringify(paymentRequired, null, 2));

    // Create payment payload
    console.log('\nStep 3: Signing payment...');
    const paymentPayload = await httpClient.createPaymentPayload(paymentRequired);

    // Get payment signature headers
    const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
    console.log('Payment headers:', Object.keys(paymentHeaders));

    // Retry with payment
    console.log('\nStep 4: Retrying with payment...');
    const paidResponse = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...paymentHeaders,
      },
    });

    if (paidResponse.ok) {
      const data = await paidResponse.json();
      console.log('\nResponse:', JSON.stringify(data, null, 2));
      console.log('\nStatus: PASS - Payment successful!');
    } else {
      const errorText = await paidResponse.text();
      console.log(`Response status: ${paidResponse.status}`);
      console.log('Response:', errorText);
      console.log('\nStatus: FAIL');
    }
  } catch (error) {
    console.error('RAG query failed:', error);
    console.log('\nStatus: FAIL');
    console.log('\nTroubleshooting:');
    console.log('  - Ensure gateway is running: npm run dev');
    console.log('  - Check you have testnet USDC in your wallet');
    console.log('  - Verify WALLET_ADDRESS in gateway .env matches expected receiver');
  }

  console.log('\n=== Tests Complete ===');
}

main().catch(console.error);
