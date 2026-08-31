const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

interface CoinPrice {
  symbol: string;
  name: string;
  price_usd: number;
  change_24h: number;
  market_cap: number;
  volume_24h: number;
  image: string;
}

let priceCache: CoinPrice[] = [];
let lastFetch = 0;
const CACHE_TTL = 30_000; // 30 seconds

// CoinGecko symbol -> id mapping
const SYMBOL_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOT: 'polkadot',
};

export async function fetchPrices(): Promise<CoinPrice[]> {
  const now = Date.now();
  if (priceCache.length > 0 && now - lastFetch < CACHE_TTL) {
    return priceCache;
  }

  try {
    const ids = Object.values(SYMBOL_MAP).join(',');
    const url = `${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true&include_image=true`;

    const res = await fetch(url);
    if (!res.ok) {
      console.warn('CoinGecko API error:', res.status);
      return priceCache.length > 0 ? priceCache : getFallbackPrices();
    }

    const data = await res.json();
    const prices: CoinPrice[] = [];

    for (const [symbol, coingeckoId] of Object.entries(SYMBOL_MAP)) {
      const coinData = data[coingeckoId];
      if (coinData) {
        prices.push({
          symbol,
          name: getAssetName(symbol),
          price_usd: coinData.usd || 0,
          change_24h: coinData.usd_24h_change || 0,
          market_cap: coinData.usd_market_cap || 0,
          volume_24h: coinData.usd_24h_vol || 0,
          image: coinData.image || '',
        });
      }
    }

    priceCache = prices;
    lastFetch = now;
    return prices;
  } catch (error) {
    console.warn('Failed to fetch CoinGecko prices:', error);
    return priceCache.length > 0 ? priceCache : getFallbackPrices();
  }
}

export async function fetchPriceBySymbol(symbol: string): Promise<number> {
  const prices = await fetchPrices();
  const found = prices.find((p) => p.symbol === symbol);
  return found?.price_usd || 0;
}

function getAssetName(symbol: string): string {
  const names: Record<string, string> = {
    BTC: 'Bitcoin', ETH: 'Ethereum', USDT: 'Tether', SOL: 'Solana',
    BNB: 'BNB', XRP: 'Ripple', ADA: 'Cardano', DOT: 'Polkadot',
  };
  return names[symbol] || symbol;
}

function getFallbackPrices(): CoinPrice[] {
  // Fallback if API is down — approximate prices
  return [
    { symbol: 'BTC', name: 'Bitcoin', price_usd: 112000, change_24h: 2.1, market_cap: 0, volume_24h: 0, image: '' },
    { symbol: 'ETH', name: 'Ethereum', price_usd: 4500, change_24h: 1.8, market_cap: 0, volume_24h: 0, image: '' },
    { symbol: 'USDT', name: 'Tether', price_usd: 1.0, change_24h: 0.01, market_cap: 0, volume_24h: 0, image: '' },
    { symbol: 'SOL', name: 'Solana', price_usd: 198, change_24h: 4.0, market_cap: 0, volume_24h: 0, image: '' },
    { symbol: 'BNB', name: 'BNB', price_usd: 685, change_24h: -0.5, market_cap: 0, volume_24h: 0, image: '' },
    { symbol: 'XRP', name: 'Ripple', price_usd: 2.87, change_24h: 3.2, market_cap: 0, volume_24h: 0, image: '' },
    { symbol: 'ADA', name: 'Cardano', price_usd: 0.92, change_24h: -1.2, market_cap: 0, volume_24h: 0, image: '' },
    { symbol: 'DOT', name: 'Polkadot', price_usd: 9.45, change_24h: 1.1, market_cap: 0, volume_24h: 0, image: '' },
  ];
}
