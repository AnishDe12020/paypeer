import { GetServerSideProps, NextPage } from "next";
import DashboardLayout from "../../src/layouts/DashboardLayout";
import {
  Box,
  Grid,
  GridItem,
  HStack,
  Icon,
  Image,
  Link,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Tab,
  Table,
  TableContainer,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
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
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { createNoSubstitutionTemplateLiteral } from "typescript";

interface DashboardPageProps {
  orgs: Organization[];
}

interface TokenAnalytics {
  sum: string;
  avg: string;
  count: number;
  date: string;
  tokenPubkey: string;
  usdPrice: number;
  totalInUSD: number;
  avgInUSD: number;
}

type DateAnalytics = Omit<
  TokenAnalytics,
  "sum" | "avg" | "tokenPubkey" | "usdPruce"
>;

interface Analytics {
  totalInUSD: number;
  avgInUSD: number;
  tokenAnalytics: TokenAnalytics[];
  dateAnalytics: DateAnalytics[];
  tokenPubkeys: string[];
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
      const { data: analyticsData } = await axios.get(
        `/api/transactions/analytics?organizationId=${queryKey[1]}`
      );

      return analyticsData;
    },
    { enabled: !!selectedOrg }
  );

  return (
    <DashboardLayout initialOrgs={orgs}>
      {analytics && (
        <Grid gap={8}>
          <Stat
            as={GridItem}
            backgroundColor="brand.secondary"
            rounded="xl"
            p={4}
          >
            <StatLabel>Sales (last 30 days)</StatLabel>
            <StatNumber>${analytics.totalInUSD.toFixed(2)}</StatNumber>
          </Stat>
          <GridItem>
            <Tabs variant="custom">
              <TabList mx={8}>
                <Tab>Last 7 Days</Tab>
                {tokenList &&
                  analytics.tokenPubkeys.map((tokenPubkey) => {
                    const token = tokenList.find(
                      (token) => token.address === tokenPubkey
                    );

                    return (
                      <HStack key={tokenPubkey} as={Tab} spacing={2}>
                        <Text>{token?.symbol}</Text>
                        <Image
                          src={token?.logoURI}
                          alt={token?.symbol}
                          boxSize="20px"
                          rounded="full"
                        />
                      </HStack>
                    );
                  })}
              </TabList>

              <TabPanels mt={8}>
                <TabPanel w="full">
                  <ResponsiveContainer width="100%" height={450}>
                    <AreaChart
                      data={analytics.dateAnalytics}
                      width={50}
                      height={150}
                    >
                      <CartesianGrid strokeDasharray={"3 3"} stroke="#454545" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => format(new Date(v), "MMM dd")}
                      />
                      <YAxis tickFormatter={(v) => `$${v}`} />
                      <ChartTooltip
                        cursor={{ fill: "#ffffff", fillOpacity: 0.5 }}
                        content={(props) => {
                          return (
                            props &&
                            props.payload &&
                            props.payload.length > 0 && (
                              <Box
                                bg="brand.primary"
                                border="1px solid"
                                borderColor="brand.secondary"
                                px={4}
                                py={2}
                                rounded="xl"
                              >
                                <Text>
                                  {format(
                                    new Date(props.payload[0].payload.date),
                                    "MMM dd"
                                  )}
                                </Text>

                                <Text color="#8884d8">
                                  Total sales: {props.payload[0].value}
                                </Text>
                                <Text color="#82ca9d">
                                  Avg sales: {props.payload[1].value}
                                </Text>
                              </Box>
                            )
                          );
                        }}
                      />

                      <defs>
                        <linearGradient
                          id="colorTotal"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8884d8"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#8884d8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorAvg"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#82ca9d"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#82ca9d"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <Area
                        type="monotone"
                        dataKey="totalInUSD"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                      />
                      <Area
                        type="monotone"
                        dataKey="avgInUSD"
                        stroke="#82ca9d"
                        fillOpacity={1}
                        fill="url(#colorAvg)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabPanel>

                {tokenList &&
                  analytics.tokenPubkeys.map((tokenPubkey) => {
                    const token = tokenList.find(
                      (token) => token.address === tokenPubkey
                    );

                    const data = analytics.tokenAnalytics.filter(
                      (token) => token.tokenPubkey === tokenPubkey
                    );

                    console.log(data);

                    return (
                      <TabPanel key={tokenPubkey}>
                        <ResponsiveContainer width="100%" height={450}>
                          <AreaChart width={50} height={150} data={data}>
                            <CartesianGrid
                              strokeDasharray={"3 3"}
                              stroke="#454545"
                            />
                            <XAxis
                              dataKey="date"
                              tickFormatter={(v) =>
                                format(new Date(v), "MMM dd")
                              }
                            />
                            <YAxis tickFormatter={(v) => `$${v}`} />
                            <ChartTooltip
                              cursor={{ fill: "#ffffff", fillOpacity: 0.5 }}
                              content={(props) => {
                                return (
                                  props &&
                                  props.payload &&
                                  props.payload.length > 0 && (
                                    <Box
                                      bg="brand.primary"
                                      border="1px solid"
                                      borderColor="brand.secondary"
                                      px={4}
                                      py={2}
                                      rounded="xl"
                                    >
                                      <Text>
                                        {format(
                                          new Date(
                                            props.payload[0].payload.date
                                          ),
                                          "MMM dd"
                                        )}
                                      </Text>

                                      <Text color="#8884d8">
                                        Total sales: {props.payload[0].value}
                                      </Text>
                                      <Text color="#82ca9d">
                                        Avg sales: {props.payload[1].value}
                                      </Text>
                                    </Box>
                                  )
                                );
                              }}
                            />

                            <defs>
                              <linearGradient
                                id="colorTotal"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#8884d8"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#8884d8"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                              <linearGradient
                                id="colorAvg"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#82ca9d"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#82ca9d"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>

                            <Area
                              type="monotone"
                              dataKey="avgInUSD"
                              stroke="#82ca9d"
                              fillOpacity={1}
                              fill="url(#colorAvg)"
                            />
                            <Area
                              type="monotone"
                              dataKey="totalInUSD"
                              stroke="#8884d8"
                              fillOpacity={1}
                              fill="url(#colorTotal)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </TabPanel>
                    );
                  })}
              </TabPanels>
            </Tabs>
          </GridItem>
        </Grid>
      )}
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
