import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { prisma } from "../../../src/lib/db";
import { authOptions } from "../auth/[...nextauth]";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions(req));

  if (!session?.user?.name) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      await handleGetOrganizations(req, res, session.user.name);
      break;
    case "PUT":
      await handleCreateOrganization(req, res, session.user.name);
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
};

const handleGetOrganizations = async (
  req: NextApiRequest,
  res: NextApiResponse,
  pubkey: string
) => {
  try {
    const organizations = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            profile: {
              pubkey,
            },
          },
        },
      },
    });

    return res.status(200).json({ organizations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const handleCreateOrganization = async (
  req: NextApiRequest,
  res: NextApiResponse,
  pubkey: string
) => {
  if (!req.body.name) {
    return res.status(400).json({ message: "Bad request" });
  }

  if (!req.body.fundsPubkey) {
    return res.status(400).json({ message: "Bad request" });
  }

  try {
    const organization = await prisma.organization.create({
      data: {
        name: req.body.name,
        fundsPubkey: req.body.fundsPubkey,
        website: req.body.website,
        twitter: req.body.twitter,
        logoUrl: req.body.logoUrl,
        members: {
          create: {
            role: "OWNER",
            profile: {
              connect: {
                pubkey,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({ organization });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export default handler;
