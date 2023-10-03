import { createPublicClient, http } from 'viem';
import { crossbell } from 'viem/chains';

export const publicClient = createPublicClient({
  chain: crossbell,
  transport: http(),
  pollingInterval: 1000,
});
