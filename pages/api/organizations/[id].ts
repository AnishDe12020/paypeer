import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/lib/db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      await handleGetOrganization(req, res);
      break;
    case "PATCH":
      await handleEditOrganization(req, res);
      break;
    case "DELETE":
      await handleDeleteOrganization(req, res);
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
};

const handleGetOrganization = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (!req.query.id) {
    return res.status(400).json({ message: "Bad request" });
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: {
        id: req.query.id as string,
      },
    });

    return res.status(200).json({ organization });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const handleEditOrganization = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (!req.query.id) {
    res.status(400).json({ message: "Bad request" });
  }

  try {
    const organization = await prisma.organization.update({
      where: {
        id: req.query.id as string,
      },
      data: {
        name: req.body.name,
        fundsPubkey: req.body.fundsPubkey,
        website: req.body.website,
        twitter: req.body.twitter,
        logoUrl: req.body.logoUrl,
      },
    });

    return res.status(200).json({ organization });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const handleDeleteOrganization = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (!req.query.id) {
    res.status(400).json({ message: "Bad request" });
  }

  try {
    const organization = await prisma.organization.delete({
      where: {
        id: req.query.id as string,
      },
    });

    return res.status(200).json({ organization });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export default handler;
