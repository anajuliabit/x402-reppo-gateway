import { z } from 'zod';

const envSchema = z.object({
  PORT: z
    .string()
    .default('4021')
    .transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FACILITATOR_URL: z.string().url().default('https://x402.org/facilitator'),
  WALLET_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  NETWORK: z.string().default('eip155:84532'), // Base Sepolia
  RAG_QUERY_PRICE: z.string().default('0.01'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
