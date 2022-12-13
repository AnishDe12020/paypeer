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
  Link,
  useToast,
} from "@chakra-ui/react";
import { encodeURL, TransferRequestURLFields } from "@solana/pay";
import { useConnection } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { truncateString } from "../../utils/truncate";

const USDC_ADDRESS = new PublicKey(
  "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
);

const QRMerchantPage: NextPage = () => {
  const router = useRouter();
  const toast = useToast();

  const [amount, setAmount] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [link, setLink] = useState<string | undefined>();

  useEffect(() => {
    if (!router.query.pubkey) return;

    const merchantAddress = new PublicKey(router.query.pubkey as string);

    const ref = Keypair.generate().publicKey.toString();

    const urlParams: TransferRequestURLFields = {
      recipient: merchantAddress,
      splToken: USDC_ADDRESS,
      amount: new BigNumber(amount ?? 0),
      reference: new PublicKey(ref),
      label: "Merchant Inc",
      message: message ?? "",
    };

    const link = encodeURL(urlParams).toString();

    setLink(link);
  }, [amount, message, toast, router.query.pubkey]);

  return (
    <Container>
      <VStack gap={16}>
        <Heading>Pay {truncateString(router.query.pubkey as string)}</Heading>
        <VStack gap={4}>
          <FormControl>
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
            <FormHelperText>Optional</FormHelperText>
          </FormControl>

          <Button as={Link} isExternal href={link}>
            Pay with Solana Pay
          </Button>
        </VStack>
      </VStack>
    </Container>
  );
};

export default QRMerchantPage;
