import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { FlexStakerAbi } from '../ABI/FlexStaker';
import { ERC20Abi } from '../ABI/ERC20';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Time based boost rewards</title>
      </Head>

      <main className={styles.main}>
        <ConnectButton />

        <h1 className={styles.title}>
          Welcome to <a href="">time based rewards</a>
        </h1>

        <p className={styles.description}>
          See active boosts, deposit the token and get rewarded for your diamond hands!
        </p>
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
