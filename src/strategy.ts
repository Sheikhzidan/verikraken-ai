import { MarketTick, TradeSignal } from "./types";

export function generateSignal(tick: MarketTick, inPosition: boolean): TradeSignal {
// Relaxed MVP thresholds to trigger more demo trades
const entry =
tick.rsi14 < 45 &&
tick.price > tick.ema200 &&
tick.volatility1h < 3;

const exit = tick.rsi14 > 55;

if (!inPosition && entry) {
return {
action: "ENTER_LONG",
reason: "RSI<45, price>EMA200, volatility<3",
};
}

if (inPosition && exit) {
return {
action: "EXIT",
reason: "RSI>55 exit condition",
};
}

return {
action: "HOLD",
reason: "No valid setup",
};
}
