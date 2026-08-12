import type { ProcessStepCode, ProcessStepMetadata } from './types';

export const PROCESS_STEPS = [
  {
    code: 'START',
    kind: 'start-event',
    title: 'Solicitar registro',
    label: 'Solicitar registro',
    heading: 'Solicitar registro',
    description: 'Preencha os dados necessários para iniciar o processo.',
    stepIndex: 0,
    conditional: false,
  },
  {
    code: 'T1',
    kind: 'human-task',
    title: 'T01 - Fazer o cadastro',
    label: 'Fazer o cadastro',
    heading: 'Fazer o cadastro',
    description: 'Realize o cadastro utilizando as informações da solicitação.',
    stepIndex: 1,
    conditional: false,
  },
  {
    code: 'T2',
    kind: 'human-task',
    title: 'T02 - Validar o cadastro',
    label: 'Validar o cadastro',
    heading: 'Validar o cadastro',
    description: 'Analise os dados e use as ações nativas para aprovar, reprovar ou solicitar correção.',
    stepIndex: 2,
    conditional: false,
  },
  {
    code: 'T3',
    kind: 'human-task',
    title: 'T03 - Corrigir o cadastro',
    label: 'Corrigir o cadastro',
    heading: 'Corrigir o cadastro',
    description: 'Consulte as mensagens do Zeev e ajuste as pendências identificadas na validação.',
    stepIndex: 3,
    conditional: true,
  },
  {
    code: 'T4',
    kind: 'human-task',
    title: 'T04 - Fazer o contrato',
    label: 'Fazer o contrato',
    heading: 'Fazer o contrato',
    description: 'Prepare o contrato referente ao cadastro aprovado.',
    stepIndex: 4,
    conditional: false,
  },
  {
    code: 'T5',
    kind: 'human-task',
    title: 'T05 - Validar o contrato',
    label: 'Validar o contrato',
    heading: 'Validar o contrato',
    description: 'Revise o contrato e use as ações nativas para aprovar ou reprovar o contrato.',
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
