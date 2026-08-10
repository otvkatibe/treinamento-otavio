import type { ZeevFieldName } from './types';

interface ZeevFieldDefinition {
  selector: `[data-name="${ZeevFieldName}"]`;
  multiple: boolean;
}

export const ZEEV_FIELDS = {
  nomeCompleto: { selector: '[data-name="nomeCompleto"]', multiple: false },
  cpfCliente: { selector: '[data-name="cpfCliente"]', multiple: false },
  nacionalidade: { selector: '[data-name="nacionalidade"]', multiple: false },
  estadoCivil: { selector: '[data-name="estadoCivil"]', multiple: true },
  profissao: { selector: '[data-name="profissao"]', multiple: false },
  tipoDocumento: { selector: '[data-name="tipoDocumento"]', multiple: true },
  numeroDocumento: { selector: '[data-name="numeroDocumento"]', multiple: false },
} as const satisfies Record<ZeevFieldName, ZeevFieldDefinition>;
