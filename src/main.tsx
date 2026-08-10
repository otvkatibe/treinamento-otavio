import './styles/zeev-fieb.css';

import { boot } from './zeev/lifecycle';

boot();

export { App } from './ui/App';
export { muiTheme } from './theme/mui-theme';
export { tokens } from './theme/tokens';
export { zeevAdapter } from './zeev/adapter';
export { ZEEV_FIELDS } from './zeev/fields';
export { boot, scheduleSync, sync, teardown } from './zeev/lifecycle';
export { ZEEV_SELECTORS } from './zeev/selectors';
export { getTaskByTitle, normalizeTaskTitle, TASK_CODES, TASKS } from './zeev/tasks';
export type {
  AppState,
  LifecycleReason,
  TaskCode,
  TaskContext,
  TaskMetadata,
  ViewSignature,
  VisualConfig,
  ZeevElements,
  ZeevFiebRuntime,
  ZeevFieldElement,
  ZeevFieldName,
} from './zeev/types';
