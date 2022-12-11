// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import {
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const splToken = new PublicKey(process.env.USDC_MINT as string);
const MERCHANT_WALLET = new PublicKey(process.env.MERCHANT_WALLET as string);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      const label = "Test Merchant";
      const icon = "https://tenor.com/bKSc4.gif";

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

      const amount = req.body.amount;
      if (!amount) {
        res.status(400).json({
          error: "Missing amount parameter",
        });
        return;
      }

      if (amount <= 0) {
        res.status(400).json({
          error: "Amount must be greater than 0",
        });
        return;
      }

      const reference = req.body.reference;
      if (!reference) {
        res.status(400).json({
          error: "Missing reference parameter",
        });
        return;
      }

      const buyerPubkey = new PublicKey(buyerAccount);

      const network = WalletAdapterNetwork.Devnet;
      const endpoint = clusterApiUrl(network);
      const connection = new Connection(endpoint);

      const usdcMint = await getMint(connection, splToken);
      const buyerUsdcAddress = await getAssociatedTokenAddress(
        splToken,
        buyerPubkey
      );
      const merchantUsdcAddress = await getAssociatedTokenAddress(
        splToken,
        MERCHANT_WALLET
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("finalized");

      const tx = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: buyerPubkey,
      });

      const transferIx = createTransferCheckedInstruction(
        buyerUsdcAddress,
        splToken,
        merchantUsdcAddress,
        buyerPubkey,
        amount * 10 ** usdcMint.decimals,
        usdcMint.decimals
      );

      transferIx.keys.push({
        pubkey: reference,
        isSigner: false,
        isWritable: false,
      });

      tx.add(transferIx);

      const serializedTx = tx.serialize({ requireAllSignatures: false });
      const base64Tx = serializedTx.toString("base64");

      res.status(200).send({
        tx: base64Tx,
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
