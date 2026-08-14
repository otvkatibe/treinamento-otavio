import type { StageCode } from '../zeev/types';

export interface TaskPresentation {
  eyebrow: string;
  guidance: string;
  sections: readonly string[];
  checklist: readonly string[];
  tone: 'primary' | 'warning' | 'success';
}

export const TASK_PRESENTATION = {
  START: {
    eyebrow: 'Nova solicitação',
    guidance: 'Informe os dados pessoais com atenção. Os campos marcados como obrigatórios precisam estar completos antes do envio.',
    sections: ['Dados pessoais', 'Identificação'],
    checklist: ['Revise o CPF e o documento', 'Escolha uma opção em cada seleção', 'Envie pela ação nativa do Zeev'],
    tone: 'primary',
  },
  T1: {
    eyebrow: 'Cadastro em andamento',
    guidance: 'Complete os dados de contato e endereço e anexe o documento cadastral em PDF.',
    sections: ['Resumo da solicitação', 'Contato e endereço', 'Documento cadastral'],
    checklist: ['Confirme telefone e CEP', 'Anexe o cadastro', 'Conclua a tarefa no Zeev'],
    tone: 'primary',
  },
  T2: {
    eyebrow: 'Validação cadastral',
    guidance: 'Confira os dados e o documento antes de selecionar uma das decisões disponíveis.',
    sections: ['Dados pessoais', 'Contato e endereço', 'Documento cadastral', 'Decisão do validador'],
    checklist: ['Leia os dados apresentados', 'Confira o arquivo', 'Registre a decisão adequada'],
    tone: 'success',
  },
  T3: {
    eyebrow: 'Correção solicitada',
    guidance: 'Consulte as pendências apontadas e corrija somente o que for necessário antes de reenviar.',
    sections: ['Pendências apontadas', 'Dados para correção', 'Documento cadastral'],
    checklist: ['Leia as mensagens do processo', 'Atualize os dados indicados', 'Descreva a correção realizada'],
    tone: 'warning',
  },
  T4: {
    eyebrow: 'Formalização',
    guidance: 'Preencha as informações do contrato e anexe o documento final para validação.',
    sections: ['Cadastro aprovado', 'Informações do contrato', 'Documento do contrato'],
    checklist: ['Confirme número e data', 'Revise o valor', 'Anexe o contrato em PDF'],
    tone: 'primary',
  },
  T5: {
    eyebrow: 'Decisão final',
    guidance: 'Revise o resumo consolidado e o documento do contrato antes da decisão final.',
    sections: ['Resumo consolidado', 'Dados do contrato', 'Documento do contrato', 'Decisão do aprovador'],
    checklist: ['Confira os dados do contrato', 'Abra o documento', 'Registre a decisão final'],
    tone: 'success',
  },
} as const satisfies Readonly<Record<StageCode, TaskPresentation>>;
