import {
  Heading,
  VStack,
  Text,
  FormControl,
  Input,
  FormHelperText,
  Button,
  HStack,
  Spinner,
  useToast,
  Image,
  Flex,
  Link,
} from "@chakra-ui/react";
import { AcceptedTokenTypes, Organization } from "@prisma/client";
import { encodeURL, TransactionRequestURLFields } from "@solana/pay";
import { Keypair } from "@solana/web3.js";
import axios from "axios";
import { Select } from "chakra-react-select";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import SolanaPayIcon from "../../../src/components/Icons/SolanaPay";
import useTransactionListener from "../../../src/hooks/useTransactionListener";
import BaseLayout from "../../../src/layouts/BaseLayout";
import { prisma } from "../../../src/lib/db";
import { reactSelectStyles } from "../../../src/styles/chakra-react-select";
import { TokenOption } from "../../../src/types/model";
import { TxStatus } from "../../../src/types/pay";
import { TOKEN_LIST } from "../../../src/utils/constants";

interface PayPageProps {
  org: Organization;
  tokens: TokenOption[];
}

const PayPage: NextPage<PayPageProps> = ({ org, tokens }) => {
  const [amount, setAmount] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [selectedToken, setSelectedToken] = useState<TokenOption>(tokens[0]);
  const [txStatus, setTxStatus] = useState<TxStatus>();

  const toast = useToast();
  const router = useRouter();

  const reference = useMemo(() => Keypair.generate().publicKey, []);

  useTransactionListener(
    reference,
    txStatus,
    org.fundsPubkey,
    amount,
    org.acceptedTokens === AcceptedTokenTypes.ONLY
      ? tokens[0].value
      : selectedToken.value,
    setTxStatus,
    async (signature, customerPubkey) => {
      const tx = await axios.put("/api/transactions", {
        organizationId: org.id,
        signature,
        reference: reference.toString(),
        amount,
        tokenPubkey:
          org.acceptedTokens === AcceptedTokenTypes.ONLY
            ? tokens[0].value
            : selectedToken.value,
        customerPubkey: customerPubkey,
        message,
      });

      router.push(`/pay/${org.id}/success?txId=${tx.data.transaction.id}`);
    },

    async () => {
      const tx = await axios.put("/api/transactions", {
        organizationId: org.id,
        reference: reference.toString(),
        amount,
        tokenPubkey: selectedToken.value,
        message,
      });

      router.push(`/pay/${org.id}/fail?txId=${tx.data.transaction.id}`);
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
    txApiParams.append(
      "tokenPubkey",
      org.acceptedTokens === AcceptedTokenTypes.ONLY
        ? tokens[0].value
        : selectedToken.value
    );

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
          {org.logoUrl && (
            <Image
              src={org.logoUrl}
              alt={org.name}
              h={16}
              w={16}
              rounded="full"
            />
          )}
          <Heading fontSize="2xl" textAlign="center">
            Paying {org.name}
          </Heading>
          <Text fontSize="xs">{org.fundsPubkey}</Text>
        </VStack>
        <VStack gap={8}>
          <FormControl isRequired as={VStack}>
            <Input
              placeholder="0"
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
              type="number"
              autoFocus
              w="48"
              rounded="xl"
              h="12"
              variant="filled"
              textAlign="center"
              fontSize="xl"
            />
          </FormControl>

          {org.acceptedTokens === "ONLY" ? (
            <HStack>
              <Image
                src={tokens[0].logoUrl}
                alt={tokens[0].value}
                h={6}
                w={6}
              />
              <Text>{tokens[0].label}</Text>
            </HStack>
          ) : (
            <VStack>
              <Select
                chakraStyles={reactSelectStyles}
                variant="filled"
                size="lg"
                options={tokens}
                isSearchable={false}
                formatOptionLabel={(option: any) => {
                  return (
                    <Flex alignItems="center">
                      <Image
                        src={option.logoUrl}
                        alt={option.label}
                        mr={2}
                        boxSize={6}
                        rounded="full"
                      />
                      <Text>{option.label}</Text>
                    </Flex>
                  );
                }}
                onChange={(v) => setSelectedToken(v as TokenOption)}
                value={selectedToken}
              />
            </VStack>
          )}

          <FormControl as={VStack}>
            <Input
              placeholder="What's this for?"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              w="48"
              rounded="xl"
              h="12"
              variant="filled"
              textAlign="center"
            />
            <FormHelperText>Optional message to the merchant</FormHelperText>
          </FormControl>

          <Button w="64" size="lg" rounded="xl" h={12} onClick={pay}>
            Pay
          </Button>

          <Text>
            Powered by{" "}
            <span>
              <Link isExternal href="https://solanapay.com/">
                <SolanaPayIcon ml={1} h="6" w="12" />
              </Link>
            </span>
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

  if (!org) {
    return {
      notFound: true,
    };
  }

  let tokens;

  if (org.acceptedTokens === AcceptedTokenTypes.SOME) {
    tokens = org.tokenPubkeys.map((t) => {
      const token = TOKEN_LIST.find((token) => token.address === t);
      if (!token) {
        throw new Error("Token not found");
      }
      return {
        label: token.symbol,
        value: token.address,
        logoUrl: token.logoURI,
      };
    });
  } else if (org.acceptedTokens === AcceptedTokenTypes.ONLY) {
    const token = TOKEN_LIST.find((t) => t.address === org.tokenPubkeys[0]);

    if (!token) {
      throw new Error("Token not found");
    }

    tokens = [
      {
        label: token.symbol,
        value: token.address,
        logoUrl: token.logoURI,
      },
    ];
  } else {
    tokens = TOKEN_LIST.map((token) => ({
      label: token.symbol,
      value: token.address,
      logoUrl: token.logoURI,
    }));
  }

  return {
    props: {
      org: JSON.parse(JSON.stringify(org)),
      tokens,
    },
  };
};

export default PayPage;
