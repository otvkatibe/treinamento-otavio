export type TaskCode = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

export type ZeevFieldName =
  | 'nomeCompleto'
  | 'cpfCliente'
  | 'nacionalidade'
  | 'estadoCivil'
  | 'profissao'
  | 'tipoDocumento'
  | 'numeroDocumento';

export interface TaskContext {
  code: TaskCode | null;
  title: string;
  stepIndex: number | null;
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
