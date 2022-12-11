import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { createQR, encodeURL, TransferRequestURLFields } from "@solana/pay";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { useEffect, useMemo, useRef, useState } from "react";

export default function Home() {
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState<string | undefined>();
  const [size, setSize] = useState(() =>
    typeof window === "undefined"
      ? 400
      : Math.min(window.screen.availWidth - 48, 400)
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      setSize(Math.min(window.screen.availWidth - 48, 400));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const qrRef = useRef<HTMLDivElement>(null);

  const reference = useMemo(() => Keypair.generate().publicKey, []);

  const gen = async () => {
    const urlParams: TransferRequestURLFields = {
      recipient: publicKey as PublicKey,
      splToken: new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"),
      amount: new BigNumber(amount as string),
      reference,
      label: "Merchant Inc",
      message: "Thanks for your order!",
    };

    const url = encodeURL(urlParams);

    console.log(url);

    const qr = createQR(url, size, "transparent", "#b579ff");
    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qr.append(qrRef.current);
    }
  };

  return (
    <Container>
      <Heading>Solana Pay POS</Heading>
      <Text>
        A No-Code POS that helps merchants accept payments via Solana Pay
      </Text>
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
        <Box color="white" ref={qrRef} />
      </VStack>
    </Container>
  );
}
