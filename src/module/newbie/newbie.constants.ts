import assert from 'assert';
import { isAddress } from 'viem';

export const NEWBIE_VILLA_CONTRACT_ADDRESS =
  '0xD0c83f0BB2c61D55B3d33950b70C59ba2f131caA';

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
