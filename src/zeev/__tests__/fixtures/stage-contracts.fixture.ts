import type {
  ExecutableRole,
  ProcessLane,
  ProcessStepKind,
  StageCode,
  ZeevFieldName,
} from '../../types';

export interface ExpectedStageFixture {
  code: StageCode;
  kind: ProcessStepKind;
  title: string;
  lane: ProcessLane;
  executableRoles: readonly ExecutableRole[];
  conditional: boolean;
  fields: {
    requiredEdit: readonly ZeevFieldName[];
    requiredRead: readonly ZeevFieldName[];
    optionalEdit: readonly ZeevFieldName[];
    optionalRead: readonly ZeevFieldName[];
    notApplicable: readonly ZeevFieldName[];
  };
  actions: readonly string[];
}

export const EXPECTED_FIELD_NAMES = [
  'nomeCompleto',
  'cpfCliente',
  'nacionalidade',
  'estadoCivil',
  'profissao',
  'tipoDocumento',
  'numeroDocumento',
  'telefone',
  'logradouro',
  'cepEndereco',
  'numeroEndereco',
  'documentoCadastroPdf',
  'correcaoRealizada',
  'numeroContrato',
  'dataContrato',
  'valorContrato',
  'documentoContratoPdf',
] as const satisfies readonly ZeevFieldName[];

export const EXPECTED_PERSONAL_FIELD_NAMES = [
  'nomeCompleto',
  'cpfCliente',
  'nacionalidade',
  'estadoCivil',
  'profissao',
  'tipoDocumento',
  'numeroDocumento',
] as const satisfies readonly ZeevFieldName[];

export const EXPECTED_REGISTRATION_FIELD_NAMES = [
  'telefone',
  'logradouro',
  'cepEndereco',
  'numeroEndereco',
  'documentoCadastroPdf',
] as const satisfies readonly ZeevFieldName[];

export const EXPECTED_CORRECTION_FIELD_NAMES = [
  'correcaoRealizada',
] as const satisfies readonly ZeevFieldName[];

export const EXPECTED_CONTRACT_FIELD_NAMES = [
  'numeroContrato',
  'dataContrato',
  'valorContrato',
  'documentoContratoPdf',
] as const satisfies readonly ZeevFieldName[];

