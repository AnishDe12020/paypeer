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
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Heading,
  Divider,
  Code,
  Image,
} from "@chakra-ui/react";
import { Organization } from "@prisma/client";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  Check,
  ClipboardCopy,
  CopyIcon,
  DownloadIcon,
  PrinterIcon,
} from "lucide-react";
import { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
// import ReactToPrint from "react-to-print";
import html2canvas from "html2canvas";
import ConnectWallet from "../../src/components/ConnectWallet";
import Logo from "../../src/components/Icons/Logo";
import useCluster from "../../src/hooks/useCluster";
import useSelectedOrganization from "../../src/hooks/useSelectedOrganization";
import DashboardLayout from "../../src/layouts/DashboardLayout";
import { prisma } from "../../src/lib/db";
import { createBrandQr } from "../../src/utils/qr";
import { authOptions } from "../api/auth/[...nextauth]";

interface DashboardQRPageProps {
  orgs: Organization[];
}

const DashboardQRPage: NextPage<DashboardQRPageProps> = ({ orgs }) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [size, setSize] = useState(() =>
    typeof window === "undefined"
      ? 400
      : Math.min(window.screen.availWidth - 240, 300)
  );

  const qrRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasTokenAccount, setHasTokenAccount] = useState<boolean>();
  const [recipientValid, setRecipientValid] = useState<boolean>();
  const [isCheckingForValidRecipient, setIsCheckingForValidRecipient] =
    useState(false);
  const [isCreatingTokenAccount, setIsCreatingTokenAccount] = useState(false);

  const { onCopy, hasCopied, setValue, value } = useClipboard("");

  const { cluster, usdcAddress } = useCluster();

  const { selectedOrg } = useSelectedOrganization();

  const toast = useToast();

  const router = useRouter();

  useEffect(() => {
    if (!selectedOrg) {
      toast({
        title: "No organization selected",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setValue(
      `${process.env.NEXT_PUBLIC_BASE_URL || window.location.hostname}/pay/${
        selectedOrg.id
      }?cluster=${cluster}`
    );
  }, [setValue, cluster, selectedOrg, toast]);

  useEffect(() => {
    const checkIfValidRecipient = async () => {
      setIsCheckingForValidRecipient(true);
      if (!selectedOrg?.fundsPubkey || !usdcAddress) return;

      const accInfo = await connection.getAccountInfo(
        new PublicKey(selectedOrg.fundsPubkey)
      );

      if (!accInfo) {
        setRecipientValid(false);
        setIsCheckingForValidRecipient(false);
        return;
      }

      setRecipientValid(true);

      const ata = await getAssociatedTokenAddress(
        usdcAddress,
        new PublicKey(selectedOrg.fundsPubkey)
      );
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
        setIsCheckingForValidRecipient(false);
      }
    };

    checkIfValidRecipient();
  }, [selectedOrg?.fundsPubkey, connection, usdcAddress, toast]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      setSize(Math.min(window.screen.availWidth - 128, 300));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!value || isCheckingForValidRecipient) return;
    if (!recipientValid) return;
    console.log("value", value);
    const qr = createBrandQr(value, size, "#291552", "#ffffffc3");
    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qr.append(qrRef.current);
    }
  }, [value, size, isCheckingForValidRecipient, recipientValid]);

  const createTokenAccount = useCallback(async () => {
    setIsCreatingTokenAccount(true);
    if (!selectedOrg?.fundsPubkey || !usdcAddress || !publicKey) return;

    const usdcMint = await getMint(connection, usdcAddress);
    const ata = await getAssociatedTokenAddress(
      usdcAddress,
      new PublicKey(selectedOrg.fundsPubkey)
    );

    const tx = new Transaction();

    const ix = createAssociatedTokenAccountInstruction(
      new PublicKey(publicKey),
      ata,
      new PublicKey(selectedOrg.fundsPubkey),
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

      router.reload();
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
  }, [
    connection,
    selectedOrg?.fundsPubkey,
    usdcAddress,
    sendTransaction,
    toast,
    publicKey,
    router,
  ]);

  const handleDownloadCard = async () => {
    const element = cardRef.current;
    if (!element) return;
    element.style.borderRadius = "0";
    const canvas = await html2canvas(element);
    element.style.borderRadius = "16px";

    const data = canvas.toDataURL("image/jpg");
    const link = document.createElement("a");

    if (typeof link.download === "string") {
      link.href = data;
      link.download = `pay-card-${selectedOrg?.name}.jpg`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(data);
    }
  };

  return (
    <DashboardLayout initialOrgs={orgs}>
      <VStack gap={8}>
        {isCheckingForValidRecipient ? (
          <Spinner />
        ) : recipientValid ? (
          hasTokenAccount ? (
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

              <VStack
                bg="brand.secondary"
                py={6}
                px={4}
                rounded="2xl"
                gap={4}
                ref={cardRef}
              >
                <VStack gap={2}>
                  {selectedOrg?.logoUrl && (
                    <Image
                      src={selectedOrg?.logoUrl}
                      alt={selectedOrg?.name}
                      h={16}
                      w={16}
                      rounded="full"
                    />
                  )}
                  <Text fontSize="2xl" textAlign="center">
                    Pay {selectedOrg?.name}
                  </Text>
                  <Text fontSize="xs">{selectedOrg?.fundsPubkey}</Text>
                </VStack>
                <Box ref={qrRef} />

                <Text>
                  Powered by{" "}
                  <span>
                    <Logo ml={1} />
                    <chakra.span
                      ml={1}
                      color="accent.primary"
                      fontWeight="bold"
                    >
                      PayPeer
                    </chakra.span>
                  </span>
                </Text>
              </VStack>

              <Button
                leftIcon={<Icon as={DownloadIcon} />}
                onClick={handleDownloadCard}
              >
                Download QR Code
              </Button>

              {/* <ReactToPrint
                trigger={() => (
                  <Button leftIcon={<Icon as={PrinterIcon} />}>Print it out
                  </Button>
                )}
                content={() => cardRef.current}
              /> */}

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
                  Copy Link to Pay Page
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
                    as={hasCopied ? Check : ClipboardCopy}
                    aria-label={"Copy URL"}
                    w={4}
                    h={4}
                    textAlign="center"
                  />
                </chakra.span>
              </Button>
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
                {publicKey ? (
                  <Button
                    isLoading={isCreatingTokenAccount}
                    onClick={createTokenAccount}
                  >
                    Create Token Account
                  </Button>
                ) : (
                  <ConnectWallet />
                )}
              </VStack>
            </Alert>
          )
        ) : (
          <Alert status="error" rounded="lg">
            <VStack alignItems="start" gap={4}>
              <HStack>
                <AlertIcon />

                <AlertTitle>Your organization wallet is not active</AlertTitle>
              </HStack>

              {/* getAccountInfo returns a null value for the account */}
              <AlertDescription>
                If you just created a new wallet or updated the organization
                wallet in the organization settings, it will not be active
                unless you hold some SOL (even a very small amount will do). You
                may transfer some SOL to your account on the Solana mainnet in
                order for it be active. Note that transferring other tokens like
                USDC will not make the account active.
                <Divider my={4} />
                Reload the window after you transfer some SOL to your account.
                <Divider my={4} />
                Your organization wallet address is{" "}
                <Code>{selectedOrg?.fundsPubkey}</Code>
              </AlertDescription>
            </VStack>
          </Alert>
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

export default DashboardQRPage;
