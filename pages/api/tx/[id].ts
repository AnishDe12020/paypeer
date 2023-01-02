// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { Connection, PublicKey } from "@solana/web3.js";

import { getRpc, getUSDCAddress } from "../../../src/utils/cluster";
import { createTransfer } from "@solana/pay";
import BigNumber from "bignumber.js";
import { prisma } from "../../../src/lib/db";

// const MERCHANT_WALLET = new PublicKey(process.env.MERCHANT_WALLET as string);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const org = await prisma.organization.findUnique({
    where: {
      id: req.query.id as string,
    },
  });

  if (!org) {
    res.status(404).json({
      error: "Organization not found",
    });
    return;
  }

  switch (req.method) {
    case "GET":
      const label = org.name;
      const icon = org.logoUrl;

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

      const amount = new BigNumber(amountQuery as string);

      if (amount.isLessThanOrEqualTo(0)) {
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

      const cluster = req.query.cluster;
      if (!cluster) {
        res.status(400).json({
          error: "Missing cluster parameter",
        });
        return;
      }

      const buyerPubkey = new PublicKey(buyerAccount);
      const merchantPubkey = new PublicKey(org.fundsPubkey);

      const usdcAddress = getUSDCAddress(cluster as string);

      console.log("buyer", buyerPubkey.toBase58());
      console.log("merchant", merchantPubkey.toBase58());
      console.log("splToken", usdcAddress.toBase58());

      const endpoint = getRpc(cluster as string);
      const connection = new Connection(endpoint);

      console.log("endpoint", endpoint);

      const tx = await createTransfer(connection, buyerPubkey, {
        recipient: merchantPubkey,
        amount,
        reference: new PublicKey(reference as string),
        splToken: usdcAddress,
      });

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
