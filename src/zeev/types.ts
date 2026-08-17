import type { Root } from 'react-dom/client';

export type StageCode = 'START' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

/** @deprecated Prefer StageCode for new domain contracts. */
export type ProcessStepCode = StageCode;

export type ProcessStepKind = 'start-event' | 'human-task';

export type ProcessLane =
  | 'SOLICITANTE'
  | 'ATENDENTE'
  | 'ADMINISTRATIVO';

export type ExecutableRole =
  | 'SOLICITANTE'
  | 'ATENDENTE'
  | 'REQUISITANTE'
  | 'GESTOR_IMEDIATO'
  | 'SUPERIOR'
  | 'ADMINISTRATIVO';

export type DecisionCode =
  | 'APPROVE_REGISTRATION'
  | 'REQUEST_CORRECTION'
  | 'REJECT_REGISTRATION'
  | 'APPROVE_CONTRACT'
  | 'REJECT_CONTRACT';

export type DecisionOutcome = 'advance' | 'correction-loop' | 'terminate';

export type ZeevFieldKind =
  | 'text'
  | 'cpf'
  | 'single-choice'
  | 'phone'
  | 'postal-code'
  | 'date'
  | 'currency'
  | 'long-text'
  | 'file-or-viewer';

export type StageFieldAccess = 'hidden' | 'read' | 'edit';

export type StageFieldPresence =
  | 'required'
  | 'optional'
  | 'not-applicable';

export type ZeevFieldName =
  | 'nomeCompleto'
  | 'cpfCliente'
  | 'nacionalidade'
  | 'estadoCivil'
  | 'profissao'
  | 'tipoDocumento'
  | 'numeroDocumento'
  | 'telefone'
  | 'logradouro'
  | 'cepEndereco'
  | 'numeroEndereco'
  | 'documentoCadastroPdf'
  | 'correcaoRealizada'
  | 'numeroContrato'
  | 'dataContrato'
  | 'valorContrato'
  | 'documentoContratoPdf';

export type ZeevFieldElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export interface ZeevFieldContract {
  name: ZeevFieldName;
  kind: ZeevFieldKind;
}

export interface StageFieldRule {
  access: StageFieldAccess;
  presence: StageFieldPresence;
}

export interface NativeDecisionContract {
  code: DecisionCode;
  zeevLabel: string;
  outcome: DecisionOutcome;
}

export interface StageContract {
  code: StageCode;
  kind: ProcessStepKind;
  title: string;
  lane: ProcessLane;
  executableRoles: readonly ExecutableRole[];
  conditional: boolean;
  fields: Readonly<Record<ZeevFieldName, StageFieldRule>>;
  decisions: readonly NativeDecisionContract[];
}

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

export interface ProcessExecutionIdentity {
  uid: string | null;
  flowExecute: string | null;
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
  | 'domcontentloaded'
  | 'mutation'
  | 'pageshow'
  | 'popstate'
  | 'hashchange'
  | 'retry'
  | 'manual';

export type BootstrapStatus =
  | 'waiting-document'
  | 'waiting-container'
  | 'mounted'
  | 'mount-failed';

export interface FormSectionField {
  name: string;
  label: string;
}

export interface FormSection {
  id: string;
  label: string;
  fields?: readonly FormSectionField[];
}

export interface ViewSignature {
  title: string | null;
  pathname: string;
  search: string;
  observedExecutionIdentity: ProcessExecutionIdentity | null;
  root: HTMLElement | null;
  sectionSignature: string;
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
  access: StageFieldAccess;
  present: boolean;
  presence: 'functional' | 'technical-only' | 'absent';
  elementCount: number;
  candidateCount: number;
  functionalCandidateCount: number;
  technicalCandidateCount: number;
  uploadButtonPresent: boolean;
  downloadButtonCount: number;
  viewerCount: number;
  readonlyRendererCount: number;
  editable: boolean;
  readable: boolean;
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

export interface NativeActionDiagnostic {
  /** Canonical business label retained for backwards compatibility. */
  label: string;
  canonicalLabel: string;
  rawLabel: string | null;
  present: boolean;
  tagName: string | null;
  id: string | null;
  visible: boolean;
  disabled: boolean | null;
}

export interface NativeControlDiagnostic {
  context: 'start' | 'human-task' | 'decision' | null;
  expectedId: 'BtnSend' | 'btnFinish' | null;
  expectedLabel: string | null;
  present: boolean;
  tagName: string | null;
  id: string | null;
  rawLabel: string | null;
  canonicalLabel: string | null;
  visible: boolean;
  disabled: boolean | null;
}

export interface MountDiagnostic {
  count: number;
  id: string | null;
  connected: boolean;
  before: string | null;
}

export interface VisualExperienceDiagnostic {
  experienceShellCount: number;
  stepperCount: number;
  mainColumnCount: number;
  asideCount: number;
  taskCardCount: number;
  nativeActionRegionCount: number;
  fieldSectionCount: number;
  readonlyScalarRendererCount: number;
  fileShellCount: number;
  decisionPanelCount: number;
  hostSidebarCount: number;
  testEnvironmentBarCount: number;
  messageRegionCount: number;
  attachmentRegionCount: number;
  uploadModalCount: number;
}

export interface ZeevFiebDiagnostics {
  passed: boolean;
  status: DiagnosticStatus;
  generatedAt: string;
  version: string | null;
  initialized: boolean;
  bootstrapStatus: BootstrapStatus | null;
  task: {
    code: ProcessStepCode | null;
    title: string | null;
    known: boolean;
  };
  rootCount: number;
  mountBefore: string | null;
  mount: MountDiagnostic;
  sections: readonly FormSection[];
  fields: readonly FieldDiagnostic[];
  radioGroups: readonly RadioGroupDiagnostic[];
  nativeControl: NativeControlDiagnostic;
  visualExperience: VisualExperienceDiagnostic;
  /** @deprecated Prefer nativeControl, which is stage-aware. */
  sendButton: SendButtonDiagnostic;
  actions: readonly NativeActionDiagnostic[];
  checks: readonly DiagnosticCheck[];
  failedChecks: readonly DiagnosticCheck[];
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
  sections: readonly FormSection[];
  executionIdentity: ProcessExecutionIdentity | null;
  visitedStages: readonly StageCode[];
  viewSignature: ViewSignature | null;
  syncCount: number;
  lastSyncDuration: number;
  syncTimer: number | null;
  pendingReason: LifecycleReason | null;
  popstateHandler: EventListener | null;
  hashchangeHandler: EventListener | null;
  domReadyHandler: EventListener | null;
  pageshowHandler: EventListener | null;
  retryTimers: readonly number[];
  bootstrapStatus: BootstrapStatus;
  diagnostics: () => ZeevFiebDiagnostics;
}

declare global {
  interface Window {
    __ZEEV_FIEB__?: ZeevFiebRuntime;
  }
}
