import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../src/lib/db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      await handleGetProfile(req, res);
      break;
    case "PUT":
      await handleCreateProfile(req, res);
      break;
    case "PATCH":
      handleEditProfile(req, res);
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
};

const handleGetProfile = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.query.pubkey) {
      const profile = await prisma.profile.findUnique({
        where: {
          pubkey: req.query.pubkey as string,
        },
      });

      return res.status(200).json({ profile });
    } else if (req.query.id) {
      const profile = await prisma.profile.findUnique({
        where: {
          id: req.query.id as string,
        },
      });

      return res.status(200).json({ profile });
    } else {
      return res.status(400).json({ message: "Bad request" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const handleCreateProfile = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (!req.body.pubkey) {
    return res.status(400).json({ message: "Bad request" });
  }

  try {
    const profile = await prisma.profile.create({
      data: {
        pubkey: req.body.pubkey,
        name: req.body.name,
        email: req.body.email,
        avatarUrl: req.body.avatarUrl,
      },
    });

    return res.status(200).json({ profile });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const handleEditProfile = (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.query.pubkey) {
    return res.status(400).json({ message: "Bad request" });
  }

  try {
    const profile = prisma.profile.update({
      where: {
        pubkey: req.query.pubkey as string,
      },
      data: {
        name: req.body.name,
        email: req.body.email,
        avatarUrl: req.body.avatarUrl,
      },
    });

    return res.status(200).json({ profile });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export default handler;
