import type {
  ExecutableRole,
  NativeDecisionContract,
  StageCode,
  StageContract,
  StageFieldRule,
  ZeevFieldContract,
  ZeevFieldName,
} from './types';

const HIDDEN_FIELD = {
  access: 'hidden',
  presence: 'not-applicable',
} as const satisfies StageFieldRule;

const REQUIRED_READ_FIELD = {
  access: 'read',
  presence: 'required',
} as const satisfies StageFieldRule;

const OPTIONAL_READ_FIELD = {
  access: 'read',
  presence: 'optional',
} as const satisfies StageFieldRule;

const REQUIRED_EDIT_FIELD = {
  access: 'edit',
  presence: 'required',
} as const satisfies StageFieldRule;

const OPTIONAL_EDIT_FIELD = {
  access: 'edit',
  presence: 'optional',
} as const satisfies StageFieldRule;

export const PERSONAL_FIELD_NAMES = [
  'nomeCompleto',
  'cpfCliente',
  'nacionalidade',
  'estadoCivil',
  'profissao',
  'tipoDocumento',
  'numeroDocumento',
] as const satisfies readonly ZeevFieldName[];

export const REGISTRATION_FIELD_NAMES = [
  'telefone',
  'logradouro',
  'cepEndereco',
  'numeroEndereco',
  'documentoCadastroPdf',
] as const satisfies readonly ZeevFieldName[];

export const CORRECTION_FIELD_NAMES = [
  'correcaoRealizada',
] as const satisfies readonly ZeevFieldName[];

export const CONTRACT_FIELD_NAMES = [
  'numeroContrato',
  'dataContrato',
  'valorContrato',
  'documentoContratoPdf',
] as const satisfies readonly ZeevFieldName[];

export const ZEEV_FIELD_CONTRACTS = {
  nomeCompleto: { name: 'nomeCompleto', kind: 'text' },
  cpfCliente: { name: 'cpfCliente', kind: 'cpf' },
  nacionalidade: { name: 'nacionalidade', kind: 'text' },
  estadoCivil: { name: 'estadoCivil', kind: 'single-choice' },
  profissao: { name: 'profissao', kind: 'text' },
  tipoDocumento: { name: 'tipoDocumento', kind: 'single-choice' },
  numeroDocumento: { name: 'numeroDocumento', kind: 'text' },
  telefone: { name: 'telefone', kind: 'phone' },
  logradouro: { name: 'logradouro', kind: 'text' },
  cepEndereco: { name: 'cepEndereco', kind: 'postal-code' },
  numeroEndereco: { name: 'numeroEndereco', kind: 'text' },
  documentoCadastroPdf: {
    name: 'documentoCadastroPdf',
    kind: 'file-or-viewer',
  },
  correcaoRealizada: { name: 'correcaoRealizada', kind: 'long-text' },
  numeroContrato: { name: 'numeroContrato', kind: 'text' },
  dataContrato: { name: 'dataContrato', kind: 'date' },
  valorContrato: { name: 'valorContrato', kind: 'currency' },
  documentoContratoPdf: {
    name: 'documentoContratoPdf',
    kind: 'file-or-viewer',
  },
} as const satisfies Record<ZeevFieldName, ZeevFieldContract>;

const ALL_FIELD_NAMES = Object.keys(
  ZEEV_FIELD_CONTRACTS,
) as ZeevFieldName[];

function fieldMatrix(
  overrides: Readonly<Partial<Record<ZeevFieldName, StageFieldRule>>>,
): Readonly<Record<ZeevFieldName, StageFieldRule>> {
  return Object.freeze(
    Object.fromEntries(
      ALL_FIELD_NAMES.map((name: ZeevFieldName) => [
        name,
        overrides[name] ?? HIDDEN_FIELD,
      ]),
    ) as Record<ZeevFieldName, StageFieldRule>,
  );
}

function rulesFor(
  names: readonly ZeevFieldName[],
  rule: StageFieldRule,
): Partial<Record<ZeevFieldName, StageFieldRule>> {
  return Object.fromEntries(
    names.map((name: ZeevFieldName) => [name, rule]),
  ) as Partial<Record<ZeevFieldName, StageFieldRule>>;
}

const REQUISITANTE_START_ROLES = [
  'SOLICITANTE',
  'ATENDENTE',
  'REQUISITANTE',
] as const satisfies readonly ExecutableRole[];

const REQUISITANTE_TASK_ROLES = [
  'ATENDENTE',
  'REQUISITANTE',
] as const satisfies readonly ExecutableRole[];

const ADMINISTRATIVE_ROLES = [
  'GESTOR_IMEDIATO',
  'SUPERIOR',
  'ADMINISTRATIVO',
] as const satisfies readonly ExecutableRole[];

