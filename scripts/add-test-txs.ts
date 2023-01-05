import { PrismaClient } from "@prisma/client";
import { Keypair } from "@solana/web3.js";

const ORG_ID = "clc7khtal000bgzaacc87y8hp";
const TOKEN_PUBKEY = "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y";
const CUSTOMER_PUBKEY = Keypair.generate().publicKey.toBase58();

export const prisma = new PrismaClient({
  log: ["query"],
});

const main = async () => {
  for (let i = 0; i < 10; i++) {
    await prisma.transaction.create({
      data: {
        organizationId: ORG_ID,
        tokenPubkey: TOKEN_PUBKEY,
        amount: Math.random() * 50,
        signature: Math.random().toString(36).substr(2, 88),
        reference: Math.random().toString(36).substr(2, 44),
        customerPubkey: CUSTOMER_PUBKEY,
      },
    });
  }
};

main();
