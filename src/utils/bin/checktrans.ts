import config from '../../../config.json';
import React, { useEffect } from 'react';
import { PublicKey, Connection, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';


const checktrans = async (args: string[]): Promise<string> => {
  
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        

    const receivingWalletAddress = new PublicKey('76ow8U6zw4o4M8GZ8FYfoUjnVbkX1MUZz5ZoMzG3G5zA');

    async function checkIncomingTransactions() {
        const confirmedSignatures = await connection.getSignaturesForAddress(receivingWalletAddress, {
            limit: 1, // adjust based on expected traffic
            
        });
    
        for (const signatureInfo of confirmedSignatures) {
            const transaction = await connection.getConfirmedTransaction(signatureInfo.signature, 'finalized');
            if (transaction && transaction.transaction) {
                // Analyze the transaction to see if it meets the criteria (e.g., correct amount, correct token)                console.log(`$transaction`)
                //console.log(`${transaction.transaction}`)
            }
        }
    }

    await checkIncomingTransactions();
    
    return `checktrans...`
};

export default checktrans;
