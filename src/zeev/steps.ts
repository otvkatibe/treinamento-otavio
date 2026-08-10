import type { ProcessStepCode, ProcessStepMetadata } from './types';

export const PROCESS_STEPS = [
  {
    code: 'START',
    kind: 'start-event',
    title: 'Solicitar registro',
    label: 'Início',
    heading: 'Solicitação de registro',
    description: 'Preencha os dados necessários para iniciar o processo.',
    stepIndex: 0,
    conditional: false,
  },
  {
    code: 'T1',
    kind: 'human-task',
    title: 'T01 - Fazer o cadastro',
    label: 'Cadastro',
    heading: 'Cadastro',
    description: 'Realize o cadastro utilizando as informações da solicitação.',
    stepIndex: 1,
    conditional: false,
  },
  {
    code: 'T2',
    kind: 'human-task',
    title: 'T02 - Validar o cadastro',
    label: 'Validação',
    heading: 'Validação',
    description: 'Analise os dados cadastrados e registre a decisão.',
    stepIndex: 2,
    conditional: false,
  },
  {
    code: 'T3',
    kind: 'human-task',
    title: 'T03 - Corrigir o cadastro',
    label: 'Correção',
    heading: 'Correção',
    description: 'Ajuste as pendências identificadas durante a validação.',
    stepIndex: 3,
    conditional: true,
  },
  {
    code: 'T4',
    kind: 'human-task',
    title: 'T04 - Fazer o contrato',
    label: 'Contrato',
    heading: 'Contrato',
    description: 'Prepare o contrato referente ao cadastro aprovado.',
    stepIndex: 4,
    conditional: false,
  },
  {
    code: 'T5',
    kind: 'human-task',
    title: 'T05 - Validar o contrato',
    label: 'Validação final',
    heading: 'Validação final',
    description: 'Revise o contrato e conclua a etapa final.',
    stepIndex: 5,
    conditional: false,
  },
] as const satisfies readonly ProcessStepMetadata[];

export const PROCESS_STEP_CODES = PROCESS_STEPS.map(
  ({ code }) => code,
) as readonly ProcessStepCode[];

export function normalizeStepTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ');
}

export function getStepByTitle(title: string): ProcessStepMetadata | null {
  const normalizedTitle = normalizeStepTitle(title);
  return (
    PROCESS_STEPS.find((step) => step.title === normalizedTitle) ?? null
  );
}
