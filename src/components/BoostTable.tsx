import { useEffect, useState } from 'react';
import { BoostCore, ERC20VariableCriteriaIncentive } from "@boostxyz/sdk";
import { readContract } from '@wagmi/core';
import { ERC20Abi } from '../ABI/ERC20';
import { config } from '../scripts/config'; // Make sure to import your wagmi config
import styles from '../styles/BoostTable.module.css';
import { BoostData } from '@/types/boostData';
import { DuneClient } from '@duneanalytics/client-sdk';

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
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text(); // Get response as text first
        console.log('Response:', text); // Debug the raw response
        
        try {
          const data = JSON.parse(text); // Then try to parse as JSON
          setBoosts(data);
        } catch (e) {
          console.error('JSON parse error:', e);
        }
      } catch (error) {
        console.error('Error fetching boosts:', error);
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
            <td>{formatDecimals(boost.remaining)}</td>
            <td>{formatDecimals(boost.maxReward)}</td>
            <td>{formatDecimals(boost.totalBudget)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
