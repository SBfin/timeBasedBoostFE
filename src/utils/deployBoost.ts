import { BoostCore, SignatureType, StrategyType } from "@boostxyz/sdk";
import { BoostRegistry } from "@boostxyz/sdk";
import { parseUnits } from "viem";
import { config } from "../scripts/config";
import { privateKeyToAccount } from "viem/accounts";
import { FLEX_STAKER_ADDRESS } from "../constants/addresses";
import {
    EventActionPayload,
    ActionStep,
    ActionClaimant,
    FilterType,
    PrimitiveType
} from '@boostxyz/sdk';

interface DeployBoostParams {
  tokenToHold: string;
  rewardToken: string;
  rewardPerBlock: string;
  maxUsers: string;
  maxRewardPerUser: string;
}

export async function deployBoost(params: DeployBoostParams) {
  const BUDGET_ADDRESS = "0x26694b52b68502809938d2fd14385498bf7d7f65";

  const account = {
    privateKey: process.env.PK as `0x${string}`,
    address: process.env.WALLET_ADDRESS as `0x${string}`,
  };
  const registry = new BoostRegistry({
    config,
    account: privateKeyToAccount(account.privateKey),
  });
  const core = new BoostCore({
    config,
    account: privateKeyToAccount(account.privateKey),
  });

  const budget = core.ManagedBudget(BUDGET_ADDRESS);
  
    // withdraw signature
  const signature = "0xf341246adaac6f497bc2a656f546ab9e182111d630394f0c57c710a59a2cb567" as `0x${string}`;
  
  const actionStepSwap: ActionStep = {
    chainid: 8453,
    signature: signature,
    signatureType: SignatureType.EVENT,
    targetContract: FLEX_STAKER_ADDRESS as `0x${string}`,
    actionParameter: {
      filterType: FilterType.EQUAL,
      fieldType: PrimitiveType.ADDRESS,
      fieldIndex: 1,
      filterData: params.tokenToHold as `0x${string}`
    }
  };

  const functionActionPayload = {
    actionClaimant: {
      signatureType: SignatureType.EVENT,
      signature: signature,
      fieldIndex: 0,
      targetContract: FLEX_STAKER_ADDRESS as `0x${string}`,
      chainid: 8453,
    },
    actionSteps: [actionStepSwap]
  };

  const eventAction = core.EventAction(functionActionPayload);

  const boost = await core.createBoost({
    maxParticipants: BigInt(params.maxUsers),
    budget: budget,
    action: eventAction,
    incentives: [
      core.ERC20VariableCriteriaIncentive({
        asset: params.rewardToken as `0x${string}`,
        reward: parseUnits(params.rewardPerBlock, 6),
        limit: BigInt(params.maxRewardPerUser),
        maxReward: parseUnits(params.maxRewardPerUser, 6),
        criteria: {
          criteriaType: SignatureType.EVENT,
          signature: signature,
          fieldIndex: 2,
          targetContract: FLEX_STAKER_ADDRESS as `0x${string}`,
        }
      }),
    ],
  }, {
    chainId: 8453
  });

  return boost;
}
