export interface TokenAnalytics {
  sum: string;
  avg: string;
  count: number;
  date: string;
  tokenPubkey: string;
  usdPrice: number;
  totalInUSD: number;
  avgInUSD: number;
}

export type DateAnalytics = Omit<
  TokenAnalytics,
  "sum" | "avg" | "tokenPubkey" | "usdPruce"
>;

export interface Analytics {
  totalInUSD: number;
  avgInUSD: number;
  totalSales: number;
  tokenAnalytics: TokenAnalytics[];
  dateAnalytics: DateAnalytics[];
  tokenPubkeys: string[];
}
