import { BoostCore, SignatureType, StrategyType } from "@boostxyz/sdk";
import { BoostRegistry } from "@boostxyz/sdk";
import { config } from "../scripts/config";
import "dotenv/config";
import { parseUnits, keccak256, toHex, stringToHex } from "viem";
import { FLEX_STAKER_ADDRESS } from "../constants/addresses";
import { privateKeyToAccount } from "viem/accounts";
import {
    EventActionPayload,
    ActionStep,
    ActionClaimant,
    FilterType,
    PrimitiveType
  } from '@boostxyz/sdk';

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

const BUDGET_ADDRESS = "0x26694b52b68502809938d2fd14385498bf7d7f65";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const CHAIN_ID = 8453;

async function main() {
    console.log("Deploying boosts...");
    console.log("Budget address:", BUDGET_ADDRESS);
    console.log("Wallet address:", account.address);
    const budget = core.ManagedBudget(BUDGET_ADDRESS);
    console.log("Budget manager:", await budget.owner());
    // Withdraw(msg.sender, token, amount, blocksStaked)
    // Withdraw(address,address,uint256,uint256)
    const signature = "0xf341246adaac6f497bc2a656f546ab9e182111d630394f0c57c710a59a2cb567" as `0x${string}`;

    
        console.log(`Creating boost for`);
        
        const actionStepSwap: ActionStep = {
            chainid: CHAIN_ID,
            signature: signature, 
            signatureType: SignatureType.EVENT, 
            targetContract: FLEX_STAKER_ADDRESS as `0x${string}`,        
            actionParameter: {
                filterType: FilterType.EQUAL,
                fieldType: PrimitiveType.ADDRESS,
                fieldIndex: 1,
                filterData: USDC_ADDRESS as `0x${string}` 
            }
        };

        const functionActionPayload = {
            actionClaimant: {
                signatureType: SignatureType.EVENT,
                signature: signature,
                fieldIndex: 0,
                targetContract: FLEX_STAKER_ADDRESS as `0x${string}`,
                chainid: CHAIN_ID,
            },
            actionSteps: [actionStepSwap]
        };

        const eventAction = core.EventAction(functionActionPayload);

        try {
            const boost = await core.createBoost({
                maxParticipants: BigInt(10),
                budget: budget,
                action: eventAction,
                incentives: [
                    core.ERC20VariableCriteriaIncentive({
                        asset: USDC_ADDRESS, // use zero address for native assets
                        reward: parseUnits('0.01',6), // Amount to multiply a claim amount by, if 0n or 1 ether, user will be transferred the whole amount asserted at claim time.
                        limit: BigInt(2), // The total budget allocated to this incentive
                        maxReward: parseUnits('0.02',6), // The maximum amount that can be claimed at a time, if the amount extracted from the transaction given the criteria is more than this value, then the claim value will be this max reward value.
                        criteria: {
                          criteriaType: SignatureType.EVENT,
                          signature: signature,
                          fieldIndex: 2, // Field index where the dynamic claim value resides
                          targetContract: FLEX_STAKER_ADDRESS as `0x${string}`,
                        }
                    }),
                ],
            }, {
                chainId: CHAIN_ID
            });

            console.log(`Boost deployed successfully!`);
            console.log("Boost id:", boost.id);

        } catch (error) {
            console.error(`Error deploying boost:`, error);
        }
    }


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });