import { CheckIcon, CopyIcon } from "@chakra-ui/icons";
import {
  Flex,
  HStack,
  useClipboard,
  VStack,
  Text,
  Box,
  Button,
  chakra,
  Icon,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Heading,
} from "@chakra-ui/react";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Transaction } from "@solana/web3.js";
import { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import useCluster from "../../src/hooks/useCluster";
import MainLayout from "../../src/layouts/MainLayout";
import { truncateURL } from "../../src/utils/truncate";

const QRPage: NextPage = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [size, setSize] = useState(() =>
    typeof window === "undefined"
      ? 400
      : Math.min(window.screen.availWidth - 160, 400)
  );
  const [shopName, setShopName] = useState<string | undefined>();
  const [shopLogo, setShopLogo] = useState<string | undefined>();
  const [hasTokenAccount, setHasTokenAccount] = useState<boolean>();
  const [isLoadingTokenAccount, setIsLoadingTokenAccount] = useState(false);
  const [isCreatingTokenAccount, setIsCreatingTokenAccount] = useState(false);

  const { onCopy, hasCopied, setValue, value } = useClipboard("");

  const { cluster, usdcAddress } = useCluster();

  const toast = useToast();

  useEffect(() => {
    if (publicKey) {
      setValue(
        `${
          process.env.NEXT_PUBLIC_VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL
        }/qr/${publicKey}?cluster=${cluster}${
          shopName ? `&shopName=${shopName}` : ""
        }`
      );
    }
  }, [publicKey, setValue, shopName, shopLogo, cluster]);

  useEffect(() => {
    const checkForTokenAccount = async () => {
      setIsLoadingTokenAccount(true);
      if (!publicKey || !usdcAddress) return;
      const ata = await getAssociatedTokenAddress(usdcAddress, publicKey);
      try {
        const tokenAccount = await getAccount(connection, ata);
        if (!tokenAccount.isInitialized) {
          toast({
            title: "Token Account has not been initialized",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }

        if (tokenAccount.isFrozen) {
          toast({
            title: "Token Account is frozen",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }

        setHasTokenAccount(true);
      } catch (error) {
        if (error instanceof TokenAccountNotFoundError) {
          setHasTokenAccount(false);
        }
      } finally {
        setIsLoadingTokenAccount(false);
      }
    };

    checkForTokenAccount();
  }, [publicKey, connection, usdcAddress, toast]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      setSize(Math.min(window.screen.availWidth - 48, 400));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const createTokenAccount = useCallback(async () => {
    setIsCreatingTokenAccount(true);
    if (!publicKey || !usdcAddress) return;

    const usdcMint = await getMint(connection, usdcAddress);
    const ata = await getAssociatedTokenAddress(usdcAddress, publicKey);

    const tx = new Transaction();

    const ix = createAssociatedTokenAccountInstruction(
      publicKey,
      ata,
      publicKey,
      usdcMint.address
    );

    tx.add(ix);

    try {
      const latestBlockhash = await connection.getLatestBlockhash();

      const sig = await sendTransaction(tx, connection);

      await connection.confirmTransaction(
        {
          signature: sig,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "processed"
      );

      toast({
        title: "Token account created",
        description: "Your token account has been created",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error creating token account",
        // @ts-ignore
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreatingTokenAccount(false);
    }
  }, [connection, publicKey, usdcAddress, sendTransaction, toast]);

  return (
    <MainLayout>
      <VStack gap={8}>
        {publicKey ? (
          isLoadingTokenAccount ? (
            <Spinner />
          ) : hasTokenAccount ? (
            <VStack gap={8}>
              <VStack gap={4}>
                <Heading fontSize="4xl" textAlign="center">
                  Scan this with your phone&apos;s QR Code scanner or the camera
                  app.
                </Heading>

                <Text
                  fontSize="xl"
                  textAlign="center"
                  textColor="whiteAlpha.700"
                >
                  Don&apos;t use the QR code scanner in your Solana wallet app
                  (Phantom, Glow, Solflare, etc.)
                </Text>
              </VStack>

              <Box p={8} bg="#c9c9c9">
                <QRCode value={value} size={size} bgColor="#c9c9c9" level="M" />
              </Box>

              <Button
                bg="brand.secondary"
                justifyContent="center"
                alignItems="center"
                rounded="lg"
                cursor="copy"
                onClick={onCopy}
                pl={6}
                pr={4}
                h={10}
                as={HStack}
                spacing={6}
                textAlign="center"
                role="group"
                fontWeight="normal"
              >
                <Text color="gray.300" fontFamily="mono">
                  {truncateURL(value)}
                </Text>
                <chakra.span
                  bg={hasCopied ? "green.600" : "brand.tertiary"}
                  rounded="full"
                  w={8}
                  h={8}
                  as={Flex}
                  alignItems="center"
                  justifyContent="center"
                  _groupHover={{
                    bg: hasCopied ? "green.500" : "brand.quaternary",
                  }}
                >
                  <Icon
                    as={hasCopied ? CheckIcon : CopyIcon}
                    aria-label={"Copy URL"}
                    w={4}
                    h={4}
                    textAlign="center"
                  />
                </chakra.span>
              </Button>

              <VStack gap={4}>
                <FormControl>
                  <FormLabel>Shop Name</FormLabel>
                  <Input
                    placeholder="ACME Inc."
                    onChange={(e) => setShopName(e.target.value)}
                    value={shopName}
                  />
                  <FormHelperText>(Optional)</FormHelperText>
                </FormControl>
              </VStack>
            </VStack>
          ) : (
            <Alert status="error" rounded="lg">
              <VStack alignItems="start" gap={4}>
                <HStack>
                  <AlertIcon />

                  <AlertTitle>
                    You don&apos;t have a token account for USDC
                  </AlertTitle>
                </HStack>

                <AlertDescription>
                  You will need a valid token account for USDC to receive
                  payments. You can either transfer some USDC to this wallet
                  which creates a token account automatically or click on the
                  button below to initiate a transaction to create a token
                  account.
                </AlertDescription>

                <Button
                  isLoading={isCreatingTokenAccount}
                  onClick={createTokenAccount}
                >
                  Create Token Account
                </Button>
              </VStack>
            </Alert>
          )
        ) : (
          <WalletMultiButton />
        )}
      </VStack>
    </MainLayout>
  );
};

export default QRPage;
