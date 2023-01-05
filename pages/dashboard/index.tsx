import { GetServerSideProps, NextPage } from "next";
import DashboardLayout from "../../src/layouts/DashboardLayout";
import {
  Grid,
  HStack,
  Icon,
  Image,
  Link,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { authOptions } from "../api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { prisma } from "../../src/lib/db";
import { Organization, Transaction } from "@prisma/client";
import { useQuery } from "react-query";
import useSelectedOrganization from "../../src/hooks/useSelectedOrganization";
import axios from "axios";
import { format } from "date-fns";
import useCluster from "../../src/hooks/useCluster";
import { truncateString } from "../../src/utils/truncate";
import { ExternalLink } from "lucide-react";
import { JUPITER_PRICE_API } from "../../src/utils/constants";

interface DashboardPageProps {
  orgs: Organization[];
}

interface AnalyticsResponse {
  _sum: {
    amount: number;
  };
  _avg: {
    amount: number;
  };
  _count: number;
}

interface TokenAnalyticsResponse extends AnalyticsResponse {
  tokenPubkey: string;
}

interface AnalyticsResponse {
  all: AnalyticsResponse;
  tokenAnalytics: TokenAnalyticsResponse[];
}

interface TokenAnalytics {
  price: number;
  amount: number;
  avg: number;
  amountInUSD: number;
  avgInUSD: number;
  count: number;
}

interface Analytics {
  all: {
    totalSales: number;
    avgSales: number;
  };
  tokenAnalytics: TokenAnalytics[];
}

const DashboardPage: NextPage<DashboardPageProps> = ({ orgs }) => {
  const { selectedOrg, setSelectedOrg } = useSelectedOrganization();

  const { tokenList } = useCluster();

  const { data: transactions, isLoading } = useQuery<Transaction[]>(
    ["transactions", selectedOrg?.id],
    async ({ queryKey }) => {
      const txs = await axios.get(
        `/api/transactions?organizationId=${queryKey[1]}`
      );

      const analytics = await axios.get(
        `/api/transactions/analytics?organizationId=${queryKey[1]}`
      );

      return txs.data.transactions;
    },
    { enabled: !!selectedOrg }
  );

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>(
    ["analytics", selectedOrg?.id],
    async ({ queryKey }) => {
      const { data: analyticsData } = await axios.get<AnalyticsResponse>(
        `/api/transactions/analytics?organizationId=${queryKey[1]}`
      );

      const tokens = analyticsData.tokenAnalytics.map(
        (token) => token.tokenPubkey
      );

      const {
        data: { data: prices },
      } = await axios.get(`${JUPITER_PRICE_API}?ids=${tokens.join(",")}`);

      const tokenAnalytics = analyticsData.tokenAnalytics.map((token) => ({
        price: prices[token.tokenPubkey].price,
        amount: token._sum.amount,
        avg: token._avg.amount,
        amountInUSD: token._sum.amount * prices[token.tokenPubkey].price,
        avgInUSD: token._avg.amount * prices[token.tokenPubkey].price,
        count: token._count,
      }));

      const totalSales = tokenAnalytics.reduce(
        (acc, token) => acc + token.amountInUSD,
        0
      );

      const avgSales =
        tokenAnalytics.reduce((acc, token) => acc + token.avgInUSD, 0) /
        tokenAnalytics.length;

      return {
        all: {
          totalSales,
          avgSales,
        },
        tokenAnalytics,
      };
    },
    { enabled: !!selectedOrg }
  );

  console.log("analytics", analytics);

  return (
    <DashboardLayout initialOrgs={orgs}>
      <Grid>
        {analytics && (
          <Stat backgroundColor="brand.secondary" rounded="xl" p={4}>
            <StatLabel>Sales (last 30 days)</StatLabel>
            <StatNumber>${analytics.all.totalSales}</StatNumber>
          </Stat>
        )}
      </Grid>
      <VStack mt={16}>
        {tokenList && transactions ? (
          transactions.length > 0 ? (
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Amount</Th>
                    <Th>From</Th>
                    <Th>Timestamp</Th>
                    <Th>Reference</Th>
                    <Th>Signature</Th>
                    <Th>Message</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {transactions.map((transaction) => {
                    const token = tokenList.find(
                      (token) => token.address === transaction.tokenPubkey
                    );

                    return (
                      <Tr key={transaction.id}>
                        <Td>
                          <HStack>
                            <Text>{transaction.amount.toString()}</Text>
                            <Tooltip label={token?.symbol}>
                              <Link
                                href={`https://solscan.io/address/${transaction.tokenPubkey}`}
                                isExternal
                              >
                                <Image
                                  src={token?.logoURI}
                                  alt={token?.symbol}
                                  boxSize="20px"
                                />
                              </Link>
                            </Tooltip>
                          </HStack>
                        </Td>
                        <Td>
                          <Tooltip label={transaction.customerPubkey}>
                            <Link
                              href={`https://solscan.io/address/${transaction.customerPubkey}`}
                              isExternal
                            >
                              <HStack>
                                <Text>
                                  {truncateString(transaction.customerPubkey)}
                                </Text>
                                <Icon as={ExternalLink} />
                              </HStack>
                            </Link>
                          </Tooltip>
                        </Td>
                        <Td>
                          <Tooltip
                            label={format(
                              new Date(transaction.createdAt),
                              "PPPPpppp"
                            )}
                          >
                            <Text>
                              {format(new Date(transaction.createdAt), "MMM")}{" "}
                              {format(new Date(transaction.createdAt), "dd")}{" "}
                              {format(new Date(transaction.createdAt), "yyyy")}
                            </Text>
                          </Tooltip>
                        </Td>
                        <Td>
                          <Tooltip label={transaction.reference}>
                            <Text>{truncateString(transaction.reference)}</Text>
                          </Tooltip>
                        </Td>
                        <Td>
                          <Tooltip label={transaction.signature}>
                            <Link
                              href={`https://solscan.io/tx/${transaction.signature}`}
                              isExternal
                            >
                              <HStack>
                                <Text>
                                  {truncateString(transaction.signature)}
                                </Text>
                                <Icon as={ExternalLink} />
                              </HStack>
                            </Link>
                          </Tooltip>
                        </Td>
                        <Td>{transaction.messsage}</Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Text>No transactions yet</Text>
          )
        ) : (
          <Spinner />
        )}
      </VStack>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions(context.req)
  );

  console.log(session);

  if (!session?.user?.name) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  const orgs = await prisma.organization.findMany({
    where: {
      members: {
        some: {
          profile: {
            pubkey: session.user.name,
          },
        },
      },
    },
  });

  return {
    props: { orgs: JSON.parse(JSON.stringify(orgs)) },
  };
};

export default DashboardPage;
