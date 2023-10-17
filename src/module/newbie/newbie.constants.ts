import assert from 'assert';
import { isAddress } from 'viem';

export const NEWBIE_VILLA_WALLET_ADDRESS = process.env
  .NEWBIE_VILLA_WALLET_ADDRESS as `0x${string}`;

assert(
  NEWBIE_VILLA_WALLET_ADDRESS,
  'NEWBIE_VILLA_WALLET_ADDRESS is missing from environment variables',
);

assert(
  isAddress(NEWBIE_VILLA_WALLET_ADDRESS),
  `${NEWBIE_VILLA_WALLET_ADDRESS} is not a valid address for NEWBIE_VILLA_WALLET_ADDRESS`,
);