export const REGISTRATION_DECISIONS = [
  {
    code: 'APPROVE_REGISTRATION',
    zeevLabel: 'Aprovar',
    outcome: 'advance',
  },
  {
    code: 'REQUEST_CORRECTION',
    zeevLabel: 'Solicitar correção',
    outcome: 'correction-loop',
  },
  {
    code: 'REJECT_REGISTRATION',
    zeevLabel: 'Reprovar',
    outcome: 'terminate',
  },
] as const satisfies readonly NativeDecisionContract[];

export const CONTRACT_DECISIONS = [
  {
    code: 'APPROVE_CONTRACT',
    zeevLabel: 'Aprovar o contrato',
    outcome: 'terminate',
  },
  {
    code: 'REJECT_CONTRACT',
    zeevLabel: 'Reprovar o contrato',
    outcome: 'terminate',
  },
] as const satisfies readonly NativeDecisionContract[];

const NO_DECISIONS = [] as const satisfies readonly NativeDecisionContract[];

export const STAGE_CONTRACTS = {
  START: {
    code: 'START',
    kind: 'start-event',
    title: 'Solicitar registro',
    lane: 'SOLICITANTE',
    executableRoles: REQUISITANTE_START_ROLES,
    conditional: false,
    fields: fieldMatrix({
      ...rulesFor(PERSONAL_FIELD_NAMES, REQUIRED_EDIT_FIELD),
    }),
    decisions: NO_DECISIONS,
  },
  T1: {
    code: 'T1',
    kind: 'human-task',
    title: 'T01 - Fazer o cadastro',
    lane: 'ATENDENTE',
    executableRoles: REQUISITANTE_TASK_ROLES,
    conditional: false,
    fields: fieldMatrix({
      ...rulesFor(PERSONAL_FIELD_NAMES, OPTIONAL_EDIT_FIELD),
      ...rulesFor(REGISTRATION_FIELD_NAMES, REQUIRED_EDIT_FIELD),
    }),
    decisions: NO_DECISIONS,
  },
  T2: {
    code: 'T2',
    kind: 'human-task',
    title: 'T02 - Validar o cadastro',
    lane: 'ADMINISTRATIVO',
    executableRoles: ADMINISTRATIVE_ROLES,
    conditional: false,
    fields: fieldMatrix({
      ...rulesFor(PERSONAL_FIELD_NAMES, REQUIRED_READ_FIELD),
      ...rulesFor(REGISTRATION_FIELD_NAMES, REQUIRED_READ_FIELD),
      documentoCadastroPdf: REQUIRED_EDIT_FIELD,
    }),
    decisions: REGISTRATION_DECISIONS,
  },
  T3: {
    code: 'T3',
    kind: 'human-task',
    title: 'T03 - Corrigir o cadastro',
    lane: 'ATENDENTE',
    executableRoles: REQUISITANTE_TASK_ROLES,
    conditional: true,
    fields: fieldMatrix({
      ...rulesFor(PERSONAL_FIELD_NAMES, REQUIRED_EDIT_FIELD),
      ...rulesFor(REGISTRATION_FIELD_NAMES, REQUIRED_EDIT_FIELD),
      correcaoRealizada: OPTIONAL_EDIT_FIELD,
    }),
    decisions: NO_DECISIONS,
  },
  T4: {
    code: 'T4',
    kind: 'human-task',
    title: 'T04 - Fazer o contrato',
    lane: 'ADMINISTRATIVO',
    executableRoles: ADMINISTRATIVE_ROLES,
    conditional: false,
    fields: fieldMatrix({
      ...rulesFor(PERSONAL_FIELD_NAMES, OPTIONAL_READ_FIELD),
      ...rulesFor(REGISTRATION_FIELD_NAMES, OPTIONAL_READ_FIELD),
      documentoCadastroPdf: OPTIONAL_EDIT_FIELD,
      ...rulesFor(CONTRACT_FIELD_NAMES, REQUIRED_EDIT_FIELD),
    }),
    decisions: NO_DECISIONS,
  },
  T5: {
    code: 'T5',
    kind: 'human-task',
    title: 'T05 - Validar o contrato',
    lane: 'ADMINISTRATIVO',
    executableRoles: ADMINISTRATIVE_ROLES,
    conditional: false,
    fields: fieldMatrix({
      ...rulesFor(PERSONAL_FIELD_NAMES, OPTIONAL_READ_FIELD),
      ...rulesFor(REGISTRATION_FIELD_NAMES, OPTIONAL_READ_FIELD),
      ...rulesFor(CONTRACT_FIELD_NAMES, REQUIRED_READ_FIELD),
    }),
    decisions: CONTRACT_DECISIONS,
  },
} as const satisfies Readonly<Record<StageCode, StageContract>>;
