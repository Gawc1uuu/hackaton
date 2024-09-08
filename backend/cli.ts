#!/usr/bin/env ts-node

import { ethers } from 'ethers';
import { writeFileSync, readFileSync } from 'fs';
import axios from 'axios';
import io from 'socket.io-client';

const AVAILABLE_COMMANDS = ['trade', 'setup', 'register'];

async function main() {
    const commandName = process.argv[2];

    if (!AVAILABLE_COMMANDS.includes(commandName)) {
        console.error('Invalid command');
        process.exit(1);
    }

    if (commandName === 'trade') {
        await handleTrade();
    } else if (commandName === 'setup') {
        await handleSetup();
    } else if (commandName === 'register') {
        await registerUser();
    }

    // Remove this process.exit(0); call
    // process.exit(0);
}


async function handleSetup() {
    const keystoreFile = "keys.json";
    const eoaPrivateKey = process.argv[4];
    const randomWallet = ethers.Wallet.createRandom();

    writeFileSync(keystoreFile, JSON.stringify({
        address: randomWallet.address,
        privateKey: randomWallet.privateKey,
    }));

    console.log('Keystore file created:', keystoreFile);

    // Submitting registration tx

    // Notify server about new registration
}

async function handleTrade() {
    const keystoreFile = "keys.json";

    // Load private key from keystore
    const keystore = JSON.parse(readFileSync(keystoreFile).toString());

    const privKey = keystore.privateKey;

    const wallet = new ethers.Wallet(privKey);

    // === Retrieve trade params

    const nonce = await getCurrentNonce(wallet.address);     // Get current nonce
    const amount = process.argv[4];
    const leverage = process.argv[5];
    const expiry = process.argv[6];
    const pair = process.argv[7];
    const price = process.argv[8];

    // ABI encode trade params
    const encodedPayload = ethers.AbiCoder.defaultAbiCoder().encode(
        ['string', 'uint256', 'uint256', 'string', 'uint256'],
        [amount, leverage, expiry, pair, price]
    );

    // Hash encoded payload
    const hash = ethers.keccak256(encodedPayload);

    // Sign hash
    const signature = await wallet.signMessage(hash);

    const tradeParams = {
        amount,
        leverage,
        expiry,
        pair,
        price,
        signature,
    };

    // Submit trade
    await submitTradeToServer(tradeParams);
}

async function registerUser() {

    const socket = io('ws://localhost:3000');

    const keystoreFile = "keys.json";
    const keystore = JSON.parse(readFileSync(keystoreFile).toString());
    const privKey = keystore.privateKey;
    const wallet = new ethers.Wallet(privKey);
    const message = `I sign this message ${wallet.address}`;

    // Sign message
    const signature = await wallet.signMessage(message);
    const walletAddress = wallet.address;

    console.log("signature", signature);

    // Emit the REGISTER event after connection is established
    socket.emit("REGISTER", {
        walletAddress,
        signature,
        sessionPubKey: walletAddress,
    });

    // Keep the process alive for 10 seconds to ensure the event is handled
    setTimeout(() => {
        console.log("Exiting after 10 seconds...");
        process.exit(0);  // Now exit the process after 10 seconds
    }, 10000);
}

async function getCurrentNonce(walletAddress: string) {
    const { data } = await axios.get(`http://localhost:3000/users/${walletAddress}`);
    return data.nonce;
}

async function submitTradeToServer(tradeParams: any) {
    // Submit trade to server
    const socket = io('ws://localhost:3000');

    socket.emit("MAKE_TRADE", tradeParams);

    setTimeout(() => {
        console.log("Exiting after 10 seconds...");
        process.exit(0);  // Now exit the process after 10 seconds
    }, 10000);
}

main();
