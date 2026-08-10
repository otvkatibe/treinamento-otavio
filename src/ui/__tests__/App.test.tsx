import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { installMatchMedia } from '../../test/match-media';
import { TASKS } from '../../zeev/tasks';
import type { TaskCode, TaskContext, TaskMetadata } from '../../zeev/types';
import { App } from '../App';

function taskByCode(code: TaskCode): TaskMetadata {
  const task = TASKS.find((candidate) => candidate.code === code);
  if (!task) {
    throw new Error(`Task metadata not found: ${code}`);
  }
  return task;
}

function taskContext(code: TaskCode): TaskContext {
  const metadata = taskByCode(code);
  return {
    code: metadata.code,
    title: metadata.title,
    stepIndex: metadata.stepIndex,
    metadata,
  };
}

describe('React Island', () => {
  it.each(TASKS)('exibe o contexto visual de $code', (task) => {
    render(<App taskContext={taskContext(task.code)} />);

    expect(
      screen.getByRole('heading', { level: 2, name: task.heading }),
    ).toBeInTheDocument();
    expect(screen.getByText(task.description)).toBeInTheDocument();
    expect(
      screen.getByText(`Etapa ${task.stepIndex + 1} de ${TASKS.length}`),
    ).toBeInTheDocument();
    expect(screen.getByText('Homologação • v0.3.0')).toBeInTheDocument();
  });

  it('usa Stepper horizontal sem StepContent a partir de 900 px', () => {
    installMatchMedia(900);
    render(<App taskContext={taskContext('T0')} />);

    expect(screen.getByLabelText('Progresso do processo')).toHaveAttribute(
      'data-layout',
      'horizontal',
    );
    expect(screen.queryAllByTestId(/^step-content-/)).toHaveLength(0);
  });

  it('usa Stepper vertical com StepContent abaixo de 900 px', () => {
    installMatchMedia(899);
    render(<App taskContext={taskContext('T0')} />);

    expect(screen.getByLabelText('Progresso do processo')).toHaveAttribute(
      'data-layout',
      'vertical',
    );
    expect(screen.getAllByTestId(/^step-content-/)).toHaveLength(TASKS.length);
  });

  it('reage deterministicamente a mudanças de largura do matchMedia', () => {
    const matchMedia = installMatchMedia(1024);
    render(<App taskContext={taskContext('T0')} />);

    expect(screen.getByLabelText('Progresso do processo')).toHaveAttribute(
      'data-layout',
      'horizontal',
    );

    act((): void => matchMedia.setWidth(800));

    expect(screen.getByLabelText('Progresso do processo')).toHaveAttribute(
      'data-layout',
      'vertical',
    );
    expect(screen.getAllByTestId(/^step-content-/)).toHaveLength(TASKS.length);
  });

  it('representa os estados atual, concluído, futuro e condicional', () => {
    render(<App taskContext={taskContext('T4')} />);

    expect(document.querySelector('[data-step-code="T0"]')).toHaveAttribute(
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

  it('exibe estado neutro sem Stepper para tarefa desconhecida', () => {
    const unknownTask: TaskContext = {
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
  });
});
