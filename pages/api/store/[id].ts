import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/lib/db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      await handleGetStore(req, res);
      break;
    case "PATCH":
      await handleEditStore(req, res);
      break;
    case "DELETE":
      await handleDeleteStore(req, res);
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
};

const handleGetStore = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!req.query.id) {
      res.status(400).json({ message: "Bad request" });
    }

    const store = await prisma.store.findMany({
      where: {
        id: req.query.id as string,
      },
      include: {
        owner: true,
      },
    });

    return res.status(200).json({ data: store });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const handleEditStore = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.body.id) {
    return res.status(400).json({ message: "Bad request" });
  }

  if (!req.body.name) {
    return res.status(400).json({ message: "Bad request" });
  }

  if (!req.body.fundsPubkey) {
    return res.status(400).json({ message: "Bad request" });
  }

  try {
    const store = await prisma.store.update({
      where: {
        id: req.body.id,
      },
      data: {
        name: req.body.name,
        fundsPubkey: req.body.fundsPubkey,
      },
    });

    return res.status(200).json({ data: store });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const handleDeleteStore = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.body.id) {
    return res.status(400).json({ message: "Bad request" });
  }

  try {
    const store = await prisma.store.delete({
      where: {
        id: req.body.id,
      },
    });

    return res.status(200).json({ data: store });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export default handler;
