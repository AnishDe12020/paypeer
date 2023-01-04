import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { prisma } from "../../../src/lib/db";
import { authOptions } from "../auth/[...nextauth]";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.query.organizationId) {
    return res.status(400).json({ message: "Bad request" });
  }

  const session = await unstable_getServerSession(req, res, authOptions(req));

  if (!session?.user?.name) {
    return res.status(401).json({ message: "Unauthorized" });
  }

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

  const txAnalytics = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    _avg: {
      amount: true,
    },
    _count: true,
    where: {
      organizationId: req.query.organizationId as string,
    },
  });

  const txAnalyticsByToken = await prisma.transaction.groupBy({
    by: ["tokenPubkey"],
    _sum: {
      amount: true,
    },
    _avg: {
      amount: true,
    },
    _count: true,
    where: {
      organizationId: req.query.organizationId as string,
    },
  });

  res.status(200).json({ analytics: txAnalytics, byToken: txAnalyticsByToken });
};

export default handler;
