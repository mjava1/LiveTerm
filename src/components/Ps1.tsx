import React from 'react';
import config from '../../config.json';
import { useWallet } from '@solana/wallet-adapter-react';
import { PhantomWalletName } from "@solana/wallet-adapter-phantom";

export const Ps1 = () => {

  const { publicKey, connect, connected, wallet, select } = useWallet();
  select(PhantomWalletName);
  
  const shortenAddress = (address, chars = 4) => {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  };

  return (
    
    <div>
      <span className="text-light-yellow dark:text-dark-yellow">        
        {publicKey ? shortenAddress(publicKey.toString()) : 'guest'}
      </span>
      <span className="text-light-gray dark:text-dark-gray">@</span>
      <span className="text-light-green dark:text-dark-green">
        {config.ps1_hostname}
      </span>
      <span className="text-light-gray dark:text-dark-gray">:$ ~ </span>
    </div>
  );
};

export default Ps1;
