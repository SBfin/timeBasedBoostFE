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
    const signature = "464aa953dd9ff73bc241738fdca9c4df86401c25dad2e4443fba4346ce8c09cf" as `0x${string}`;

    
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
                    core.ERC20Incentive({
                        asset: USDC_ADDRESS,
                        reward: parseUnits("0.01", 6),
                        limit: BigInt(2),
                        strategy: StrategyType.POOL,
                        manager: budget.assertValidAddress(),
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