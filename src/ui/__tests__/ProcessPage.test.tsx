import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { installMatchMedia } from '../../test/match-media';
import { PROCESS_STEPS } from '../../zeev/steps';
import type {
  ProcessStepCode,
  ProcessStepContext,
  ProcessStepMetadata,
} from '../../zeev/types';
import { App } from '../App';
import { TASK_PRESENTATION } from '../process-content';

function taskByCode(code: ProcessStepCode): ProcessStepMetadata {
  const task = PROCESS_STEPS.find((candidate) => candidate.code === code);
  if (!task) throw new Error(`Task metadata not found: ${code}`);
  return task;
}

function taskContext(code: ProcessStepCode): ProcessStepContext {
  const metadata = taskByCode(code);
  return {
    code: metadata.code,
    title: metadata.title,
    stepIndex: metadata.stepIndex,
    metadata,
  };
}

function role(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    `[data-zeev-fieb-role="${name}"]`,
  );
  if (!element) throw new Error(`Visual role not found: ${name}`);
  return element;
}

describe('shell compartilhado do processo', () => {
  it('expõe a topologia semântica de header, conteúdo e resumo lateral', () => {
    installMatchMedia(1440);
    render(<App taskContext={taskContext('T1')} visitedStages={['START', 'T1']} />);

    const page = role('process-page');
    const header = role('process-header');
    const grid = role('process-grid');
    const taskCard = role('task-card');
    const aside = role('aside-column');

    expect(page).toContainElement(header);
    expect(page).toContainElement(grid);
    expect(grid).toContainElement(taskCard);
    expect(grid).toContainElement(aside);
    expect(taskCard.compareDocumentPosition(aside)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(aside).toContainElement(role('process-summary-card'));
    expect(aside).toContainElement(role('task-guidance'));
    expect(aside).toContainElement(role('checklist-card'));
    expect(screen.getByRole('complementary', { name: 'Resumo e orientação' })).toBe(aside);
  });

  it('mantém os principais landmarks e textos disponíveis em viewport mobile', () => {
    installMatchMedia(320);
    render(<App taskContext={taskContext('START')} />);

    expect(role('process-page')).toHaveAttribute('data-zeev-fieb-stage', 'START');
    expect(screen.getByRole('heading', { level: 2, name: 'Solicitar registro' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 3, name: 'Conteúdo da tarefa' })).toBeVisible();
    expect(screen.getByRole('complementary')).toBeVisible();
    expect(screen.getByLabelText('Progresso do processo')).toHaveAttribute(
      'data-layout',
      'vertical',
    );
  });

  it('apresenta resumo com progresso acessível e histórico visitado', () => {
    render(
      <App
        taskContext={taskContext('T2')}
        visitedStages={['START', 'T1', 'T2', 'T3']}
      />,
    );

    const summary = role('process-summary');
    expect(summary).toHaveTextContent('Validar o cadastro');
    expect(summary).toHaveTextContent('3 de 6');
    expect(summary).toHaveTextContent('START · T01 · T02 · T03');
    expect(within(summary).getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      '50% do fluxo visual',
    );
    expect(document.querySelector('[data-step-code="T2"]')).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(document.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
    expect(screen.getByText('Etapa 3 de 6 • Revalidação')).toBeVisible();
  });
});

describe('apresentação estrutural por tarefa', () => {
  it.each(PROCESS_STEPS)(
    'renderiza stage, orientação e checklist de $code e deriva seções observadas',
    (task): void => {
      const mockSections = [
        { id: '1', label: 'Dados pessoais' },
        { id: '2', label: 'Documentos' },
      ];
      render(
        <App
          taskContext={taskContext(task.code)}
          visitedStages={[task.code]}
          sections={mockSections}
        />,
      );
      const presentation = TASK_PRESENTATION[task.code];
      const island = document.querySelector('[data-zeev-fieb-island="true"]');
      const sectionList = screen.getByLabelText('Seções desta etapa');
      const checklist = screen.getByLabelText('Checklist da etapa');

      expect(island).toHaveAttribute('data-zeev-fieb-stage', task.code);
      expect(role('process-page')).toHaveAttribute(
        'data-zeev-fieb-stage',
        task.code,
      );
      expect(screen.getByText(presentation.eyebrow)).toBeVisible();
      expect(role('task-guidance')).toHaveTextContent(presentation.guidance);
      for (const section of mockSections) {
        expect(within(sectionList).getByText(section.label)).toBeVisible();
      }
      expect(
        sectionList.querySelectorAll('[data-zeev-fieb-role="field-section"]'),
      ).toHaveLength(mockSections.length);
      for (const item of presentation.checklist) {
        expect(within(checklist).getByText(item)).toBeVisible();
      }
      expect(screen.getByText(`${mockSections.length} seções`)).toBeVisible();
      expect(document.querySelectorAll('[data-zeev-fieb-role="process-page"]')).toHaveLength(1);
    },
  );

  it('deriva o contador e os chips da T05 exclusivamente da coleção observada', () => {
    const t05Sections = [
      { id: '7727', label: 'Dados da prestação de serviço' },
      { id: '7728', label: 'Documentos' },
      { id: '7729', label: 'Validação' },
    ];
    render(
      <App
        taskContext={taskContext('T5')}
        visitedStages={['T5']}
        sections={t05Sections}
      />,
    );

    const taskCard = role('task-card');
    expect(within(taskCard).getByText('3 seções')).toBeVisible();

    const sectionElements = taskCard.querySelectorAll(
      '[data-zeev-fieb-role="field-section"]',
    );
    expect(sectionElements).toHaveLength(3);
    expect(
      Array.from(sectionElements).map(
        (el: Element): string | null => el.getAttribute('data-zeev-fieb-section'),
      ),
    ).toEqual(['Dados da prestação de serviço', 'Documentos', 'Validação']);
  });

  it('diferencia visual e textualmente a rota de correção', () => {
    const mockSections = [
      { id: '1', label: 'Pendências apontadas' },
      { id: '2', label: 'Dados para correção' },
    ];
    render(
      <App
        taskContext={taskContext('T3')}
        visitedStages={['T2', 'T3']}
        sections={mockSections}
      />,
    );

    expect(screen.getByText('Correção solicitada')).toBeVisible();
    expect(screen.getByText('Pendências apontadas')).toBeVisible();
    expect(screen.getByText('Etapa 4 de 6 • Rota condicional')).toBeVisible();
    expect(role('task-guidance')).toHaveClass('MuiAlert-colorWarning');
  });

  it('mantém o estado desconhecido fora do shell de tarefa', () => {
    const unknown: ProcessStepContext = {
      code: null,
      title: 'Etapa externa',
      stepIndex: null,
      metadata: null,
    };
    render(<App taskContext={unknown} />);

    expect(document.querySelector('[data-zeev-fieb-island="true"]')).toHaveAttribute(
      'data-zeev-fieb-stage',
      'unknown',
    );
    expect(document.querySelector('[data-zeev-fieb-role="process-page"]')).toBeNull();
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });
});
