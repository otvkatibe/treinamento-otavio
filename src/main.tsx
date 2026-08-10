import './styles/zeev-fieb.css';

import { boot } from './zeev/lifecycle';

boot();

export { App } from './ui/App';
export { muiTheme } from './theme/mui-theme';
export { tokens } from './theme/tokens';
export { zeevAdapter } from './zeev/adapter';
export { runDiagnostics } from './zeev/diagnostics';
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
  FieldDiagnostic,
  LifecycleReason,
  MountDiagnostic,
  RadioGroupDiagnostic,
  SendButtonDiagnostic,
  ProcessStepCode,
  ProcessStepContext,
  ProcessStepKind,
  ProcessStepMetadata,
  ViewSignature,
  VisualConfig,
  ZeevElements,
  ZeevFiebRuntime,
  ZeevFiebDiagnostics,
  ZeevFieldElement,
  ZeevFieldName,
} from './zeev/types';
