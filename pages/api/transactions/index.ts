import { Connection, PublicKey } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { prisma } from "../../../src/lib/db";
import { authOptions } from "../auth/[...nextauth]";
import { getRpc } from "../../../src/utils/cluster";
import { validateTransfer } from "../../../src/utils/validateTransfer";
import { Decimal } from "@prisma/client/runtime";
import { TransactionStatus } from "@prisma/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      await handleGetTransactions(req, res);
      break;
    case "PUT":
      await handleAddTransaction(req, res);
      break;
    case "PATCH":
      await handlePatchTransaction(req, res);
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
};

const handleGetTransactions = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (!req.query.organizationId) {
    return res.status(400).json({ message: "Bad request" });
  }

  const session = await unstable_getServerSession(req, res, authOptions(req));

  if (!session?.user?.name) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // check if authenticated user is a member of the organization
    const organization = await prisma.organization.findUnique({
      where: {
        id: req.query.organizationId as string,
      },
      include: {
        members: {
          where: {
            profile: {
              pubkey: session.user.name,
            },
          },
        },
      },
    });

    if (!organization?.members?.length) {
      return res.status(404).json({ message: "Not found" });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        organizationId: req.query.organizationId as string,
        status: req.query.txStatus
          ? (req.query.txStatus as TransactionStatus)
          : "SUCCESS",
      },
    });

    return res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const handleAddTransaction = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (!req.body.organizationId) {
    return res.status(400).json({ message: "Bad request" });
  }

  if (!req.body.amount) {
    return res.status(400).json({ message: "Bad request" });
  }

  if (!req.body.tokenPubkey) {
    return res.status(400).json({ message: "Bad request" });
  }

  if (!req.body.reference) {
    return res.status(400).json({ message: "Bad request" });
  }

  try {
    // check if organization exists
    const organization = await prisma.organization.findUnique({
      where: {
        id: req.body.organizationId,
      },
    });

    if (!organization) {
      return res.status(404).json({ message: "Organization Not found" });
    }

    // validate if transaction is valid
    const connection = new Connection(
      getRpc(
        req.query.cluster ? (req.query.cluster as string) : "mainnet-beta"
      ),
      "confirmed"
    );

    const resp = await validateTransfer(
      connection,
      req.body.signature,
      {
        amount: req.body.amount,
        splToken: new PublicKey(req.body.tokenPubkey),
        recipient: new PublicKey(organization.fundsPubkey),
      },
      { commitment: "confirmed" }
    );

    if (req.body.signature && req.body.customerPubkey) {
      const transaction = await prisma.transaction.create({
        data: {
          organizationId: req.body.organizationId,
          signature: req.body.signature,
          reference: req.body.reference,
          amount: new Decimal(req.body.amount),
          tokenPubkey: req.body.tokenPubkey,
          customerPubkey: req.body.customerPubkey,
          messsage: req.body.message,
          status: "SUCCESS",
        },
      });

      return res.status(200).json({ transaction });
    } else {
      const transaction = await prisma.transaction.create({
        data: {
          organizationId: req.body.organizationId,
          amount: new Decimal(req.body.amount),
          tokenPubkey: req.body.tokenPubkey,
          messsage: req.body.message,
          status: "PENDING",
          reference: req.body.reference,
        },
      });

      return res.status(200).json({ transaction });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const handlePatchTransaction = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (!req.body.txId) {
    return res.status(400).json({ message: "Bad request" });
  }

  if (!req.body.txStatus) {
    return res.status(400).json({ message: "Bad request" });
  }

  if (!req.body.signature) {
    return res.status(400).json({ message: "Bad request" });
  }

  if (!req.body.customerPubkey) {
    return res.status(400).json({ message: "Bad request" });
  }

  const session = await unstable_getServerSession(req, res, authOptions(req));

  if (!session?.user?.name) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // check if authenticated user is a member of the organization
    const organization = await prisma.organization.findUnique({
      where: {
        id: req.query.organizationId as string,
      },
      include: {
        members: {
          where: {
            profile: {
              pubkey: session.user.name,
            },
          },
        },
      },
    });

    if (!organization?.members?.length) {
      return res.status(404).json({ message: "Not found" });
    }

    console.log("id", req.body.txId);

    const transaction = await prisma.transaction.update({
      where: {
        id: req.body.txId,
      },
      data: {
        signature: req.body.signature,
        customerPubkey: req.body.customerPubkey,
        status: req.body.txStatus,
      },
    });

    return res.status(200).json({ transaction });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export default handler;
