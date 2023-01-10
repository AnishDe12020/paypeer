import { GetServerSideProps, NextPage } from "next";
import DashboardLayout from "../../src/layouts/DashboardLayout";
import {
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

import { Analytics } from "../../src/types/analytics";
import Chart from "../../src/components/Dashboard/Chart";
import { SuccessFullTransaction } from "../../src/types/model";

interface DashboardPageProps {
  orgs: Organization[];
}

const DashboardPage: NextPage<DashboardPageProps> = ({ orgs }) => {
  const { selectedOrg, setSelectedOrg } = useSelectedOrganization();

  const { tokenList } = useCluster();

  const { data: transactions, isLoading } = useQuery<SuccessFullTransaction[]>(
    ["transactions", selectedOrg?.id],
    async ({ queryKey }) => {
      const txs = await axios.get(
        `/api/transactions?organizationId=${queryKey[1]}`
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
        <VStack gap={8} w="full">
          <Grid
            w="full"
            gap={4}
            templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
          >
            <Stat
              backgroundColor="brand.secondary"
              rounded="xl"
              p={4}
              w="full"
              as={GridItem}
            >
              <StatLabel>Total Sales (last 7 days)</StatLabel>
              <StatNumber>${analytics.totalInUSD.toFixed(2)}</StatNumber>
            </Stat>

            <Stat
              backgroundColor="brand.secondary"
              rounded="xl"
              p={4}
              w="full"
              as={GridItem}
            >
              <StatLabel>Average Sales (last 7 days)</StatLabel>
              <StatNumber>${analytics.avgInUSD.toFixed(2)}</StatNumber>
            </Stat>

            <Stat
              backgroundColor="brand.secondary"
              rounded="xl"
              p={4}
              w="full"
              as={GridItem}
            >
              <StatLabel>Transactions (last 7 days)</StatLabel>
              <StatNumber>{analytics.totalSales}</StatNumber>
            </Stat>
          </Grid>
          <Tabs
            variant="custom"
            w="full"
            alignItems="center"
            display="flex"
            flexDir="column"
          >
            <TabList overflowX="auto" maxW={{ base: 80, md: "fit-content" }}>
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

            <TabPanels mt={8} w="full">
              <TabPanel w="full" px={{ base: 0, md: 8 }}>
                <Chart data={analytics.dateAnalytics} />
              </TabPanel>

              {tokenList &&
                analytics.tokenPubkeys.map((tokenPubkey) => {
                  const data = analytics.tokenAnalytics.filter(
                    (token) => token.tokenPubkey === tokenPubkey
                  );

                  return (
                    <TabPanel
                      key={tokenPubkey}
                      w="full"
                      px={{ base: 0, md: 8 }}
                    >
                      <Chart data={data} />
                    </TabPanel>
                  );
                })}
            </TabPanels>
          </Tabs>
        </VStack>
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
                          <HStack w={24}>
                            <Text>
                              {Number(transaction.amount).toFixed(2).toString()}
                            </Text>
                            <Tooltip label={token?.symbol}>
                              <Link
                                href={`https://solscan.io/address/${transaction.tokenPubkey}`}
                                isExternal
                              >
                                <Image
                                  src={token?.logoURI}
                                  alt={token?.symbol}
                                  boxSize="20px"
                                  rounded="full"
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
