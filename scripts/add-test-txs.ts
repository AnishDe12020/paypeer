import { PrismaClient } from "@prisma/client";

const ORG_ID = "clc7khtal000bgzaacc87y8hp";
const TOKEN_PUBKEY = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export const prisma = new PrismaClient({
  log: ["query"],
});

const main = async () => {
  let tokenPubkey = TOKEN_PUBKEY;

  for (let i = 0; i < 50; i++) {
    if (i % 5 === 0) {
      tokenPubkey = Math.random().toString(36).substr(2, 44);
    }

    await prisma.transaction.create({
      data: {
        organizationId: ORG_ID,
        tokenPubkey,
        amount: Math.random() * 100,
        signature: Math.random().toString(36).substr(2, 88),
        reference: Math.random().toString(36).substr(2, 44),
        customerPubkey: Math.random().toString(36).substr(2, 44),
      },
    });
  }
};

main();
