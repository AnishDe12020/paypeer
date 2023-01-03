import { GetServerSideProps, NextPage } from "next";
import DashboardLayout from "../../src/layouts/DashboardLayout";
import {
  HStack,
  Icon,
  Image,
  Link,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
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

interface DashboardPageProps {
  orgs: Organization[];
}

const DashboardPage: NextPage<DashboardPageProps> = ({ orgs }) => {
  const { selectedOrg, setSelectedOrg } = useSelectedOrganization();

  const { data: transactions, isLoading } = useQuery<Transaction[]>(
    ["transactions", selectedOrg?.id],
    async ({ queryKey }) => {
      const res = await axios.get(
        `/api/transactions?organizationId=${queryKey[1]}`
      );

      return res.data.transactions;
    },
    { enabled: !!selectedOrg }
  );

  const { tokenList } = useCluster();

  return (
    <DashboardLayout initialOrgs={orgs}>
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
                              href={`https://solscan.io/address/${token?.address}`}
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
