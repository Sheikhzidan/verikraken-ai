export type Side = "BUY" | "SELL";

export type MarketTick = {
symbol: string;
price: number;
ema200: number;
rsi14: number;
volatility1h: number; // %
timestamp: string;
};

export type TradeSignal = {
action: "ENTER_LONG" | "EXIT" | "HOLD";
reason: string;
};

export type RiskState = {
equity: number;
peakEquity: number;
dayStartEquity: number;
losingStreak: number;
lastTradeAt?: number;
pausedUntil?: number;
};

export type RiskDecision = {
allowed: boolean;
reason: string;
positionSizePct: number;
};