export const EXPECTED_STAGE_FIXTURES = {
  START: {
    code: 'START',
    kind: 'start-event',
    title: 'Solicitar registro',
    lane: 'SOLICITANTE',
    executableRoles: ['SOLICITANTE', 'ATENDENTE', 'REQUISITANTE'],
    conditional: false,
    fields: {
      requiredEdit: [
        'nomeCompleto',
        'cpfCliente',
        'nacionalidade',
        'estadoCivil',
        'profissao',
        'tipoDocumento',
        'numeroDocumento',
      ],
      requiredRead: [],
      optionalEdit: [],
      optionalRead: [],
      notApplicable: [
        'telefone',
        'logradouro',
        'cepEndereco',
        'numeroEndereco',
        'documentoCadastroPdf',
        'correcaoRealizada',
        'numeroContrato',
        'dataContrato',
        'valorContrato',
        'documentoContratoPdf',
      ],
    },
    actions: [],
  },
  T1: {
    code: 'T1',
    kind: 'human-task',
    title: 'T01 - Fazer o cadastro',
    lane: 'ATENDENTE',
    executableRoles: ['ATENDENTE', 'REQUISITANTE'],
    conditional: false,
    fields: {
      requiredEdit: [
        'telefone',
        'logradouro',
        'cepEndereco',
        'numeroEndereco',
        'documentoCadastroPdf',
      ],
      requiredRead: [],
      optionalEdit: [
        'nomeCompleto',
        'cpfCliente',
        'nacionalidade',
        'estadoCivil',
        'profissao',
        'tipoDocumento',
        'numeroDocumento',
      ],
      optionalRead: [],
      notApplicable: [
        'correcaoRealizada',
        'numeroContrato',
        'dataContrato',
        'valorContrato',
        'documentoContratoPdf',
      ],
    },
    actions: [],
  },
  T2: {
    code: 'T2',
    kind: 'human-task',
    title: 'T02 - Validar o cadastro',
    lane: 'ADMINISTRATIVO',
    executableRoles: ['GESTOR_IMEDIATO', 'SUPERIOR', 'ADMINISTRATIVO'],
    conditional: false,
    fields: {
      requiredEdit: ['documentoCadastroPdf'],
      requiredRead: [
        'nomeCompleto',
        'cpfCliente',
        'nacionalidade',
        'estadoCivil',
        'profissao',
        'tipoDocumento',
        'numeroDocumento',
        'telefone',
        'logradouro',
        'cepEndereco',
        'numeroEndereco',
      ],
      optionalEdit: [],
      optionalRead: [],
      notApplicable: [
        'correcaoRealizada',
        'numeroContrato',
        'dataContrato',
        'valorContrato',
        'documentoContratoPdf',
      ],
    },
    actions: ['Aprovar', 'Solicitar correção', 'Reprovar'],
  },
  T3: {
    code: 'T3',
    kind: 'human-task',
    title: 'T03 - Corrigir o cadastro',
    lane: 'ATENDENTE',
    executableRoles: ['ATENDENTE', 'REQUISITANTE'],
    conditional: true,
    fields: {
      requiredEdit: [
        'nomeCompleto',
        'cpfCliente',
        'nacionalidade',
        'estadoCivil',
        'profissao',
        'tipoDocumento',
        'numeroDocumento',
        'telefone',
        'logradouro',
        'cepEndereco',
        'numeroEndereco',
        'documentoCadastroPdf',
      ],
      requiredRead: [],
      optionalEdit: ['correcaoRealizada'],
      optionalRead: [],
      notApplicable: [
        'numeroContrato',
        'dataContrato',
        'valorContrato',
        'documentoContratoPdf',
      ],
    },
    actions: [],
  },
  T4: {
    code: 'T4',
    kind: 'human-task',
    title: 'T04 - Fazer o contrato',
    lane: 'ADMINISTRATIVO',
    executableRoles: ['GESTOR_IMEDIATO', 'SUPERIOR', 'ADMINISTRATIVO'],
    conditional: false,
    fields: {
      requiredEdit: [
        'numeroContrato',
        'dataContrato',
        'valorContrato',
        'documentoContratoPdf',
      ],
      requiredRead: [],
      optionalEdit: ['documentoCadastroPdf'],
      optionalRead: [
        'nomeCompleto',
        'cpfCliente',
        'nacionalidade',
        'estadoCivil',
        'profissao',
        'tipoDocumento',
        'numeroDocumento',
        'telefone',
        'logradouro',
        'cepEndereco',
        'numeroEndereco',
      ],
      notApplicable: ['correcaoRealizada'],
    },
    actions: [],
  },
  T5: {
    code: 'T5',
    kind: 'human-task',
    title: 'T05 - Validar o contrato',
    lane: 'ADMINISTRATIVO',
    executableRoles: ['GESTOR_IMEDIATO', 'SUPERIOR', 'ADMINISTRATIVO'],
    conditional: false,
    fields: {
      requiredEdit: [],
      requiredRead: [
        'numeroContrato',
        'dataContrato',
        'valorContrato',
        'documentoContratoPdf',
      ],
      optionalEdit: [],
      optionalRead: [
        'nomeCompleto',
        'cpfCliente',
        'nacionalidade',
        'estadoCivil',
        'profissao',
        'tipoDocumento',
        'numeroDocumento',
        'telefone',
        'logradouro',
        'cepEndereco',
        'numeroEndereco',
        'documentoCadastroPdf',
      ],
      notApplicable: ['correcaoRealizada'],
    },
    actions: ['Aprovar o contrato', 'Reprovar o contrato'],
  },
} as const satisfies Readonly<Record<StageCode, ExpectedStageFixture>>;

export const EXPECTED_UNKNOWN_FIXTURE = {
  code: null,
  title: 'T99 - Tela externa',
  known: false,
  actions: [],
} as const;
