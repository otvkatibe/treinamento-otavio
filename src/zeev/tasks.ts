import type { TaskCode, TaskMetadata } from './types';

export const TASKS = [
  {
    code: 'T0',
    title: 'Solicitar registro',
    label: 'Solicitação',
    heading: 'Solicitação de registro',
    description: 'Preencha os dados necessários para iniciar o processo.',
    stepIndex: 0,
    conditional: false,
  },
  {
    code: 'T1',
    title: 'T01 - Fazer o cadastro',
    label: 'Cadastro',
    heading: 'Cadastro',
    description: 'Realize o cadastro utilizando as informações da solicitação.',
    stepIndex: 1,
    conditional: false,
  },
  {
    code: 'T2',
    title: 'T02 - Validar o cadastro',
    label: 'Validação',
    heading: 'Validação',
    description: 'Analise os dados cadastrados e registre a decisão.',
    stepIndex: 2,
    conditional: false,
  },
  {
    code: 'T3',
    title: 'T03 - Corrigir o cadastro',
    label: 'Correção',
    heading: 'Correção',
    description: 'Ajuste as pendências identificadas durante a validação.',
    stepIndex: 3,
    conditional: true,
  },
  {
    code: 'T4',
    title: 'T04 - Fazer o contrato',
    label: 'Contrato',
    heading: 'Contrato',
    description: 'Prepare o contrato referente ao cadastro aprovado.',
    stepIndex: 4,
    conditional: false,
  },
  {
    code: 'T5',
    title: 'T05 - Validar o contrato',
    label: 'Validação final',
    heading: 'Validação final',
    description: 'Revise o contrato e conclua a etapa final.',
    stepIndex: 5,
    conditional: false,
  },
] as const satisfies readonly TaskMetadata[];

export const TASK_CODES = TASKS.map(({ code }) => code) as readonly TaskCode[];

export function normalizeTaskTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ');
}

export function getTaskByTitle(title: string): TaskMetadata | null {
  const normalizedTitle = normalizeTaskTitle(title);
  return TASKS.find((task) => task.title === normalizedTitle) ?? null;
}
