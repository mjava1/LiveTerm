import React from 'react';
import '../styles/global.css';
import Head from 'next/head';

import { ConnectionProvider, WalletProvider, } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import type { AppProps } from "next/app";

const network = WalletAdapterNetwork.Devnet; // or Mainnet-beta, Testnet
const wallets = [
  new PhantomWalletAdapter(), 
];

const App = ({ Component, pageProps }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onClickAnywhere = () => {
    if(inputRef.current){
      inputRef.current.focus();
    }
  };

  return (
    <ConnectionProvider endpoint={clusterApiUrl(network)}>
      <WalletProvider wallets={wallets}>
        
          <Head>
            <meta
              name="viewport"
              content="initial-scale=1.0, width=device-width"
              key="viewport"
              maximum-scale="1"
            />
          </Head>
          <div
            className="text-light-foreground dark:text-dark-foreground min-w-max text-xs md:min-w-full md:text-base"
            onClick={onClickAnywhere}
          >
            <main className="bg-light-background dark:bg-dark-background w-full h-full p-2">
              <Component {...pageProps} inputRef={inputRef} />
            </main>
          </div>
 
      </WalletProvider>      
    </ConnectionProvider>
  );
};

export default App;
