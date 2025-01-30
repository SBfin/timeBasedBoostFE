import type { NextApiRequest, NextApiResponse } from 'next';
import { getBoostCore } from '@/utils/fetchBoostCore';
import { ERC20VariableCriteriaIncentive } from '@boostxyz/sdk';
import { readContract } from '@wagmi/core';
import { config } from '@/scripts/config';
import { ERC20Abi } from '@/ABI/ERC20';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { boostId } = req.query;
    
    console.log('API called with boostId:', boostId); // Debug log

    if (!boostId) {
      return res.status(400).json({ error: 'Missing boostId parameter' });
    }

    const core = getBoostCore();

    const boost = await core.getBoost(BigInt(boostId as string));

    const incentive = await boost.incentives.find(incentive => incentive instanceof ERC20VariableCriteriaIncentive)
      
    console.log("incentive", incentive);

    // Get token details and incentive values
    const rewardAsset = await incentive?.asset();
    const symbol = await readContract(config, {
        abi: ERC20Abi,
        address: rewardAsset as `0x${string}`,
        functionName: "symbol",
    });
    const remaining = (await incentive?.getRemainingClaimPotential())?.toString() || '0';
    const maxReward = (await incentive?.getMaxReward?.())?.toString() || '0';
    const totalBudget = (await incentive?.getTotalBudget?.())?.toString() || '0';
      
    const combinedData = {
        boostId,
        symbol,
        rewardAsset,
        remaining,
        maxReward,
        totalBudget
      };

      console.log("combinedData", combinedData);
      return res.status(200).json(combinedData);
  } catch (error) {
    // Detailed error logging
    console.error('API Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch boost details'
    });
  }
}