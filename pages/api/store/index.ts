import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/lib/db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      await handleGetStores(req, res);
      break;
    case "PUT":
      await handleCreateStore(req, res);
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
};

const handleGetStores = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!req.query.ownerPubkey) {
      res.status(400).json({ message: "Bad request" });
    }

    const stores = await prisma.store.findMany({
      where: {
        owner: {
          pubkey: req.query.ownerPubkey as string,
        },
      },
      include: {
        owner: true,
      },
    });

    return res.status(200).json({ data: stores });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const handleCreateStore = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.body.pubkey) {
    return res.status(400).json({ message: "Bad request" });
  }

  if (!req.body.name) {
    return res.status(400).json({ message: "Bad request" });
  }

  if (!req.body.fundsPubkey) {
    return res.status(400).json({ message: "Bad request" });
  }

  try {
    const store = await prisma.store.create({
      data: {
        name: req.body.name,
        fundsPubkey: req.body.fundsPubkey,
        owner: {
          connect: {
            pubkey: req.body.pubkey,
          },
        },
      },
    });

    return res.status(200).json(store);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export default handler;
