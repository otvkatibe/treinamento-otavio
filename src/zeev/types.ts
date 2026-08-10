import type { Root } from 'react-dom/client';

export type TaskCode = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

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

export interface TaskMetadata {
  code: TaskCode;
  title: string;
  label: string;
  heading: string;
  description: string;
  stepIndex: number;
  conditional: boolean;
}

export interface TaskContext {
  code: TaskCode | null;
  title: string;
  stepIndex: number | null;
  metadata: TaskMetadata | null;
}

export interface AppState {
  version: string;
  initialized: boolean;
  currentTask: TaskContext | null;
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

export interface ZeevFiebRuntime {
  version: string;
  initialized: boolean;
  observer: MutationObserver | null;
  reactRoot: Root | null;
  reactMountElement: HTMLElement | null;
  reactContentNodes: readonly Node[];
  mountElement: HTMLElement | null;
  currentTask: TaskContext | null;
  viewSignature: ViewSignature | null;
  syncCount: number;
  lastSyncDuration: number;
  syncTimer: number | null;
  pendingReason: LifecycleReason | null;
  popstateHandler: EventListener | null;
  hashchangeHandler: EventListener | null;
  domReadyHandler: EventListener | null;
}

declare global {
  interface Window {
    __ZEEV_FIEB__?: ZeevFiebRuntime;
  }
}
