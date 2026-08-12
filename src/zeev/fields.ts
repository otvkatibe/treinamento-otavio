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
    selector: '[data-name="estadoCivil"]',
    valueCardinality: 'single',
    structure: 'radio-group',
  },
  profissao: {
    selector: '[data-name="profissao"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  tipoDocumento: {
    selector: '[data-name="tipoDocumento"]',
    valueCardinality: 'single',
    structure: 'radio-group',
  },
  numeroDocumento: {
    selector: '[data-name="numeroDocumento"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  telefone: {
    selector: '[data-name="telefone"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  logradouro: {
    selector: '[data-name="logradouro"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  cepEndereco: {
    selector: '[data-name="cepEndereco"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  numeroEndereco: {
    selector: '[data-name="numeroEndereco"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  documentoCadastroPdf: {
    selector: '[data-name="documentoCadastroPdf"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  correcaoRealizada: {
    selector: '[data-name="correcaoRealizada"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  numeroContrato: {
    selector: '[data-name="numeroContrato"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  dataContrato: {
    selector: '[data-name="dataContrato"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  valorContrato: {
    selector: '[data-name="valorContrato"]',
    valueCardinality: 'single',
    structure: 'control',
  },
  documentoContratoPdf: {
    selector: '[data-name="documentoContratoPdf"]',
    valueCardinality: 'single',
    structure: 'control',
  },
} as const satisfies Record<ZeevFieldName, ZeevFieldDefinition>;
