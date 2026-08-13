import type { ProcessExecutionIdentity, StageCode } from './types';

const STORAGE_PREFIX = 'zeev-fieb:visual-history:v1';
const SCHEMA_VERSION = 1;
const STAGE_CODES = new Set<StageCode>([
  'START',
  'T1',
  'T2',
  'T3',
  'T4',
  'T5',
]);

export interface StoredVisualHistory {
  schemaVersion: 1;
  identity: ProcessExecutionIdentity;
  visitedStages: StageCode[];
}

export interface VisualHistoryState {
  identity: ProcessExecutionIdentity | null;
  visitedStages: readonly StageCode[];
}

export interface VisualHistoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface ResolvedHistory {
  canonical: string;
  history: StoredVisualHistory;
}

function normalizedAlias(value: string | null): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  return value.trim() || null;
}

export function normalizeExecutionIdentity(
  identity: ProcessExecutionIdentity | null,
): ProcessExecutionIdentity | null {
  if (!identity) {
    return null;
  }

  const normalized = {
    uid: normalizedAlias(identity.uid),
    flowExecute: normalizedAlias(identity.flowExecute),
  };

  return normalized.uid !== null || normalized.flowExecute !== null
    ? normalized
    : null;
}

function identityConflicts(
  left: ProcessExecutionIdentity,
  right: ProcessExecutionIdentity,
): boolean {
  return (
    (left.uid !== null && right.uid !== null && left.uid !== right.uid) ||
    (left.flowExecute !== null &&
      right.flowExecute !== null &&
      left.flowExecute !== right.flowExecute)
  );
}

function mergeIdentity(
  left: ProcessExecutionIdentity | null,
  right: ProcessExecutionIdentity | null,
): ProcessExecutionIdentity | null {
  if (!left) return right;
  if (!right) return left;
  if (identityConflicts(left, right)) return right;

  return {
    uid: left.uid ?? right.uid,
    flowExecute: left.flowExecute ?? right.flowExecute,
  };
}

function isStageCode(value: unknown): value is StageCode {
  return typeof value === 'string' && STAGE_CODES.has(value as StageCode);
}

function deduplicateStages(stages: readonly unknown[]): StageCode[] {
  return Array.from(new Set(stages.filter(isStageCode)));
}

function parseStoredHistory(raw: string | null): StoredVisualHistory | null {
  if (!raw) return null;

  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return null;

    const candidate = value as Partial<StoredVisualHistory>;
    if (candidate.schemaVersion !== SCHEMA_VERSION) return null;
    if (!Array.isArray(candidate.visitedStages)) return null;
    if (!candidate.visitedStages.every(isStageCode)) return null;

    const identity = normalizeExecutionIdentity(
      candidate.identity as ProcessExecutionIdentity | null,
    );
    if (!identity) return null;

    return {
      schemaVersion: SCHEMA_VERSION,
      identity,
      visitedStages: deduplicateStages(candidate.visitedStages),
    };
  } catch {
    return null;
  }
}

function encoded(value: string): string {
  return encodeURIComponent(value);
}

function canonicalName(identity: ProcessExecutionIdentity): string {
  if (identity.uid && identity.flowExecute) {
    return `uid:${encoded(identity.uid)}|flow:${encoded(identity.flowExecute)}`;
  }
  if (identity.uid) return `uid:${encoded(identity.uid)}`;
  return `flow:${encoded(identity.flowExecute ?? '')}`;
}

function recordKey(canonical: string): string {
  return `${STORAGE_PREFIX}:record:${canonical}`;
}

function aliasKeys(identity: ProcessExecutionIdentity): string[] {
  const keys: string[] = [];
  if (identity.uid) keys.push(`${STORAGE_PREFIX}:uid:${encoded(identity.uid)}`);
  if (identity.flowExecute) {
    keys.push(`${STORAGE_PREFIX}:flow:${encoded(identity.flowExecute)}`);
  }
  return keys;
}

function safeGet(storage: VisualHistoryStorage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function resolveStoredHistory(
  storage: VisualHistoryStorage,
  observed: ProcessExecutionIdentity,
): ResolvedHistory | null {
  const canonicalCandidates = new Set<string>();
  aliasKeys(observed).forEach((key: string): void => {
    const canonical = safeGet(storage, key);
    if (canonical) canonicalCandidates.add(canonical);
  });

  const directCanonical = canonicalName(observed);
  if (safeGet(storage, recordKey(directCanonical))) {
    canonicalCandidates.add(directCanonical);
  }

  const resolved = Array.from(canonicalCandidates)
    .map((canonical: string): ResolvedHistory | null => {
      const history = parseStoredHistory(
        safeGet(storage, recordKey(canonical)),
      );
      if (!history || identityConflicts(history.identity, observed)) return null;
      return { canonical, history };
    })
    .filter((value): value is ResolvedHistory => value !== null);

  return resolved.length === 1 ? resolved[0] : null;
}

function persistHistory(
  storage: VisualHistoryStorage,
  history: StoredVisualHistory,
  previousCanonical: string | null,
): void {
  const canonical = canonicalName(history.identity);

  try {
    storage.setItem(recordKey(canonical), JSON.stringify(history));
    aliasKeys(history.identity).forEach((key: string): void => {
      storage.setItem(key, canonical);
    });
    if (previousCanonical && previousCanonical !== canonical) {
      storage.removeItem(recordKey(previousCanonical));
    }
  } catch {
    // sessionStorage is an optional optimization. Runtime memory remains valid.
  }
}

export function getSessionStorage(): VisualHistoryStorage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function reconcileVisualHistory(
  current: VisualHistoryState,
  observedIdentity: ProcessExecutionIdentity | null,
  currentStage: StageCode | null,
  storage: VisualHistoryStorage | null = getSessionStorage(),
): VisualHistoryState {
  const observed = normalizeExecutionIdentity(observedIdentity);
  const currentIdentity = normalizeExecutionIdentity(current.identity);
  const currentConflicts =
    currentIdentity !== null &&
    observed !== null &&
    identityConflicts(currentIdentity, observed);
  const baseStages = currentConflicts ? [] : [...current.visitedStages];
  let identity = mergeIdentity(currentConflicts ? null : currentIdentity, observed);
  let stages = baseStages;
  let previousCanonical: string | null = null;

  if (storage && identity) {
    const stored = resolveStoredHistory(storage, identity);
    if (stored) {
      previousCanonical = stored.canonical;
      identity = mergeIdentity(stored.history.identity, identity);
      stages = deduplicateStages([
        ...stored.history.visitedStages,
        ...baseStages,
      ]);
    }
  }

  if (currentStage && !stages.includes(currentStage)) {
    stages.push(currentStage);
  }

  if (storage && identity) {
    persistHistory(
      storage,
      {
        schemaVersion: SCHEMA_VERSION,
        identity,
        visitedStages: stages,
      },
      previousCanonical,
    );
  }

  return { identity, visitedStages: stages };
}

export const VISUAL_HISTORY_STORAGE_PREFIX = STORAGE_PREFIX;
