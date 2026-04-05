import { MarketTick } from "./types";

// MVP mock data (later replace with real Kraken CLI calls)
export async function fetchMarketTick(symbol = "BTCUSDT"): Promise<MarketTick> {
const base = 68000 + Math.random() * 1000;
const ema200 = 67850;
const rsi14 = 20 + Math.random() * 60;
const volatility1h = Math.random() * 3;

return {
symbol,
price: Number(base.toFixed(2)),
ema200,
rsi14: Number(rsi14.toFixed(2)),
volatility1h: Number(volatility1h.toFixed(2)),
timestamp: new Date().toISOString(),
};
}

export async function executePaperTrade(side: "BUY" | "SELL", sizeUsd: number) {
return {
ok: true,
side,
sizeUsd,
executionId: `exec_${Date.now()}`,
ts: new Date().toISOString(),
};
}
