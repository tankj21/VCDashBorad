import { useState, useEffect, useRef } from 'react';
import type { CryptoData, ChartDataPoint } from '../types';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'DOGEUSDT', 'XRPUSDT'];
const ASSET_NAMES: Record<string, { name: string, symbol: string }> = {
  'BTCUSDT': { name: 'Bitcoin', symbol: 'BTC' },
  'ETHUSDT': { name: 'Ethereum', symbol: 'ETH' },
  'SOLUSDT': { name: 'Solana', symbol: 'SOL' },
  'ADAUSDT': { name: 'Cardano', symbol: 'ADA' },
  'DOGEUSDT': { name: 'Dogecoin', symbol: 'DOGE' },
  'XRPUSDT': { name: 'Ripple', symbol: 'XRP' },
};

export function useCryptoData() {
  const [data, setData] = useState<Record<string, CryptoData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const symbolsStr = JSON.stringify(SYMBOLS);
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsStr)}`);
        if (!res.ok) throw new Error('Failed to fetch from Binance');
        const tickers = await res.json();
        
        const initialData: Record<string, CryptoData> = {};
        
        const historyPromises = SYMBOLS.map(async (symbol) => {
          try {
            // 96 * 15m = 24h
            const histRes = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=15m&limit=96`);
            const klines = await histRes.json();
            
            const history: ChartDataPoint[] = klines.map((k: any) => ({
              time: Math.floor(k[0] / 1000), // Open time in seconds
              value: parseFloat(k[4]) // Close price
            }));
            return { symbol, history };
          } catch (e) {
            console.error(`Failed to fetch history for ${symbol}`, e);
            return { symbol, history: [] };
          }
        });

        const histories = await Promise.all(historyPromises);
        const historyMap = Object.fromEntries(histories.map(h => [h.symbol, h.history]));

        tickers.forEach((ticker: any) => {
          const symbol = ticker.symbol;
          const meta = ASSET_NAMES[symbol];
          if (meta) {
            initialData[symbol] = {
              id: symbol,
              symbol: meta.symbol,
              name: meta.name,
              price: parseFloat(ticker.lastPrice),
              previousPrice: null,
              change24h: parseFloat(ticker.priceChangePercent),
              volume24h: parseFloat(ticker.quoteVolume),
              history: historyMap[symbol] || []
            };
          }
        });

        setData(initialData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load initial data. API might be blocked.");
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (loading || Object.keys(data).length === 0) return;

    const connectWs = () => {
      const streams = SYMBOLS.map(s => `${s.toLowerCase()}@ticker`).join('/');
      const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const symbol = message.s; // Symbol
        const newPrice = parseFloat(message.c); // Last price
        const changePercent = parseFloat(message.P); // Price change percent
        const volume = parseFloat(message.q); // Quote asset volume

        if (!symbol || !ASSET_NAMES[symbol]) return;

        setData(prevData => {
          if (!prevData[symbol]) return prevData;
          
          if (prevData[symbol].price === newPrice) return prevData;

          const newData = { ...prevData };
          const lastHistory = newData[symbol].history[newData[symbol].history.length - 1];
          const now = Math.floor(Date.now() / 1000);
          
          let updatedHistory = [...newData[symbol].history];
          if (lastHistory && now - lastHistory.time < 60) {
            updatedHistory[updatedHistory.length - 1] = { ...lastHistory, value: newPrice };
          } else {
            updatedHistory.push({ time: now, value: newPrice });
          }

          newData[symbol] = {
            ...newData[symbol],
            previousPrice: newData[symbol].price,
            price: newPrice,
            change24h: changePercent,
            volume24h: volume,
            history: updatedHistory
          };

          return newData;
        });
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected, reconnecting...");
        setTimeout(connectWs, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };
    };

    connectWs();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [loading]);

  return { data, loading, error, ASSETS: SYMBOLS };
}
