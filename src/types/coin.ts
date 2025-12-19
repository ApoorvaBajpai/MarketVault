export interface Coin {
  id: number;
  symbol: string;
  name: string;
  price: number;
  percent_change_24h: number;
  market_cap: number;
  volume_24h: number;
  logo?: string;
}
