import {
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Tooltip,
  Link,
  Image,
  Spinner,
  Button,
  VStack,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertTitle,
  useToast,
} from "@chakra-ui/react";
import { Organization, Transaction } from "@prisma/client";
import { findReference } from "@solana/pay";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import BigNumber from "bignumber.js";
import { format } from "date-fns";
import { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import useCluster from "../../src/hooks/useCluster";
import useSelectedOrganization from "../../src/hooks/useSelectedOrganization";
import DashboardLayout from "../../src/layouts/DashboardLayout";
import { prisma } from "../../src/lib/db";
import { truncateString } from "../../src/utils/truncate";
import { validateTransfer } from "../../src/utils/validateTransfer";
import { authOptions } from "../api/auth/[...nextauth]";

interface DashboardPendingPageProps {
  orgs: Organization[];
}

const DashboardPendingPage: NextPage<DashboardPendingPageProps> = ({
  orgs,
}) => {
  const { selectedOrg } = useSelectedOrganization();

  const { tokenList, usdcAddress } = useCluster();
  const { connection } = useConnection();

  const queryClient = useQueryClient();

  const [isCheckingTx, setIsCheckingTx] = useState(false);

  const toast = useToast();

  const { data: transactions, isLoading } = useQuery<Transaction[]>(
    ["transactions-pending", selectedOrg?.id],
    async ({ queryKey }) => {
      const txs = await axios.get(
        `/api/transactions?organizationId=${queryKey[1]}&txStatus=PENDING`
      );

      return txs.data.transactions;
    },
    { enabled: !!selectedOrg }
  );

  const checkTransaction = useCallback(
    async (reference: string, amount: number, txId: string) => {
      if (!selectedOrg?.fundsPubkey) {
        return;
      }

      setIsCheckingTx(true);

      try {
        // Check if there is any transaction for the reference
        const signatureInfo = await findReference(
          connection,
          new PublicKey(reference),
          {
            finality: "confirmed",
          }
        );

        const response = await validateTransfer(
          connection,
          signatureInfo.signature,
          {
            recipient: new PublicKey(selectedOrg.fundsPubkey),
            amount: new BigNumber(amount ?? 0),
            splToken: usdcAddress,
          },
          { commitment: "confirmed" }
        );

        const customerPubkey =
          response.transaction.message.accountKeys[0].toString();

        await axios.patch(
          `/api/transactions?organizationId=${selectedOrg.id}`,
          {
            txId,
            txStatus: "SUCCESS",
            customerPubkey,
            signature: signatureInfo.signature,
          }
        );

        await queryClient.refetchQueries([
          "transactions-pending",
          selectedOrg?.id,
        ]);

        await queryClient.refetchQueries(["transactions", selectedOrg?.id]);

        toast({
          title: "Transaction found and status updated",
          description: "The transaction status has been updated successfully",
          status: "success",
          isClosable: true,
        });
      } catch (e) {
        console.error("Unknown error", e);
      } finally {
        setIsCheckingTx(false);
      }
    },
    [
      connection,
      usdcAddress,
      selectedOrg?.fundsPubkey,
      selectedOrg?.id,
      queryClient,
    ]
  );

  return (
    <DashboardLayout initialOrgs={orgs}>
      <VStack mt={8} gap={8} w="full">
        <Alert status="info" rounded="lg">
          <VStack alignItems="start" gap={4}>
            <HStack>
              <AlertIcon />

              <AlertTitle>
                Checking for the status of these transactions failed
              </AlertTitle>
            </HStack>

            <AlertDescription>
              The following transactions may have succeeded or failed. Checking
              the status on the user&apos;s side failed for some reason and
              hence these are marked as Pending. You can recheck the status for
              the transacion and based on if it was successful or not, the
              status will be updated accordingly.
            </AlertDescription>
          </VStack>
        </Alert>

        {tokenList && transactions ? (
          transactions.length > 0 ? (
            <TableContainer w="full">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Amount</Th>
                    <Th>Timestamp</Th>
                    <Th>Reference</Th>
                    <Th>Message</Th>
                    <Th></Th>
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

                        <Td>{transaction.messsage}</Td>

                        <Td>
                          <Button
                            onClick={() =>
                              checkTransaction(
                                transaction.reference,
                                Number(transaction.amount),
                                transaction.id
                              )
                            }
                            isLoading={isCheckingTx}
                          >
                            Recheck Tx Status
                          </Button>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Text>No pending transactions!</Text>
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

export default DashboardPendingPage;
