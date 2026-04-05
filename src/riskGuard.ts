import { RiskDecision, RiskState } from "./types";

const MAX_POSITION_PCT = 5; // 5%
const GLOBAL_DRAWDOWN_LIMIT = 0.08; // 8%
const COOLDOWN_AFTER_LOSS_MS = 5 * 60 * 1000; // 5 min
const PAUSE_AFTER_STREAK_MS = 60 * 60 * 1000; // 1h

export function evaluateRisk(state: RiskState, now: number): RiskDecision {
if (state.pausedUntil && now < state.pausedUntil) {
return { allowed: false, reason: "SAFETY PAUSE ACTIVE", positionSizePct: 0 };
}

const ddFromPeak = (state.peakEquity - state.equity) / Math.max(state.peakEquity, 1);
if (ddFromPeak >= GLOBAL_DRAWDOWN_LIMIT) {
return { allowed: false, reason: "GLOBAL DRAWDOWN LIMIT HIT", positionSizePct: 0 };
}

if (state.lastTradeAt && now - state.lastTradeAt < COOLDOWN_AFTER_LOSS_MS) {
return { allowed: false, reason: "COOLDOWN ACTIVE", positionSizePct: 0 };
}

return { allowed: true, reason: "RISK OK", positionSizePct: MAX_POSITION_PCT };
}

export function applyTradeOutcome(state: RiskState, pnl: number, now: number): RiskState {
const newEquity = state.equity + pnl;
const newPeak = Math.max(state.peakEquity, newEquity);

let losingStreak = state.losingStreak;
let pausedUntil = state.pausedUntil;

if (pnl < 0) {
losingStreak += 1;
if (losingStreak >= 3) {
pausedUntil = now + PAUSE_AFTER_STREAK_MS;
}
} else {
losingStreak = 0;
}

return {
...state,
equity: newEquity,
peakEquity: newPeak,
losingStreak,
pausedUntil,
lastTradeAt: now,
};
}
