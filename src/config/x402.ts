import { env } from './env.js';

export const payTo = env.WALLET_ADDRESS as `0x${string}`;
export const network = env.NETWORK;
export const facilitatorUrl = env.FACILITATOR_URL;
export const ragQueryPrice = `$${env.RAG_QUERY_PRICE}`;
