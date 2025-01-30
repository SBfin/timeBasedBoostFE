import { BoostCore } from "@boostxyz/sdk";
import { privateKeyToAccount } from 'viem/accounts';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { config } from '../scripts/config';
import 'dotenv/config';

export function getBoostCore() {
  const pk = process.env.PK as `0x${string}`; // Note: no NEXT_PUBLIC_ prefix
  const walletAddress = process.env.WALLET_ADDRESS as `0x${string}`;

  if (!pk || !walletAddress) {
    throw new Error('Missing environment variables for account');
  }

  return new BoostCore({
    config,
    account: privateKeyToAccount(pk as `0x${string}`)
  });
}