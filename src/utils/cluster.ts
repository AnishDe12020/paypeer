import { TorusWalletName } from "@solana/wallet-adapter-wallets";
import axios from "axios";
import { arrayBuffer } from "stream/consumers";
import { Cluster } from "../types/cluster";
import { Token } from "../types/tokens";
import {
  AVAILABLE_TOKENS,
  USDC_MINT_DEVNET,
  USDC_MINT_MAINNET,
} from "./constants";

export const getRpc = (cluster: string) => {
  switch (cluster) {
    case Cluster.MainnetBeta:
      return (
        process.env.NEXT_PUBLIC_MAINNET_RPC ??
        "https://api.mainnet-beta.solana.com"
      );

    case Cluster.Devnet:
      return (
        process.env.NEXT_PUBLIC_DEVNET_RPC ?? "https://api.devnet.solana.com"
      );

    default:
      return (
        process.env.NEXT_PUBLIC_DEVNET_RPC ?? "https://api.devnet.solana.com"
      );
  }
};

export const getUSDCAddress = (cluster: string) => {
  switch (cluster) {
    case Cluster.MainnetBeta:
      return USDC_MINT_MAINNET;
    case Cluster.Devnet:
      return USDC_MINT_DEVNET;
    default:
      return USDC_MINT_DEVNET;
  }
};

export const getWeb3authChainId = (cluster: string) => {
  switch (cluster) {
    case Cluster.MainnetBeta:
      return "0x1";
    case Cluster.Devnet:
      return "0x3";
    default:
      return "0x3";
  }
};

export const getTokenListUrl = (cluster: string) => {
  switch (cluster) {
    case Cluster.MainnetBeta:
      return "https://cache.jup.ag/tokens";
    case Cluster.Devnet:
      return "https://api.jup.ag/api/tokens/devnet";
    default:
      return "https://cache.jup.ag/tokens";
  }
};

export const getTokenList = async (cluster: string) => {
  const url = getTokenListUrl(cluster);
  const { data } = await axios.get<Token[]>(url);

  const tokens = data.filter((token) => {
    return AVAILABLE_TOKENS.includes(token.address);
  });

  return tokens;
};
