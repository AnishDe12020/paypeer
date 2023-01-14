import { PublicKey } from "@solana/web3.js";

export const USDC_MINT_MAINNET = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

export const USDC_MINT_DEVNET = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

export const JUPITER_PRICE_API = "https://price.jup.ag/v3/price";
export const JUPITER_TOKEN_LIST = "https://cache.jup.ag/tokens";

export const USDT_MINT_MAINNET = new PublicKey(
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
);
export const SHDW_MINT_MAINNET = new PublicKey(
  "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y"
);
export const BONK_MINT_MAINNET = new PublicKey(
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
);

export const AVAILABLE_TOKENS = [
  USDC_MINT_MAINNET.toString(),
  USDT_MINT_MAINNET.toString(),
  SHDW_MINT_MAINNET.toString(),
  BONK_MINT_MAINNET.toString(),
];

export const TOKEN_LIST = [
  {
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    chainId: 101,
    decimals: 6,
    name: "USD Coin",
    symbol: "USDC",
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    extensions: {
      coingeckoId: "usd-coin",
    },
  },
  {
    address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    chainId: 101,
    decimals: 6,
    name: "USDT",
    symbol: "USDT",
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
    extensions: {
      coingeckoId: "tether",
    },
  },
  {
    address: "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y",
    chainId: 101,
    decimals: 9,
    name: "Shadow Token",
    symbol: "SHDW",
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y/logo.png",
    extensions: {
      coingeckoId: "genesysgo-shadow",
    },
  },
  {
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    chainId: 101,
    decimals: 5,
    name: "BonkCoin",
    symbol: "Bonk",
    logoURI:
      "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I?ext=png",
    extensions: {
      coingeckoId: "bonk",
    },
  },
];
