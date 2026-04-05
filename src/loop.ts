import "dotenv/config";
import { appendFileSync, mkdirSync } from "fs";
import { generateSignal } from "./strategy";
import { applyTradeOutcome, evaluateRisk } from "./riskGuard";
import { executePaperTrade, fetchMarketTick } from "./krakenExec";
import { recordValidationArtifact } from "./erc8004";
import type { RiskState } from "./types";

let inPosition = false;

let riskState: RiskState = {
equity: 10000,
peakEquity: 10000,
dayStartEquity: 10000,
losingStreak: 0,
};

function logLine(obj: any) {
mkdirSync("logs", { recursive: true });
appendFileSync("logs/agent.ndjson", JSON.stringify(obj) + "\n");
console.log(obj);
}

async function cycle() {
const now = Date.now();

const tick = await fetchMarketTick("BTCUSDT");
const signal = generateSignal(tick, inPosition);
const risk = evaluateRisk(riskState, now);

logLine({
type: "checkpoint",
now: new Date(now).toISOString(),
tick,
signal,
risk,
equity: riskState.equity,
});

if (!risk.allowed) {
// optional: record HOLD artifact during safety pause
recordValidationArtifact({
agentId: "verikraken-agent-001",
market: tick.symbol,
action: "HOLD",
reason: risk.reason,
equity: riskState.equity,
});
return;
}

if (signal.action === "ENTER_LONG" && !inPosition) {
const sizeUsd = (risk.positionSizePct / 100) * riskState.equity;
const exec = await executePaperTrade("BUY", sizeUsd);
inPosition = true;

const pnl = Number((Math.random() * 120 - 60).toFixed(2));
riskState = applyTradeOutcome(riskState, pnl, now);

recordValidationArtifact({
agentId: "verikraken-agent-001",
market: tick.symbol,
action: "ENTER_LONG",
reason: signal.reason,
executionId: exec.executionId,
pnl,
equity: riskState.equity,
});

logLine({
type: "trade",
action: "ENTER_LONG",
reason: signal.reason,
exec,
pnl,
equity: riskState.equity,
losingStreak: riskState.losingStreak,
pausedUntil: riskState.pausedUntil ? new Date(riskState.pausedUntil).toISOString() : null,
});
return;
}

if (signal.action === "EXIT" && inPosition) {
const exec = await executePaperTrade("SELL", 0);
inPosition = false;

const pnl = Number((Math.random() * 120 - 60).toFixed(2));
riskState = applyTradeOutcome(riskState, pnl, now);

recordValidationArtifact({
agentId: "verikraken-agent-001",
market: tick.symbol,
action: "EXIT",
reason: signal.reason,
executionId: exec.executionId,
pnl,
equity: riskState.equity,
});

logLine({
type: "trade",
action: "EXIT",
reason: signal.reason,
exec,
pnl,
equity: riskState.equity,
losingStreak: riskState.losingStreak,
pausedUntil: riskState.pausedUntil ? new Date(riskState.pausedUntil).toISOString() : null,
});

return;
}

// if HOLD
recordValidationArtifact({
agentId: "verikraken-agent-001",
market: tick.symbol,
action: "HOLD",
reason: signal.reason,
equity: riskState.equity,
});
}

async function main() {
logLine({ type: "boot", msg: "VeriKraken AI loop started" });

setInterval(() => {
cycle().catch((e) => logLine({ type: "error", error: String(e) }));
}, 30000);

await cycle();
}

main().catch((e) => {
console.error(e);
process.exit(1);
});
