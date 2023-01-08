import {
  Heading,
  VStack,
  Text,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Button,
  HStack,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { Organization } from "@prisma/client";
import { encodeURL, TransactionRequestURLFields } from "@solana/pay";
import { Keypair } from "@solana/web3.js";
import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import useCluster from "../../../src/hooks/useCluster";
import useTransactionListener from "../../../src/hooks/useTransactionListener";
import BaseLayout from "../../../src/layouts/BaseLayout";
import { prisma } from "../../../src/lib/db";
import { TxStatus } from "../../../src/types/pay";

interface PayPageProps {
  org: Organization;
}

const PayPage: NextPage<PayPageProps> = ({ org }) => {
  const [amount, setAmount] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [txStatus, setTxStatus] = useState<TxStatus>();

  const toast = useToast();
  const router = useRouter();
  const { usdcAddress } = useCluster();

  const reference = useMemo(() => Keypair.generate().publicKey, []);

  useTransactionListener(
    reference,
    txStatus,
    org.fundsPubkey,
    amount,
    setTxStatus,
    async (signature, customerPubkey) => {
      const tx = await axios.put("/api/transactions", {
        organizationId: org.id,
        signature,
        reference: reference.toString(),
        amount,
        tokenPubkey: usdcAddress.toString(),
        customerPubkey: customerPubkey,
        message,
      });

      router.push(`/pay/${org.id}/success?txId=${tx.data.id}`);
    },

    async () => {
      const tx = await axios.put("/api/transactions", {
        organizationId: org.id,
        reference: reference.toString(),
        amount,
        tokenPubkey: usdcAddress.toString(),
        message,
      });

      router.push(`/pay/${org.id}/fail?txId=${tx.data.id}`);
    }
  );

  const pay = async () => {
    if (!amount) {
      toast({
        title: "Amount not specified",
        description: "Please enter the amount to continue",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const txApiParams = new URLSearchParams();
    if (router.query.cluster) {
      txApiParams.append("cluster", router.query.cluster as string);
    } else {
      console.error("Cluster not specified");
    }
    txApiParams.append("reference", reference.toString());
    txApiParams.append("amount", amount);
    if (message) {
      txApiParams.append("message", message);
    }

    const { location } = window;

    const apiUrl = `${location.protocol}//${location.host}/api/tx/${
      org.id
    }?${txApiParams.toString()}`;

    const txUrlParams: TransactionRequestURLFields = {
      link: new URL(apiUrl),
    };

    const url = encodeURL(txUrlParams);

    console.log("url", url);

    setTxStatus(TxStatus.PENDING);

    window.open(url);
  };

  return (
    <BaseLayout>
      <VStack gap={16}>
        <VStack gap={4}>
          <Heading textAlign="center">Pay {org.name}</Heading>
          <Text fontSize="xs">{org.fundsPubkey}</Text>
        </VStack>
        <VStack gap={4}>
          <FormControl isRequired>
            <FormLabel>Amount</FormLabel>
            <Input
              placeholder="5"
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
            />
            <FormHelperText>in USDC</FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>Message</FormLabel>
            <Input
              placeholder="Thank you for your purchase!"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />
            <FormHelperText>(Optional)</FormHelperText>
          </FormControl>

          <Button onClick={pay}>Pay</Button>

          <Text textAlign="center">
            Note: make sure you have sufficient funds in your wallet or else the
            transaction <b>will fail.</b>
          </Text>
        </VStack>
        {txStatus === TxStatus.PENDING && (
          <HStack gap={6}>
            <Text>Waiting for payment...</Text> <Spinner />
          </HStack>
        )}

        {txStatus === TxStatus.SUCCESS && (
          <Text textAlign="center">Payment successful!</Text>
        )}

        {txStatus === TxStatus.ERROR && (
          <Text textAlign="center">Payment failed.</Text>
        )}
      </VStack>
    </BaseLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const orgId = context.query.id as string;

  const org = await prisma.organization.findUnique({
    where: {
      id: orgId,
    },
  });

  return {
    props: {
      org: JSON.parse(JSON.stringify(org)),
    },
  };
};

export default PayPage;
