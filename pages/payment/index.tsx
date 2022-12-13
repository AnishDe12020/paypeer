import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  createQR,
  encodeURL,
  findReference,
  FindReferenceError,
  TransferRequestURLFields,
  validateTransfer,
  ValidateTransferError,
} from "@solana/pay";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const USDC_ADDRESS = new PublicKey(
  "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
);

enum TxStatus {
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error",
}

export default function Home() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState<string | undefined>();
  const [reference, setReference] = useState<string | undefined>();
  const [size, setSize] = useState(() =>
    typeof window === "undefined"
      ? 400
      : Math.min(window.screen.availWidth - 48, 400)
  );
  const [txStatus, setTxStatus] = useState<TxStatus>();

  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      setSize(Math.min(window.screen.availWidth - 48, 400));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const qrRef = useRef<HTMLDivElement>(null);

  const toast = useToast();

  const gen = async () => {
    if (!publicKey) {
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

    const urlParams: TransferRequestURLFields = {
      recipient: publicKey,
      splToken: USDC_ADDRESS,
      amount: new BigNumber(amount),
      reference: new PublicKey(ref),
      label: "Merchant Inc",
      message: "Thanks for your order!",
    };

    const url = encodeURL(urlParams);

    console.log(url);

    const qr = createQR(url, size, "#c9c9c9", "#000000");
    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qr.append(qrRef.current);
    }

    setTxStatus(TxStatus.PENDING);
  };

  useEffect(() => {
    if (txStatus !== TxStatus.PENDING) return;

    console.log("polling...", reference);

    const interval = setInterval(async () => {
      try {
        if (!publicKey) {
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
            recipient: publicKey,
            amount: new BigNumber(amount),
            splToken: USDC_ADDRESS,
            reference: new PublicKey(reference as string),
          },
          { commitment: "confirmed" }
        );

        console.log("success");

        setTxStatus(TxStatus.SUCCESS);

        router.push(
          `/payment/success?signature=${signatureInfo.signature}&reference=${reference}`
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
      <VStack>
        <VStack mt={16} alignItems="start" gap={6} w="full">
          <FormControl>
            <FormLabel>Amount</FormLabel>
            <Input
              placeholder="5"
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
            />
            <FormHelperText>in USDC</FormHelperText>
          </FormControl>
          <Button onClick={gen}>Generate QR Code</Button>
        </VStack>
        <Box p={4} rounded="xl" ref={qrRef} />

        {txStatus === TxStatus.PENDING && (
          <HStack gap={6}>
            <Text>Waiting for payment...</Text> <Spinner />
          </HStack>
        )}
      </VStack>
    </Container>
  );
}
