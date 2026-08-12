import { describe, expect, it } from 'vitest';

import {
  getStepByTitle,
  normalizeStepTitle,
  PROCESS_STEP_CODES,
  PROCESS_STEPS,
} from '../steps';
import type { StageCode } from '../types';

describe('contrato de stages', () => {
  it('expoe exatamente START e T1-T5 sem T0 semantico', () => {
    const expectedCodes: readonly StageCode[] = [
      'START',
      'T1',
      'T2',
      'T3',
      'T4',
      'T5',
    ];

    expect(PROCESS_STEP_CODES).toEqual(expectedCodes);
    expect(PROCESS_STEP_CODES).not.toContain('T0');
    expect(PROCESS_STEPS).toHaveLength(6);
  });

  it.each(PROCESS_STEPS)(
    'mapeia $title deterministicamente para $code',
    (stage): void => {
      expect(getStepByTitle(stage.title)).toBe(stage);
    },
  );

  it('normaliza somente whitespace antes da comparacao exata', () => {
    expect(normalizeStepTitle(' \n T01\t-   Fazer o cadastro  ')).toBe(
      'T01 - Fazer o cadastro',
    );
    expect(getStepByTitle(' \n T01\t-   Fazer o cadastro  ')?.code).toBe('T1');
    expect(getStepByTitle('t01 - Fazer o cadastro')).toBeNull();
    expect(getStepByTitle('T01 / Fazer o cadastro')).toBeNull();
  });

  it('mantem T0 e titulos fora do contrato como desconhecidos', () => {
    expect(getStepByTitle('T0 - Solicitar registro')).toBeNull();
    expect(getStepByTitle('T99 - Tarefa externa')).toBeNull();
  });
});
