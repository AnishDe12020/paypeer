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
import { useEffect, useMemo, useState } from "react";

import theme from "../src/theme";
import dynamic from "next/dynamic";

import "../src/styles/wallet-adapter.css";
import useCluster from "../src/hooks/useCluster";

import { Web3Auth } from "@web3auth/modal";
import { WALLET_ADAPTERS, CHAIN_NAMESPACES } from "@web3auth/base";

import useWeb3Auth from "../src/hooks/useWeb3Auth";
import useProvider from "../src/hooks/useProvider";
import { SolflareAdapter } from "@web3auth/solflare-adapter";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

import { QueryClient, QueryClientProvider } from "react-query";

const ReactUIWalletModalProviderDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletModalProvider,
  { ssr: false }
);

const WEB3AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const { rpc, web3authChainId } = useCluster();

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new GlowWalletAdapter(),
    ],
    []
  );

  const { web3auth, setWeb3auth } = useWeb3Auth();
  const { provider, setProvider } = useProvider();

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId: WEB3AUTH_CLIENT_ID,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.SOLANA,
            chainId: web3authChainId,
            rpcTarget: rpc,
          },
          uiConfig: {
            theme: "dark",
            displayErrorsOnModal: true,
          },
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            network: "cyan",
            uxMode: "popup",
          },
        });
        web3auth.configureAdapter(openloginAdapter);

        const solflareAdapter = new SolflareAdapter({
          clientId: WEB3AUTH_CLIENT_ID,
          sessionTime: 3600, // 1 hour in seconds
          web3AuthNetwork: "cyan",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.SOLANA,
            chainId: web3authChainId,
            rpcTarget: rpc,
          },
        });

        web3auth.configureAdapter(solflareAdapter);

        setWeb3auth(web3auth);

        await web3auth.initModal({
          modalConfig: {
            [WALLET_ADAPTERS.OPENLOGIN]: {
              label: "openlogin",
              loginMethods: {
                facebook: {
                  showOnModal: false,
                },
                twitter: {
                  showOnModal: false,
                },
                github: {
                  showOnModal: false,
                },
                apple: {
                  showOnModal: false,
                },
                reddit: {
                  showOnModal: false,
                },
                discord: {
                  showOnModal: false,
                },
                twitch: {
                  showOnModal: false,
                },
                line: {
                  showOnModal: false,
                },
                wechat: {
                  showOnModal: false,
                },
                weibo: {
                  showOnModal: false,
                },
                kakao: {
                  showOnModal: false,
                },
                linkedin: {
                  showOnModal: false,
                },
              },
            },
            // setting it to false will hide all social login methods from modal.
            showOnModal: true,
          },
        });
        setProvider(web3auth.provider);
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, [rpc, setProvider, setWeb3auth, web3authChainId]);

  return (
    <ConnectionProvider endpoint={rpc}>
      <ChakraProvider theme={theme}>
        <WalletProvider wallets={wallets} autoConnect>
          <ReactUIWalletModalProviderDynamic>
            <QueryClientProvider client={queryClient}>
              <Component {...pageProps} />
            </QueryClientProvider>
          </ReactUIWalletModalProviderDynamic>
        </WalletProvider>
      </ChakraProvider>
    </ConnectionProvider>
  );
}
