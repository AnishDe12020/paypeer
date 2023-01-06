import axios from "axios";
import { format } from "date-fns";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/lib/db";
import { JUPITER_PRICE_API } from "../../../src/utils/constants";

interface ByToken {
  sum: string;
  avg: string;
  count: number;
  tokenPubkey: string;
  date: string;
}

interface ByDate {
  totalInUSD: number;
  avgInUSD: number;
  count: number;
  date: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // if (!req.query.organizationId) {
  //   return res.status(400).json({ message: "Bad request" });
  // }

  // const session = await unstable_getServerSession(req, res, authOptions(req));

  // if (!session?.user?.name) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }

  // // check if authenticated user is a member of the organization
  // const organization = await prisma.organization.findUnique({
  //   where: {
  //     id: req.query.organizationId as string,
  //   },
  //   include: {
  //     members: {
  //       where: {
  //         profile: {
  //           pubkey: session.user.name,
  //         },
  //       },
  //     },
  //   },
  // });

  // if (!organization?.members?.length) {
  //   return res.status(404).json({ message: "Not found" });
  // }

  const byTokenAndDate = await prisma.$queryRaw<
    ByToken[]
  >`SELECT SUM("public"."Transaction"."amount"), AVG("public"."Transaction"."amount"), COUNT("public"."Transaction"."amount")::INT, date("public"."Transaction"."createdAt"), "public"."Transaction"."tokenPubkey" FROM "public"."Transaction" WHERE "public"."Transaction"."organizationId" = ${
    req.query.organizationId as string
  } GROUP BY "public"."Transaction"."tokenPubkey", date("createdAt")`;

  const tokenPubkeysWithDups = byTokenAndDate.map((token) => token.tokenPubkey);

  // remove dups
  const tokenPubkeys = [...new Set(tokenPubkeysWithDups)];

  const {
    data: { data: prices },
  } = await axios.get(`${JUPITER_PRICE_API}?ids=${tokenPubkeys.join(",")}`);

  const byTokenAndDateWithUSDPrice = byTokenAndDate.map((tx) => ({
    ...tx,
    usdPrice: prices[tx.tokenPubkey].price,
    totalInUSD: Number(tx.sum) * prices[tx.tokenPubkey].price,
    avgInUSD: Number(tx.avg) * prices[tx.tokenPubkey].price,
  }));

  const byDateWithUSDPrice = byTokenAndDateWithUSDPrice.reduce((acc, token) => {
    const date = format(new Date(token.date), "yyyy-MM-dd");
    const tokenTotalInUSD = token.totalInUSD;
    const tokenAvgInUSD = token.avgInUSD;
    const count = token.count;

    if (acc[date]) {
      acc[date].totalInUSD += tokenTotalInUSD;
      acc[date].avgInUSD += tokenAvgInUSD;
      acc[date].count += count;
    } else {
      acc[date] = {
        totalInUSD: tokenTotalInUSD,
        avgInUSD: tokenAvgInUSD,
        count,
      };
    }

    return acc;
  }, {} as Record<string, Omit<ByDate, "date">>);

  const byDateWithUSDPriceArr = Object.entries(byDateWithUSDPrice).map(
    ([date, data]) => ({
      date,
      ...data,
    })
  );

  const totalInUSD = byDateWithUSDPriceArr.reduce(
    (acc: number, data) => acc + data.totalInUSD,
    0
  );

  const avgInUSD =
    totalInUSD /
    byDateWithUSDPriceArr.reduce((acc: number, data) => acc + data.count, 0);

  return res.status(200).json({
    tokenAnalytics: byTokenAndDateWithUSDPrice,
    totalInUSD,
    avgInUSD,
    dateAnalytics: byDateWithUSDPriceArr,
    tokenPubkeys,
  });
};

export default handler;
