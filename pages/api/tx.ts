// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { getRpc, getUSDCMint } from "../../utils/cluster";

// const MERCHANT_WALLET = new PublicKey(process.env.MERCHANT_WALLET as string);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      const label = req.query.shopName ?? "Test Merchant";
      const icon = req.query.shopLogo ?? "https://tenor.com/bKSc4.gif";

      res.status(200).send({
        label,
        icon,
      });
      break;
    case "POST":
      const buyerAccount = req.body.account;
      if (!buyerAccount) {
        res.status(400).json({
          error: "Missing account parameter",
        });
        return;
      }

      let amountQuery = req.query.amount;
      if (!amountQuery) {
        res.status(400).json({
          error: "Missing amount parameter",
        });
        return;
      }

      console.log("amountQuery", amountQuery);

      const amount = Number(amountQuery);

      if (amount <= 0) {
        res.status(400).json({
          error: "Amount must be greater than 0",
        });
        return;
      }

      const reference = req.query.reference;
      if (!reference) {
        res.status(400).json({
          error: "Missing reference parameter",
        });
        return;
      }

      const merchantAddress = req.query.merchantAddress;
      if (!merchantAddress) {
        res.status(400).json({
          error: "Missing merchantAddress parameter",
        });
        return;
      }

      const cluster = req.query.cluster;
      if (!cluster) {
        res.status(400).json({
          error: "Missing cluster parameter",
        });
        return;
      }

      const buyerPubkey = new PublicKey(buyerAccount);
      const merchantPubkey = new PublicKey(merchantAddress);

      const usdcAddress = getUSDCMint(cluster as string);

      console.log("buyer", buyerPubkey.toBase58());
      console.log("merchant", merchantPubkey.toBase58());
      console.log("splToken", usdcAddress.toBase58());

      const endpoint = getRpc(cluster as string);
      const connection = new Connection(endpoint);

      console.log("endpoint", endpoint);

      const usdcMint = await getMint(connection, usdcAddress);
      const buyerUsdcAddress = await getAssociatedTokenAddress(
        usdcAddress,
        buyerPubkey
      );
      const merchantUsdcAddress = await getAssociatedTokenAddress(
        usdcAddress,
        merchantPubkey
      );

      console.log("buyerUsdcAddress", buyerUsdcAddress.toBase58());
      console.log("merchantUsdcAddress", merchantUsdcAddress.toBase58());

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("finalized");

      const tx = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: buyerPubkey,
      });

      const transferIx = createTransferCheckedInstruction(
        buyerUsdcAddress,
        usdcAddress,
        merchantUsdcAddress,
        buyerPubkey,
        amount * 10 ** usdcMint.decimals,
        usdcMint.decimals
      );

      transferIx.keys.push({
        pubkey: new PublicKey(reference),
        isSigner: false,
        isWritable: false,
      });

      tx.add(transferIx);

      const serializedTx = tx.serialize({ requireAllSignatures: false });
      const base64Tx = serializedTx.toString("base64");

      res.status(200).send({
        transaction: base64Tx,
      });

      break;
    default:
      res.status(405).json({
        error:
          "Method not allowed. This API route only supports GET and POST requests",
      });
  }
};

export default handler;
