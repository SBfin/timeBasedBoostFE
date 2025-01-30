import { useEffect, useState } from 'react';
import { BoostCore, ERC20VariableCriteriaIncentive } from "@boostxyz/sdk";
import { readContract } from '@wagmi/core';
import { ERC20Abi } from '../ABI/ERC20';
import { config } from '../scripts/config'; // Make sure to import your wagmi config
import styles from '../styles/BoostTable.module.css';
import { privateKeyToAccount } from 'viem/accounts';
import "dotenv/config";

const formatDecimals = (value: string, decimals: number = 8): string => {
  const num = BigInt(value || '0');
  return (Number(num) / 10 ** decimals).toString();
};

export function BoostTable() {
  const [boosts, setBoosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoosts = async () => {
      try {
        const response = await fetch('/api/getBoosts');
        const duneData = await response.json();
        const boostArray = Array.isArray(duneData) ? duneData : duneData.result?.rows || [];

        const bootsWithDetails = await Promise.all(boostArray.map(async (boost: any) => {
          const response = await fetch(`/api/getBoostDetails?boostId=${boost.boostId}`);
          if (!response.ok) {
            console.error(`API error: ${response.status}`);
            return null;
          }
          return await response.json();
        }));

        setBoosts(bootsWithDetails.filter(boost => boost !== null));
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoosts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Token</th>
          <th>Remaining</th>
          <th>Max Reward</th>
          <th>Total Budget</th>
        </tr>
      </thead>
      <tbody>
        {boosts.map((boost) => (
          <tr key={boost.boostId}>
            <td>{boost.boostId}</td>
            <td>{boost.symbol || 'Unknown'}</td>
            <td>{boost.remaining}</td>
            <td>{boost.maxReward}</td>
            <td>{boost.totalBudget}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
