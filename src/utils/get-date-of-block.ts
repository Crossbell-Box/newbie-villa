import { publicClient } from '@/utils/public-client';

export const getDateOfBlock = async (blockNumber: bigint) => {
  const block = await publicClient.getBlock({ blockNumber: blockNumber });

  return new Date(Number(block.timestamp) * 1000);
};
