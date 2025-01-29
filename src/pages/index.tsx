import { useState } from 'react';
import { ethers } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useReadContract, useContractRead } from 'wagmi';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { FlexStakerAbi } from '../ABI/FlexStaker';
import { ERC20Abi } from '../ABI/ERC20';
import { USDC_ADDRESS, FLEX_STAKER_ADDRESS } from '../constants/addresses';
import { useEstimateGas } from 'wagmi';
import { deployBoost } from '../utils/deployBoost';

interface TokenHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (data: TokenHoldingConfig) => void;
}

interface TokenHoldingConfig {
  tokenToHold: string;
  rewardToken: string;
  rewardPerBlock: string;
  maxUsers: string;
  maxRewardPerUser: string;
}

const TokenHoldingModal = ({ isOpen, onClose, onDeploy }: TokenHoldingModalProps) => {
  const [config, setConfig] = useState<TokenHoldingConfig>({
    tokenToHold: '',
    rewardToken: '',
    rewardPerBlock: '0.0001',
    maxUsers: '100',
    maxRewardPerUser: '10'
  });

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Token Holding Configuration</h2>
        
        <div className={styles.inputGroup}>
          <label>Token to hold</label>
          <input
            type="text"
            placeholder="Token address"
            value={config.tokenToHold}
            onChange={(e) => setConfig({...config, tokenToHold: e.target.value})}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Reward token</label>
          <input
            type="text"
            placeholder="Token address"
            value={config.rewardToken}
            onChange={(e) => setConfig({...config, rewardToken: e.target.value})}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Reward per block</label>
          <div className={styles.inputWithInfo}>
            <input
              type="text"
              placeholder="i.e. 1 Per day"
              value={config.rewardPerBlock}
              onChange={(e) => setConfig({...config, rewardPerBlock: e.target.value})}
            />
            <span className={styles.rewardInfo}>
              ≈ {Number(config.rewardPerBlock) * 43200} per day
            </span>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Max users</label>
          <input
            type="number"
            value={config.maxUsers}
            onChange={(e) => setConfig({...config, maxUsers: e.target.value})}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Max token reward per user</label>
          <input
            type="number"
            value={config.maxRewardPerUser}
            onChange={(e) => setConfig({...config, maxRewardPerUser: e.target.value})}
          />
        </div>

        <div className={styles.modalButtons}>
          <button onClick={onClose}>Cancel</button>
          <button 
            onClick={() => onDeploy(config)}
            className={styles.deployButton}
          >
            Deploy
          </button>
        </div>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const [amount, setAmount] = useState('');
  const { address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check USDC allowance
  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20Abi,
    functionName: 'allowance',
    args: address ? [address, FLEX_STAKER_ADDRESS] : undefined
  });

  // Approve USDC
  const { writeContract: approveUsdc } = useWriteContract();

  // Deposit to FlexStaker
  const { writeContract: depositToStaker } = useWriteContract();

  // Withdraw from FlexStaker
  const { writeContract: withdrawFromStaker } = useWriteContract();

  const { data: stakedBalance } = useReadContract({
    address: FLEX_STAKER_ADDRESS,
    abi: FlexStakerAbi,
    functionName: 'balanceOf',
    args: address ? [address, USDC_ADDRESS] : undefined
  });

  const handleApprove = () => {
    approveUsdc({
      address: USDC_ADDRESS,
      abi: ERC20Abi,
      functionName: 'approve',
      args: [FLEX_STAKER_ADDRESS, BigInt(Number(amount) * 1_000_000)],
    });
  };

  const handleDeposit = () => {
    depositToStaker({
      address: FLEX_STAKER_ADDRESS,
      abi: FlexStakerAbi,
      functionName: 'deposit',
      args: [USDC_ADDRESS, BigInt(Number(amount) * 1_000_000)],
      gas: 1000000n
    });
  };

  const handleWithdraw = () => {
    withdrawFromStaker({
      address: FLEX_STAKER_ADDRESS,
      abi: FlexStakerAbi,
      functionName: 'withdraw',
      args: [USDC_ADDRESS, BigInt(Number(amount) * 1_000_000)],
      gas: 1000000n
    });
  };

  const handleDeploy = async (config: TokenHoldingConfig) => {
    try {
      const boost = await deployBoost(config);
      console.log("Boost deployed successfully:", boost.id);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deploying boost:", error);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Time based boost rewards</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.leftSection}>
            <h1>Opportunities</h1>
            <div className={styles.dropdown}>
              <button className={styles.createBoostButton}>Create Boost</button>
              <div className={styles.dropdownContent}>
                <button onClick={() => setIsModalOpen(true)}>Token holding</button>
                <button>Liquidity Pool</button>
                <button>Swaps</button>
              </div>
            </div>
          </div>
          <ConnectButton />
        </div>

        <TokenHoldingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDeploy={handleDeploy}
        />

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Token</th>
              <th>Reward token</th>
              <th>Duration</th>
              <th>APR</th>
              <th>Max reward per wallet</th>
              <th>Available spots</th>
              <th>Balance</th>
              <th>Rewards</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Example row - you can map through actual data later */}
            <tr>
              <td>USDC</td>
              <td>USDC</td>
              <td>30 days</td>
              <td>10%</td>
              <td>1000 USDC</td>
              <td>100</td>
              <td>{stakedBalance ? Number(stakedBalance) : 0} USDC</td>
              <td>0 USDC</td>
              <td className={styles.actions}>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className={styles.input}
                />
                <button
                  onClick={handleApprove}
                  disabled={!amount || (allowance ?? 0n) >= BigInt(Number(amount) * 1_000_000)}
                  className={styles.button}
                >
                  Approve
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={!amount || (allowance ?? 0n) < BigInt(Number(amount) * 1_000_000)}
                  className={styles.button}
                >
                  Deposit
                </button>
                <button 
                  onClick={handleWithdraw}
                  disabled={!amount}
                  className={styles.button}
                >
                  Withdraw
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </main>

      <footer className={styles.footer}>
        <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
          Made with ❤️ by your frens at 🌈
        </a>
      </footer>
    </div>
  );
};

export default Home;
