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
      await handleGetOrganization(req, res, session.user.name);
      break;
    case "PATCH":
      await handleEditOrganization(req, res, session.user.name);
      break;
    case "DELETE":
      await handleDeleteOrganization(req, res, session.user.name);
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
};

const handleGetOrganization = async (
  req: NextApiRequest,
  res: NextApiResponse,
  pubkey: string
) => {
  if (!req.query.id) {
    return res.status(400).json({ message: "Bad request" });
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: {
        id: req.query.id as string,
      },
      include: {
        members: {
          where: {
            profile: {
              pubkey,
            },
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json({ organization });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const handleEditOrganization = async (
  req: NextApiRequest,
  res: NextApiResponse,
  pubkey: string
) => {
  if (!req.query.id) {
    res.status(400).json({ message: "Bad request" });
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: {
        id: req.query.id as string,
      },
      include: {
        members: {
          where: {
            profile: {
              pubkey,
            },
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({ message: "Not found" });
    }

    console.log(req.body);

    const updatedOrganization = await prisma.organization.update({
      where: {
        id: req.query.id as string,
      },
      data: {
        name: req.body.name,
        fundsPubkey: req.body.fundsPubkey,
        website: req.body.website,
        twitter: req.body.twitter,
        logoUrl: req.body.logoUrl,
        acceptedTokens: req.body.acceptedTokens,
        tokenPubkeys: req.body.tokenPubkeys,
      },
    });

    return res.status(200).json({ organization: updatedOrganization });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const handleDeleteOrganization = async (
  req: NextApiRequest,
  res: NextApiResponse,
  pubkey: string
) => {
  if (!req.query.id) {
    res.status(400).json({ message: "Bad request" });
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: {
        id: req.query.id as string,
      },
      include: {
        members: {
          where: {
            profile: {
              pubkey,
            },
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({ message: "Not found" });
    }

    const deletedOrganization = await prisma.organization.delete({
      where: {
        id: req.query.id as string,
      },
    });

    return res.status(200).json({ organization: deletedOrganization });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export default handler;
