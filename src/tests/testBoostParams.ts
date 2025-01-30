import { DuneClient } from '@duneanalytics/client-sdk';
import "dotenv/config";
import { BoostCore, SignatureType, StrategyType, ERC20VariableCriteriaIncentive } from "@boostxyz/sdk";
import { config } from "../scripts/config";
import { privateKeyToAccount } from "viem/accounts";
import { ERC20Abi } from "../ABI/ERC20";
import { readContract } from '@wagmi/core';


const DUNE_API_KEY = process.env.DUNE_API_KEY as string;
if (!DUNE_API_KEY) throw new Error('Missing DUNE_API_KEY');

async function testQuery() {
  const client = new DuneClient(DUNE_API_KEY);
  const queryId = 4638590; // Your query ID from Dune
  
  const account = {
    privateKey: process.env.PK as `0x${string}`,
    address: process.env.WALLET_ADDRESS as `0x${string}`,
  };

  const core = new BoostCore({
    config,
    account: privateKeyToAccount(account.privateKey),
  });

  
/*
  const incentives = await core.getIncentiveFeesInfo(
    477n,
    SignatureType.EIP712,
    StrategyType.TIME_BASED
  )
  console.log(incentives)*/

  /*
  try {
    const result = await client.runQuery({
      queryId,
      query_parameters: []
    });
    console.log('Query results:', result.result?.rows);
  } catch (error) {
    console.error('Error:', error);
  }*/

  const boost = await core.getBoost(482n)
  const incentive = await boost.incentives.find(incentive => incentive instanceof ERC20VariableCriteriaIncentive)
  const rewardAddress = incentive?.address;
  const rewardAsset = await incentive?.asset();
  const remainingClaimPotential = await incentive?.getRemainingClaimPotential();
  const isClaimable = await incentive?.isClaimable;
  const maxReward = await incentive?.getMaxReward();
  const claims = await incentive?.claims;
  const totalBudget = await incentive?.getTotalBudget();
  console.log("rewardAddress", rewardAddress);
  console.log("rewardAsset", rewardAsset);
  console.log("remainingClaimPotential", remainingClaimPotential);
  console.log("isClaimable", isClaimable);
  console.log("maxReward", maxReward);
  console.log("totalBudget", totalBudget);

  
  const symbol = await readContract(config, {
    abi: ERC20Abi,
    address: rewardAsset as `0x${string}`,
    functionName: 'symbol',
  })
  console.log("symbol", symbol);
}

testQuery();
