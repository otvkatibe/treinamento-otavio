import './styles/zeev-fieb.css';

import { boot } from './zeev/lifecycle';

boot();

export { App } from './ui/App';
export { muiTheme } from './theme/mui-theme';
export { tokens } from './theme/tokens';
export { zeevAdapter } from './zeev/adapter';
export { runDiagnostics } from './zeev/diagnostics';
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
