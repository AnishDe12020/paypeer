import {
  Button,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  VStack,
  Text,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import {
  encodeURL,
  findReference,
  FindReferenceError,
  TransactionRequestURLFields,
  validateTransfer,
  ValidateTransferError,
} from "@solana/pay";
import { useConnection } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { truncateString } from "../../src/utils/truncate";

const USDC_ADDRESS = new PublicKey(
  "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
);

enum TxStatus {
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error",
}

const QRMerchantPage: NextPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { connection } = useConnection();

  const [amount, setAmount] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [reference, setReference] = useState<string | undefined>();
  const [txStatus, setTxStatus] = useState<TxStatus>();

  const pay = async () => {
    if (!router.query.pubkey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to continue",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

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

    const merchantAddress = router.query.pubkey as string;

    const txApiParams = new URLSearchParams();
    if (router.query.cluster) {
      txApiParams.append("cluster", router.query.cluster as string);
    } else {
      console.error("Cluster not specified");
    }
    txApiParams.append("reference", ref);
    txApiParams.append("merchantAddress", merchantAddress);
    txApiParams.append("amount", amount);
    txApiParams.append(
      "label",
      (router.query.shopName as string) ?? "Merchant Inc"
    );

    if (message) {
      txApiParams.append("message", message);
    }

    const { location } = window;

    const apiUrl = `${location.protocol}//${
      location.host
    }/api/tx?${txApiParams.toString()}`;

    const txUrlParams: TransactionRequestURLFields = {
      link: new URL(apiUrl),
    };

    const url = encodeURL(txUrlParams);

    console.log("url", url);

    setTxStatus(TxStatus.PENDING);

    window.open(url);
  };

  useEffect(() => {
    if (txStatus !== TxStatus.PENDING) return;

    console.log("polling...", reference);

    const interval = setInterval(async () => {
      try {
        if (!router.query.pubkey) return;

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

        const signatureInfo = await findReference(
          connection,
          new PublicKey(reference as string),
          {
            finality: "confirmed",
          }
        );

        console.log("signatureInfo", signatureInfo);

        await validateTransfer(
          connection,
          signatureInfo.signature,
          {
            recipient: new PublicKey(router.query.pubkey as string),
            amount: new BigNumber(amount),
            splToken: USDC_ADDRESS,
            reference: new PublicKey(reference as string),
          },
          { commitment: "confirmed" }
        );

        console.log("success");

        setTxStatus(TxStatus.SUCCESS);

        router.push(
          `/qr/success?signature=${signatureInfo.signature}&reference=${reference}`
        );

        toast({
          title: "Amount received!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (e) {
        if (e instanceof FindReferenceError) {
          // No transaction found yet, ignore this error
          console.log("nah");
          return;
        }
        if (e instanceof ValidateTransferError) {
          setTxStatus(TxStatus.ERROR);
          console.error("Transaction is invalid", e);
          toast({
            title: "Transaction is invalid",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          return;
        }
        setTxStatus(TxStatus.ERROR);
        toast({
          title: "Unknown error",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        console.error("Unknown error", e);
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [txStatus]);

  return (
    <Container>
      <VStack gap={16}>
        <VStack gap={4}>
          <Heading textAlign="center">
            Pay{" "}
            {router.query.shopName ??
              truncateString(router.query.pubkey as string)}
          </Heading>
          {router.query.shopName && (
            <Text fontSize="xs">{router.query.pubkey}</Text>
          )}
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
    </Container>
  );
};

export default QRMerchantPage;
