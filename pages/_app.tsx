import "../src/styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  GlowWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { useMemo } from "react";

import theme from "../src/theme";
import dynamic from "next/dynamic";

import "../src/styles/wallet-adapter.css";
import useCluster from "../src/hooks/useCluster";

const ReactUIWalletModalProviderDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletModalProvider,
  { ssr: false }
);

export default function App({ Component, pageProps }: AppProps) {
  const { rpc } = useCluster();

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new GlowWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={rpc}>
      <ChakraProvider theme={theme}>
        <WalletProvider wallets={wallets} autoConnect>
          <ReactUIWalletModalProviderDynamic>
            <Component {...pageProps} />
          </ReactUIWalletModalProviderDynamic>
        </WalletProvider>
      </ChakraProvider>
    </ConnectionProvider>
  );
}
