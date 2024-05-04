import config from '../../../config.json';
import React, { useEffect } from 'react';
import { PublicKey, Connection, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';


const transferUSDC = async (senderPublicKey, recipientPublicKey, amount) => {
    const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
    const phantom = await connectWallet();

    if (!phantom) return;

    const usdcMintAddress = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    const usdcToken = new Token(connection, usdcMintAddress, TOKEN_PROGRAM_ID, phantom);

    // Find the associated token accounts
    const senderTokenAccount = await usdcToken.getOrCreateAssociatedAccountInfo(senderPublicKey);
    const recipientTokenAccount = await usdcToken.getOrCreateAssociatedAccountInfo(recipientPublicKey);

    // Create the transfer instruction
    const transaction = new Transaction().add(
        Token.createTransferInstruction(
            TOKEN_PROGRAM_ID,
            senderTokenAccount.address,
            recipientTokenAccount.address,
            phantom.publicKey,
            [],
            amount * 1_000_000 // Convert amount to lamports assuming 6 decimal places for USDC
        )
    );

    // Set transaction fee payer and recent blockhash
    transaction.feePayer = phantom.publicKey;
    let { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // Prompt user to sign the transaction
    try {
        const signedTransaction = await phantom.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(signature, "confirmed");
        console.log('Transaction successful with signature:', signature);
    } catch (error) {
        console.error('Error signing or sending transaction:', error);
    }
};

const buycoin = async (args: string[]): Promise<string> => {
  
    const sendTransaction = async () => {
        
        console.log('Sending transaction...')

        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        
        const pk='vZ75RDimEuTNQ5gN9G16oAg3ma4wowkjdEdPmnrbZZMPBGxivkuovjcGWXmmUcNB49Dv9LhkT9zjdANzSjuF2tK'
        
        const fromKeypair = Keypair.fromSecretKey(
            bs58.decode(pk)
          );
          
        // const fromKeypair = Keypair.fromSecretKey(new Uint8Array([
        //     // Your secret key here as an array of integers
        //     // Example: 146, 124, 255, ...
        // ]));

        //const toPublicKey = Keypair.generate().publicKey;        
        const toPublicKey = new PublicKey("76ow8U6zw4o4M8GZ8FYfoUjnVbkX1MUZz5ZoMzG3G5zA");

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: fromKeypair.publicKey,
                toPubkey: toPublicKey,
                lamports: 1260000 // Sending 1 SOL
            })
        );
        
        // Fetch the latest blockhash
        const { blockhash } = await connection.getLatestBlockhash('finalized');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromKeypair.publicKey;

        // Sign the transaction
        transaction.sign(fromKeypair);
        const signedTransaction = transaction.serialize();
        const signature = await connection.sendRawTransaction(signedTransaction);
        
        // Confirm the transaction using the new method
        //const confirmationResult = await connection.confirmTransaction(signature, "finalized");
        
        const latestBlockHash = await connection.getLatestBlockhash()

        const confirmationResult = await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: signature,
            });
        
        console.log('Transaction successful with signature:', signature);
        console.log('Confirmation status:', confirmationResult.value);
        
        // // Sign transaction
        // transaction.feePayer = fromKeypair.publicKey;
        // let blockhash = (await connection.getRecentBlockhash()).blockhash;
        // transaction.recentBlockhash = blockhash;

        // // Sign transaction with the sender's private key
        // let signed = await transaction.sign([fromKeypair]);
        // let signature = await connection.sendRawTransaction(signed.serialize());
        // // await connection.confirmTransaction(signature);
        
        // console.log('Transaction successful with signature:', signature);
    };

    await sendTransaction().catch(console.error);


    return `buy corvus coin...`
};

export default buycoin;
