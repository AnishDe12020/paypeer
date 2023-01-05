import { PrismaClient } from "@prisma/client";
import { Keypair } from "@solana/web3.js";

const ORG_ID = "clc7khtal000bgzaacc87y8hp";
// const TOKEN_PUBKEY = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC
// const TOKEN_PUBKEY = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"; // BONK
// const TOKEN_PUBKEY = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"; // USDT
const TOKEN_PUBKEY = "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y"; // SHDW
const CUSTOMER_PUBKEY = Keypair.generate().publicKey.toBase58();

export const prisma = new PrismaClient({
  log: ["query"],
});

const main = async () => {
  for (let i = 0; i < 40; i++) {
    await prisma.transaction.create({
      data: {
        organizationId: ORG_ID,
        tokenPubkey: TOKEN_PUBKEY,
        amount: Math.random() * 50,
        signature: Math.random().toString(36).substr(2, 88),
        reference: Math.random().toString(36).substr(2, 44),
        customerPubkey: CUSTOMER_PUBKEY,
        // new date in last 7 days
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
        ),
      },
    });
  }
};

main();
