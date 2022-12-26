import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../src/lib/db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      await handleGetUser(req, res);
      break;
    case "PUT":
      await handleCreateUser(req, res);
      break;
    case "PATCH":
      handleEditUser(req, res);
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
};

const handleGetUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.query.pubkey) {
      const user = await prisma.user.findUnique({
        where: {
          pubkey: req.query.pubkey as string,
        },
      });

      return res.status(200).json(user);
    } else if (req.query.id) {
      const user = await prisma.user.findUnique({
        where: {
          id: req.query.id as string,
        },
      });

      return res.status(200).json({ data: user });
    } else {
      return res.status(400).json({ message: "Bad request" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const handleCreateUser = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.body.pubkey) {
    return res.status(400).json({ message: "Bad request" });
  }

  try {
    const user = await prisma.user.create({
      data: {
        pubkey: req.body.pubkey,
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const handleEditUser = (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ message: "PATCH user" });
};

export default handler;
