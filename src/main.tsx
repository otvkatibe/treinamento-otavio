import './styles/zeev-fieb.css';

import { boot } from './zeev/lifecycle';

boot();

export { App } from './ui/App';
export { muiTheme } from './theme/mui-theme';
export { tokens } from './theme/tokens';
export {
  canonicalizeNativeActionLabel,
  observeNativeAction,
  zeevAdapter,
} from './zeev/adapter';
export type {
  NativeActionObservation,
  ZeevAdapterContract,
} from './zeev/adapter';
export { runDiagnostics } from './zeev/diagnostics';
export {
  getNativeStageControlContract,
  resolveNativeStageControls,
} from './zeev/native-controls';
export type {
  NativeControlContext,
  NativePrimaryControlContract,
  NativeStageControlContract,
  ResolvedNativeStageControls,
} from './zeev/native-controls';
export {
  CONTRACT_DECISIONS,
  CONTRACT_FIELD_NAMES,
  CORRECTION_FIELD_NAMES,
  PERSONAL_FIELD_NAMES,
  REGISTRATION_DECISIONS,
  REGISTRATION_FIELD_NAMES,
  STAGE_CONTRACTS,
  ZEEV_FIELD_CONTRACTS,
} from './zeev/domain-contracts';
export { ZEEV_FIELDS } from './zeev/fields';
export {
  reconcileVisualHistory,
  VISUAL_HISTORY_STORAGE_PREFIX,
} from './zeev/visual-history';
export type {
  StoredVisualHistory,
  VisualHistoryState,
  VisualHistoryStorage,
} from './zeev/visual-history';
export { boot, scheduleSync, sync, teardown } from './zeev/lifecycle';
export { ZEEV_SELECTORS } from './zeev/selectors';
export {
  getStepByTitle,
  normalizeStepTitle,
  PROCESS_STEP_CODES,
  PROCESS_STEPS,
} from './zeev/steps';
export type {
  AppState,
  BootstrapStatus,
  DiagnosticCheck,
  DiagnosticStatus,
  DiagnosticValue,
  DecisionCode,
  DecisionOutcome,
  ExecutableRole,
  FieldDiagnostic,
  LifecycleReason,
  MountDiagnostic,
  NativeActionDiagnostic,
  NativeControlDiagnostic,
  RadioGroupDiagnostic,
  SendButtonDiagnostic,
  NativeDecisionContract,
  ProcessLane,
  StageCode,
  StageContract,
  StageFieldAccess,
  StageFieldPresence,
  StageFieldRule,
  ProcessStepCode,
  ProcessStepContext,
  ProcessExecutionIdentity,
  ProcessStepKind,
  ProcessStepMetadata,
  ViewSignature,
  VisualConfig,
  ZeevElements,
  ZeevFiebRuntime,
  ZeevFiebDiagnostics,
  ZeevFieldElement,
  ZeevFieldContract,
  ZeevFieldKind,
  ZeevFieldName,
} from './zeev/types';
