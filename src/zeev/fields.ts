import type { ZeevFieldName } from './types';

interface ZeevFieldDefinition {
  selector: string;
  valueCardinality: 'single';
  structure: 'control' | 'radio-group';
}

export const ZEEV_FIELDS = {
  nomeCompleto: {
    selector: '[data-name="nomeCompleto"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  cpfCliente: {
    selector: '[data-name="cpfCliente"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  nacionalidade: {
    selector: '[data-name="nacionalidade"]',
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
    selector: '[data-name="profissao"]',
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
    selector: '[data-name="numeroDocumento"]',
    valueCardinality: 'single',
    structure: 'control',
  },
} as const satisfies Record<ZeevFieldName, ZeevFieldDefinition>;
