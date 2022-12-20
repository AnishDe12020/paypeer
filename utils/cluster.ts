import { Cluster } from "../types/cluster";
import { USDC_MINT_DEVNET, USDC_MINT_MAINNET } from "./constants";

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

export const getUSDCMint = (cluster: string) => {
  switch (cluster) {
    case Cluster.MainnetBeta:
      return USDC_MINT_MAINNET;
    case Cluster.Devnet:
      return USDC_MINT_DEVNET;
    default:
      return USDC_MINT_DEVNET;
  }
};
