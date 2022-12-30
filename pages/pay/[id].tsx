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
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import BaseLayout from "../../src/layouts/BaseLayout";
import { prisma } from "../../src/lib/db";

interface PayPageProps {
  org: Organization;
}

enum TxStatus {
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error",
}

const PayPage: NextPage<PayPageProps> = ({ org }) => {
  const [amount, setAmount] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [reference, setReference] = useState<string | undefined>();
  const [txStatus, setTxStatus] = useState<TxStatus>();

  const toast = useToast();
  const router = useRouter();

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

    const ref = Keypair.generate().publicKey.toString();

    setReference(ref);

    const txApiParams = new URLSearchParams();
    if (router.query.cluster) {
      txApiParams.append("cluster", router.query.cluster as string);
    } else {
      console.error("Cluster not specified");
    }
    txApiParams.append("reference", ref);
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
