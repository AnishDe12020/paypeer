import {
  Button,
  Image,
  Link,
  Text,
  useDisclosure,
  VStack,
  Icon,
  Avatar,
  Collapse,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { TorusWalletName } from "@solana/wallet-adapter-wallets";
import axios from "axios";
import base58 from "bs58";
import { Step, Steps, useSteps } from "chakra-ui-steps";
import { ExternalLink } from "lucide-react";
import { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { MouseEventHandler, useCallback, useEffect, useState } from "react";
import MainLayout from "../src/layouts/MainLayout";

const HomePage: NextPage = () => {
  const router = useRouter();

  const { data: session } = useSession();

  const {
    wallet,
    connect,
    select,
    publicKey,
    disconnect,
    signMessage,
    wallets,
  } = useWallet();

  const { isOpen: isCollapsedWalletsOpen, onToggle: onCollapsedWalletsToggle } =
    useDisclosure();

  const connectWithTorus: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (e) => {
      if (e.defaultPrevented) return;

      select(TorusWalletName);
    },
    [select]
  );

  const [isSigningIn, setIsSigningIn] = useState(false);

  const login = useCallback(async () => {
    setIsSigningIn(true);
    const res = await axios.get("/api/nonce");

    if (res.status != 200) {
      console.error("failed to fetch nonce");
      return;
    }

    const { nonce } = res.data;

    const message = `Sign this message for authenticating with your wallet. Nonce: ${nonce}`;
    const encodedMessage = new TextEncoder().encode(message);

    if (!signMessage) {
      console.error("signMessage is not defined");
      return;
    }

    const signedMessage = await signMessage(encodedMessage);

    await signIn("credentials", {
      publicKey: publicKey?.toBase58(),
      signature: base58.encode(signedMessage),
      callbackUrl: router.query.callbackUrl
        ? (router.query.callbackUrl as string)
        : `${window.location.origin}/dashboard`,
    });

    setIsSigningIn(false);
  }, [signMessage, publicKey, router.query.callbackUrl]);

  const { setStep, activeStep } = useSteps({
    initialStep: 0,
  });

  useEffect(() => {
    if (publicKey) {
      if (session) {
        router.push(
          router.query.callbackUrl
            ? (router.query.callbackUrl as string)
            : "/dashboard"
        );
      } else {
        setStep(1);
      }
    } else {
      setStep(0);
    }
  }, [publicKey, setStep, router, session]);

  return (
    <MainLayout>
      <Steps activeStep={activeStep} mb={8}>
        <Step>
          <VStack gap={4} alignItems="start">
            {wallets.filter((wallet) => wallet.readyState === "Installed")
              .length > 0 ? (
              wallets
                .filter((wallet) => wallet.readyState === "Installed")
                .map((wallet) => (
                  <Button
                    key={wallet.adapter.name}
                    onClick={() => select(wallet.adapter.name)}
                    w="64"
                    justifyContent="start"
                    size="lg"
                    fontSize="md"
                    leftIcon={
                      <Image
                        src={wallet.adapter.icon}
                        alt={wallet.adapter.name}
                        h={6}
                        w={6}
                      />
                    }
                  >
                    {wallet.adapter.name}
                  </Button>
                ))
            ) : (
              <>
                <Text mx={4} textAlign="center">
                  Looks like you don&apos;t have a Solana wallet installed. We
                  recommend using{" "}
                  <Link
                    href="https://phantom.app"
                    color="purple.400"
                    _hover={{ color: "purple.500" }}
                  >
                    Phantom
                  </Link>{" "}
                  if you are just starting out.
                </Text>

                <Button
                  isExternal
                  href="https://phantom.app"
                  as={Link}
                  leftIcon={<Avatar src="/assets/phantom.png" h={5} w={5} />}
                  rightIcon={<Icon as={ExternalLink} />}
                >
                  Get Phantom
                </Button>

                <Text mx={4} textAlign="center">
                  Alternatively, click on the button below to login with Google
                  or email (this uses{" "}
                  <Link
                    href="https://tor.us"
                    color="blue.400"
                    _hover={{ color: "blue.500" }}
                  >
                    Torus
                  </Link>{" "}
                  which creates a non-custodial wallet associated to your login
                  method)
                </Text>
              </>
            )}

            <Button
              onClick={onCollapsedWalletsToggle}
              w="64"
              justifyContent="start"
              size="lg"
              fontSize="md"
            >
              {isCollapsedWalletsOpen ? "Hide" : "Show"} unavailable wallets
            </Button>
            <Collapse in={isCollapsedWalletsOpen} unmountOnExit>
              <VStack gap={4}>
                {wallets.filter((wallet) => wallet.readyState !== "Installed")
                  .length > 0 ? (
                  wallets
                    .filter((wallet) => wallet.readyState !== "Installed")
                    .map((wallet) => (
                      <Button
                        key={wallet.adapter.name}
                        onClick={() => select(wallet.adapter.name)}
                        w="64"
                        justifyContent="start"
                        size="lg"
                        fontSize="md"
                        leftIcon={
                          <Image
                            src={wallet.adapter.icon}
                            alt={wallet.adapter.name}
                            h={6}
                            w={6}
                          />
                        }
                      >
                        <Text>{wallet.adapter.name}</Text>
                      </Button>
                    ))
                ) : (
                  <Text>No unavailable wallets!</Text>
                )}
              </VStack>
            </Collapse>
          </VStack>
        </Step>

        <Step>
          <Button onClick={login} isLoading={isSigningIn}>
            Sign Message
          </Button>
          <Text mt={8} color="gray.300" maxW="96">
            This opens your wallet and prompts you to sign a message. It{" "}
            <b>does not</b> trigger a blockchain transaction and hence no gas
            fees are incurred.
          </Text>
        </Step>
      </Steps>
      {/* <Divider />
      <Button
        onClick={connectWithTorus}
        variant="unstyled"
        w="full"
        _hover={{
          background: "brand.secondary",
        }}
        h="fit-content"
        py={4}
      >
        <VStack gap={4}>
          <AvatarGroup>
            <Avatar
              name="Google"
              src="/assets/google.png"
              backgroundColor="brand.secondary"
            />
            <Avatar name="Torus" src="/assets/torus.svg" />
          </AvatarGroup>
          <Text wordBreak="break-all">Login with email or Google</Text>
        </VStack>
      </Button> */}
    </MainLayout>
  );
};

export default HomePage;
