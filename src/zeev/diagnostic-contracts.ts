import type { ProcessStepCode, ZeevFieldName } from './types';

export interface StepDiagnosticContract {
  fields: ReadonlySet<ZeevFieldName>;
  sendButton: 'required' | 'required-with-actions';
}

const PERSONAL_DATA_FIELDS = new Set<ZeevFieldName>([
  'nomeCompleto',
  'cpfCliente',
  'nacionalidade',
  'estadoCivil',
  'profissao',
  'tipoDocumento',
  'numeroDocumento',
]);

const NO_REQUIRED_FIELDS = new Set<ZeevFieldName>();

export const TASK_DIAGNOSTIC_CONTRACTS: Readonly<
  Record<ProcessStepCode, StepDiagnosticContract>
> = {
  START: { fields: PERSONAL_DATA_FIELDS, sendButton: 'required' },
  T1: { fields: NO_REQUIRED_FIELDS, sendButton: 'required-with-actions' },
  T2: { fields: NO_REQUIRED_FIELDS, sendButton: 'required-with-actions' },
  T3: { fields: NO_REQUIRED_FIELDS, sendButton: 'required-with-actions' },
  T4: { fields: NO_REQUIRED_FIELDS, sendButton: 'required-with-actions' },
  T5: { fields: NO_REQUIRED_FIELDS, sendButton: 'required-with-actions' },
};
