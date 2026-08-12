import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { installMatchMedia } from '../../test/match-media';
import { PROCESS_STEPS } from '../../zeev/steps';
import type {
  ProcessStepCode,
  ProcessStepContext,
  ProcessStepMetadata,
} from '../../zeev/types';
import { App } from '../App';

function taskByCode(code: ProcessStepCode): ProcessStepMetadata {
  const task = PROCESS_STEPS.find((candidate) => candidate.code === code);
  if (!task) {
    throw new Error(`Task metadata not found: ${code}`);
  }
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

describe('React Island', () => {
  it('mantém seis etapas visuais de START até T5', () => {
    expect(
      PROCESS_STEPS.map(({ code, kind, stepIndex, conditional }) => ({
        code,
        kind,
        stepIndex,
        conditional,
      })),
    ).toEqual([
      {
        code: 'START',
        kind: 'start-event',
        stepIndex: 0,
        conditional: false,
      },
      { code: 'T1', kind: 'human-task', stepIndex: 1, conditional: false },
      { code: 'T2', kind: 'human-task', stepIndex: 2, conditional: false },
      { code: 'T3', kind: 'human-task', stepIndex: 3, conditional: true },
      { code: 'T4', kind: 'human-task', stepIndex: 4, conditional: false },
      { code: 'T5', kind: 'human-task', stepIndex: 5, conditional: false },
    ]);
  });

  it.each(PROCESS_STEPS)('exibe o contexto visual de $code', (task) => {
    render(<App taskContext={taskContext(task.code)} />);

    expect(
      screen.getByRole('heading', { level: 2, name: task.heading }),
    ).toBeInTheDocument();
    expect(screen.getByText(task.description)).toBeInTheDocument();
    expect(
      screen.getByText(
        new RegExp(`^Etapa ${task.stepIndex + 1} de ${PROCESS_STEPS.length}`),
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Homologação • v0.3.0')).toBeInTheDocument();
    expect(document.querySelector('[data-zeev-fieb-island="true"]')).toHaveAttribute(
      'data-zeev-fieb-task-known',
      'true',
    );
  });

  it('usa Stepper horizontal sem StepContent a partir de 900 px', () => {
    installMatchMedia(900);
    render(<App taskContext={taskContext('START')} />);

    expect(screen.getByLabelText('Progresso do processo')).toHaveAttribute(
      'data-layout',
      'horizontal',
    );
    expect(screen.queryAllByTestId(/^step-content-/)).toHaveLength(0);
  });

  it('usa Stepper vertical com StepContent abaixo de 900 px', () => {
    installMatchMedia(899);
    render(<App taskContext={taskContext('START')} />);

    expect(screen.getByLabelText('Progresso do processo')).toHaveAttribute(
      'data-layout',
      'vertical',
    );
    expect(screen.getAllByTestId(/^step-content-/)).toHaveLength(
      PROCESS_STEPS.length,
    );
  });

  it('reage deterministicamente a mudanças de largura do matchMedia', () => {
    const matchMedia = installMatchMedia(1024);
    render(<App taskContext={taskContext('START')} />);

    expect(screen.getByLabelText('Progresso do processo')).toHaveAttribute(
      'data-layout',
      'horizontal',
    );

    act((): void => matchMedia.setWidth(800));

    expect(screen.getByLabelText('Progresso do processo')).toHaveAttribute(
      'data-layout',
      'vertical',
    );
    expect(screen.getAllByTestId(/^step-content-/)).toHaveLength(
      PROCESS_STEPS.length,
    );
  });

  it('representa os estados atual, concluído, futuro e condicional', () => {
    render(<App taskContext={taskContext('T4')} />);

    expect(document.querySelector('[data-step-code="START"]')).toHaveAttribute(
      'data-step-state',
      'completed',
    );
    expect(document.querySelector('[data-step-code="T3"]')).toHaveAttribute(
      'data-step-state',
      'conditional',
    );
    expect(document.querySelector('[data-step-code="T4"]')).toHaveAttribute(
      'data-step-state',
      'current',
    );
    expect(document.querySelector('[data-step-code="T5"]')).toHaveAttribute(
      'data-step-state',
      'future',
    );
    expect(screen.getByText('Condicional')).toBeInTheDocument();
  });

  it('representa T3 como concluída quando a rota condicional foi observada', () => {
    render(
      <App
        taskContext={taskContext('T2')}
        visitedStages={['T2', 'T3']}
      />,
    );

    expect(document.querySelector('[data-step-code="T3"]')).toHaveAttribute(
      'data-step-state',
      'completed',
    );
    expect(screen.getByText('Rota percorrida')).toBeInTheDocument();
    expect(screen.getByText('Etapa 3 de 6 • Revalidação')).toBeInTheDocument();
  });

  it('explicita a decisão final ao validar o contrato', () => {
    render(<App taskContext={taskContext('T5')} visitedStages={['T4', 'T5']} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Validar o contrato' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Etapa 6 de 6 • Decisão final')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Revise o contrato e use as ações nativas para aprovar ou reprovar o contrato.',
      ),
    ).toBeInTheDocument();
  });

  it('exibe estado neutro sem Stepper para tarefa desconhecida', () => {
    const unknownTask: ProcessStepContext = {
      code: null,
      title: 'T99 - Etapa externa',
      stepIndex: null,
      metadata: null,
    };

    render(<App taskContext={unknownTask} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Etapa não identificada' }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Progresso do processo')).not.toBeInTheDocument();
    expect(screen.getByText('Homologação • v0.3.0')).toBeInTheDocument();
    expect(document.querySelector('[data-zeev-fieb-island="true"]')).toHaveAttribute(
      'data-zeev-fieb-task-known',
      'false',
    );
  });
});
