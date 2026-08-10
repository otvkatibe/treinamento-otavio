import type { ZeevFieldName } from './types';

interface ZeevFieldDefinition {
  selector: string;
  valueCardinality: 'single';
  structure: 'control' | 'radio-group';
}

export const ZEEV_FIELDS = {
  nomeCompleto: {
    selector:
      'input[type="text"][data-name="nomeCompleto"][data-fieldformat="TEXT"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  cpfCliente: {
    selector:
      'input[type="text"][data-name="cpfCliente"][data-fieldformat="TEXT"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  nacionalidade: {
    selector:
      'input[type="text"][data-name="nacionalidade"][data-fieldformat="TEXT"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  estadoCivil: {
    selector:
      'input[type="radio"][data-name="estadoCivil"][data-fieldformat="RADIO"]',
    valueCardinality: 'single',
    structure: 'radio-group',
  },
  profissao: {
    selector:
      'input[type="text"][data-name="profissao"][data-fieldformat="TEXT"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  tipoDocumento: {
    selector:
      'input[type="radio"][data-name="tipoDocumento"][data-fieldformat="RADIO"]',
    valueCardinality: 'single',
    structure: 'radio-group',
  },
  numeroDocumento: {
    selector:
      'input[type="text"][data-name="numeroDocumento"][data-fieldformat="TEXT"]',
    valueCardinality: 'single',
    structure: 'control',
  },
} as const satisfies Record<ZeevFieldName, ZeevFieldDefinition>;
