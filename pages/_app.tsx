import "../src/styles/globals.css";
import type { AppProps } from "next/app";
import { Box, ChakraProvider } from "@chakra-ui/react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  GlowWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import NextNProgress from "nextjs-progressbar";

import theme from "../src/theme";
import dynamic from "next/dynamic";

import "../src/styles/wallet-adapter.css";
import useCluster from "../src/hooks/useCluster";

import { QueryClient, QueryClientProvider } from "react-query";
import { SessionProvider } from "next-auth/react";
import { DefaultSeo } from "next-seo";

import SEO from "../src/lib/next-seo.config";

const ReactUIWalletModalProviderDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletModalProvider,
  { ssr: false }
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const { rpc } = useCluster();

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new GlowWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={rpc}>
      <ChakraProvider theme={theme}>
        <WalletProvider wallets={wallets} autoConnect>
          <ReactUIWalletModalProviderDynamic>
            <QueryClientProvider client={queryClient}>
              <SessionProvider session={session}>
                <NextNProgress
                  color="#6133C1"
                  options={{ showSpinner: false }}
                />
                <DefaultSeo {...SEO} />
                <Box
                  bg="#f53598"
                  filter="blur(200px)"
                  h={{ base: "52", md: "72" }}
                  position="absolute"
                  rounded="full"
                  w={{ base: "60", md: "96" }}
                  left="16"
                  top="96"
                  opacity="0.3"
                />
                <Box
                  bg="#484bfd"
                  filter="blur(200px)"
                  h={{ base: "52", md: "72" }}
                  position="absolute"
                  rounded="full"
                  w={{ base: "60", md: "96" }}
                  right="16"
                  top="48"
                  opacity="0.6"
                />
                <Component {...pageProps} />
              </SessionProvider>
            </QueryClientProvider>
          </ReactUIWalletModalProviderDynamic>
        </WalletProvider>
      </ChakraProvider>
    </ConnectionProvider>
  );
}
