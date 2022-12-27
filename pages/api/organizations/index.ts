import { createRemoteJWKSet, jwtVerify } from "jose";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/lib/db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.query.pubkey) {
    return res.status(400).json({ message: "Bad request" });
  }

  const idToken = req.headers.authorization?.split(" ")[1];

  const jwks = createRemoteJWKSet(new URL("https://authjs.web3auth.io/jwks"));

  const jwtDecoded = await jwtVerify(idToken, jwks, { algorithms: ["ES256"] });

  if (!((jwtDecoded.payload as any).wallets[0].address = req.query.pubkey)) {
    res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      await handleGetOrganizations(req, res);
      break;
    case "PUT":
      await handleCreateOrganization(req, res);
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
};

const handleGetOrganizations = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (!req.query.pubkey) {
    return res.status(400).json({ message: "Bad request" });
  }

  try {
    const organizations = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            profile: {
              pubkey: req.query.pubkey as string,
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
  res: NextApiResponse
) => {
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
                pubkey: req.body.pubkey,
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
