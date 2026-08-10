import type { Root } from 'react-dom/client';

export type ProcessStepCode = 'START' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

export type ProcessStepKind = 'start-event' | 'human-task';

export type ZeevFieldName =
  | 'nomeCompleto'
  | 'cpfCliente'
  | 'nacionalidade'
  | 'estadoCivil'
  | 'profissao'
  | 'tipoDocumento'
  | 'numeroDocumento';

export type ZeevFieldElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export interface ProcessStepMetadata {
  code: ProcessStepCode;
  kind: ProcessStepKind;
  title: string;
  label: string;
  heading: string;
  description: string;
  stepIndex: number;
  conditional: boolean;
}

export interface ProcessStepContext {
  code: ProcessStepCode | null;
  title: string;
  stepIndex: number | null;
  metadata: ProcessStepMetadata | null;
}

export interface AppState {
  version: string;
  initialized: boolean;
  currentTask: ProcessStepContext | null;
}

export interface ZeevElements {
  root: HTMLElement | null;
  form: HTMLElement | null;
  controllers: HTMLElement | null;
  buttons: HTMLElement | null;
  sendButton: HTMLButtonElement | null;
}

export interface VisualConfig {
  environment: 'homologacao' | 'producao';
  version: string;
  compact: boolean;
  primaryColor: string;
}

export type LifecycleReason =
  | 'boot'
  | 'mutation'
  | 'popstate'
  | 'hashchange'
  | 'manual';

export interface ViewSignature {
  title: string | null;
  pathname: string;
  search: string;
  root: HTMLElement | null;
}

export type DiagnosticStatus = 'PASS' | 'FAIL' | 'SKIP/N/A';

export type DiagnosticValue = string | number | boolean | null;

export interface DiagnosticCheck {
  id: string;
  label: string;
  status: DiagnosticStatus;
  expected: DiagnosticValue;
  observed: DiagnosticValue;
}

export interface FieldDiagnostic {
  name: ZeevFieldName;
  present: boolean;
  elementCount: number;
  tagName: string | null;
  inputType: string | null;
  fieldFormat: string | null;
  height: string | null;
  boxSizing: string | null;
  maxWidth: string | null;
}

export interface RadioGroupDiagnostic {
  name: 'estadoCivil' | 'tipoDocumento';
  optionCount: number;
  checkedCount: number;
  selectedValue: string | null;
}

export interface SendButtonDiagnostic {
  present: boolean;
  tagName: string | null;
  id: string | null;
  disabled: boolean | null;
}

export interface MountDiagnostic {
  count: number;
  id: string | null;
  connected: boolean;
  before: string | null;
}

export interface ZeevFiebDiagnostics {
  passed: boolean;
  status: DiagnosticStatus;
  generatedAt: string;
  version: string | null;
  initialized: boolean;
  task: {
    code: ProcessStepCode | null;
    title: string | null;
    known: boolean;
  };
  rootCount: number;
  mountBefore: string | null;
  mount: MountDiagnostic;
  fields: readonly FieldDiagnostic[];
  radioGroups: readonly RadioGroupDiagnostic[];
  sendButton: SendButtonDiagnostic;
  checks: readonly DiagnosticCheck[];
}

export interface ZeevFiebRuntime {
  version: string;
  initialized: boolean;
  observer: MutationObserver | null;
  reactRoot: Root | null;
  reactMountElement: HTMLElement | null;
  reactContentNodes: readonly Node[];
  mountElement: HTMLElement | null;
  currentTask: ProcessStepContext | null;
  viewSignature: ViewSignature | null;
  syncCount: number;
  lastSyncDuration: number;
  syncTimer: number | null;
  pendingReason: LifecycleReason | null;
  popstateHandler: EventListener | null;
  hashchangeHandler: EventListener | null;
  domReadyHandler: EventListener | null;
  diagnostics: () => ZeevFiebDiagnostics;
}

declare global {
  interface Window {
    __ZEEV_FIEB__?: ZeevFiebRuntime;
  }
}
