import { appendFileSync, mkdirSync } from "fs";
import { createHash } from "crypto";

export type ValidationArtifactInput = {
agentId: string;
market: string;
action: "ENTER_LONG" | "EXIT" | "HOLD";
reason: string;
executionId?: string;
pnl?: number;
equity?: number;
};

function sha256(input: string) {
return createHash("sha256").update(input).digest("hex");
}

/**
* MVP artifact logger (off-chain proof file).
* Later swap this with on-chain ValidationRegistry write.
*/
export function recordValidationArtifact(input: ValidationArtifactInput) {
const ts = new Date().toISOString();

const intentPayload = {
agentId: input.agentId,
market: input.market,
action: input.action,
reason: input.reason,
ts,
};

const executionPayload = {
executionId: input.executionId || null,
pnl: input.pnl ?? null,
equity: input.equity ?? null,
ts,
};

const intentHash = sha256(JSON.stringify(intentPayload));
const executionHash = sha256(JSON.stringify(executionPayload));

const artifact = {
type: "validation_artifact",
ts,
agentId: input.agentId,
market: input.market,
action: input.action,
reason: input.reason,
intentHash,
executionHash,
proofVersion: "mvp-offchain-v1",
};

mkdirSync("artifacts", { recursive: true });
appendFileSync("artifacts/validation.ndjson", JSON.stringify(artifact) + "\n");

return artifact;
}
