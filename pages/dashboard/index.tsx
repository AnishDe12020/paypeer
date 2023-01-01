import { GetServerSideProps, NextPage } from "next";
import DashboardLayout from "../../src/layouts/DashboardLayout";
import {
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
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

  console.log(transactions);

  return (
    <DashboardLayout initialOrgs={orgs}>
      {transactions ? (
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
                {transactions.map((transaction) => (
                  <Tr key={transaction.id}>
                    <Td>{transaction.amount.toString()}</Td>
                    <Td>{transaction.customerPubkey}</Td>
                    <Td>
                      {format(new Date(transaction.createdAt), "PPPPpppp")}
                    </Td>
                    <Td>{transaction.reference}</Td>
                    <Td>{transaction.signature}</Td>
                    <Td>{transaction.messsage}</Td>
                  </Tr>
                ))}
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
