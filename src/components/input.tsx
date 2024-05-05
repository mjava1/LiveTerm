import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { commandExists } from '../utils/commandExists';
import { shell } from '../utils/shell';
import { handleTabCompletion } from '../utils/tabCompletion';
import { Ps1 } from './Ps1';
import { PhantomWalletName } from "@solana/wallet-adapter-phantom";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
} from '@solana/spl-token';
import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

async function transferUSDC(signTransaction, setHistory, fromWalletAddress, amount) {

  // console.info(`Transferring...`);

  // const pk='vZ75RDimEuTNQ5gN9G16oAg3ma4wowkjdEdPmnrbZZMPBGxivkuovjcGWXmmUcNB49Dv9LhkT9zjdANzSjuF2tK'
        
  // const fromKeypair = Keypair.fromSecretKey(
  //     bs58.decode(pk)
  //   );

  //const fromWalletAddress = fromKeypair.publicKey

  const toWalletAddress = new PublicKey("76ow8U6zw4o4M8GZ8FYfoUjnVbkX1MUZz5ZoMzG3G5zA");

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  // Live
  //const mintAddress = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // USDC mint address
  const mintAddress = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"); // USDC mint address
  
  const fromTokenAccount = await getAssociatedTokenAddress(mintAddress, fromWalletAddress);
  const toTokenAccount = await getAssociatedTokenAddress(mintAddress, toWalletAddress);

  const transaction = new Transaction().add(
      createTransferInstruction(
          fromTokenAccount, // source
          toTokenAccount,   // destination
          fromWalletAddress,       // owner of the source account
          amount * 1_000_000, // Amount of tokens to transfer in smallest units
          [],               // multisig (if any, otherwise leave empty)
      )
  );

  // Make sure to set the recent blockhash and fee payer
  transaction.feePayer = fromWalletAddress;
  let blockhash = (await connection.getLatestBlockhash()).blockhash;
  transaction.recentBlockhash = blockhash;

  // Assuming the user's wallet is connected via Phantom or another wallet provider
  //const signedTransaction = await fromKeypair.signTransaction(transaction);
  //transaction.sign(fromKeypair);

  // Sign the transaction
  // transaction.sign(fromKeypair);
  // const signedTransaction = transaction.serialize();
  // const signature = await connection.sendRawTransaction(signedTransaction);

  const signedTransaction = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signedTransaction.serialize());
  
  //await connection.confirmTransaction(signature, "finalized");

  const latestBlockHash = await connection.getLatestBlockhash()

  const confirmationResult = await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
      });
  
  setHistory(`Transaction successful with signature: (${signature})`)

  //sconsole.log('Confirmation status:', confirmationResult.value);

  
  //await connection.confirmTransaction(signature, "finalized");

  return signature;
}


export const Input = ({
  inputRef,
  containerRef,
  command,
  history,
  lastCommandIndex,
  setCommand,
  setHistory,
  setLastCommandIndex,
  clearHistory,
}) => {

  const { publicKey, connect, connected, wallet, select, signMessage, signTransaction} = useWallet();
  select(PhantomWalletName);


  const onSubmit = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    const commands: string[] = history
      .map(({ command }) => command)
      .filter((command: string) => command);

    if (event.key === 'c' && event.ctrlKey) {
      event.preventDefault();
      setCommand('');
      setHistory([]);
      setLastCommandIndex(0);
    }

    if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      clearHistory();
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      handleTabCompletion(command, setCommand);
    }

    if (event.key === 'Enter' || event.code === '13') {
      event.preventDefault();
      setLastCommandIndex(0);

      if (command.toLowerCase() === 'buy') {   
        command = 'buy false'

        try {

          await connect();
          
          if(publicKey){
            //console.info(`Wallet address is (${publicKey})`);
            setHistory(`Transferring from Wallet address is (${publicKey})`)

            await transferUSDC(signTransaction, setHistory, publicKey, 1)  // Transfer 1 USDC
              .then(signature => setHistory(`Transaction signature (${signature})`))
              .catch(error => console.error("Error in transaction", error));
          }
          containerRef.current.scrollTo(0, containerRef.current.scrollHeight);
          return;
          command = `buy ${publicKey}`
          

        } catch (error) {
          
          // console.error("Failed to connect to Phantom Wallet:", error);
          
        }     
      }

      if (command.toLowerCase() === 'login') {        
          try {
            await connect();
            
            
            // console.info('Connected: ' + connected)
            // Optionally sign a message after connecting
            if (publicKey) {
              
              // console.log("Signature:", signature);
              // Handle login logic here, possibly sending signature to your backend for verification
            }

            command = `login ${publicKey}`

          } catch (error) {
            
            // console.error("Failed to connect to Phantom Wallet:", error);
            command = 'login false'
          }     
      }
      

      await shell(command, setHistory, clearHistory, setCommand);
      containerRef.current.scrollTo(0, containerRef.current.scrollHeight);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!commands.length) {
        return;
      }
      const index: number = lastCommandIndex + 1;
      if (index <= commands.length) {
        setLastCommandIndex(index);
        setCommand(commands[commands.length - index]);
      }
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!commands.length) {
        return;
      }
      const index: number = lastCommandIndex - 1;
      if (index > 0) {
        setLastCommandIndex(index);
        setCommand(commands[commands.length - index]);
      } else {
        setLastCommandIndex(0);
        setCommand('');
      }
    }
  };

  const onChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(value);
  };

  return (

    
    <div className="flex flex-row space-x-2">
      <label htmlFor="prompt" className="flex-shrink">
        <Ps1 />
      </label>

      <div>
   
      {/* Rest of your input component */}
    </div>
    
      <input
        ref={inputRef}
        id="prompt"
        type="text"
        className={`bg-light-background dark:bg-dark-background focus:outline-none flex-grow ${
          commandExists(command) || command === ''
            ? 'text-dark-green'
            : 'text-dark-red'
        }`}
        value={command}
        onChange={onChange}
        autoFocus
        onKeyDown={onSubmit}
        autoComplete="off"
        spellCheck="false"
      />
      
    </div>
  );
};

export default Input;
