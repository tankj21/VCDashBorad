export interface Asset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
  volumeUsd24Hr: string;
  marketCapUsd: string;
}

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  previousPrice: number | null;
  change24h: number;
  volume24h: number;
  history: ChartDataPoint[];
}

export interface ChartDataPoint {
  time: number; // Unix timestamp in seconds
  value: number;
}
