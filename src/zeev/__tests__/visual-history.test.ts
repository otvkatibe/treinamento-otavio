// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';

import type { ProcessExecutionIdentity, StageCode } from '../types';
import {
  reconcileVisualHistory,
  VISUAL_HISTORY_STORAGE_PREFIX,
  type VisualHistoryState,
  type VisualHistoryStorage,
} from '../visual-history';

const UID_ONLY: ProcessExecutionIdentity = { uid: 'UID-A', flowExecute: null };
const FLOW_ONLY: ProcessExecutionIdentity = { uid: null, flowExecute: '1595' };
const COMPLETE: ProcessExecutionIdentity = { uid: 'UID-A', flowExecute: '1595' };
const EMPTY: VisualHistoryState = { identity: null, visitedStages: [] };

function nextDocument(
  identity: ProcessExecutionIdentity,
  stage: StageCode,
  storage: VisualHistoryStorage = sessionStorage,
): VisualHistoryState {
  return reconcileVisualHistory(EMPTY, identity, stage, storage);
}

beforeEach(() => sessionStorage.clear());

describe('visual history em sessionStorage', () => {
  it('inicia com storage vazio e mantém reload idempotente', () => {
    const first = nextDocument(COMPLETE, 'T2');
    const reload = nextDocument(COMPLETE, 'T2');

    expect(first.visitedStages).toEqual(['T2']);
    expect(reload.visitedStages).toEqual(['T2']);
  });

  it('preserva T2 -> T3 -> T2 entre documentos independentes', () => {
    nextDocument(COMPLETE, 'T2');
    nextDocument(COMPLETE, 'T3');
    const returned = nextDocument(COMPLETE, 'T2');

    expect(returned.identity).toEqual(COMPLETE);
    expect(returned.visitedStages).toEqual(['T2', 'T3']);
  });

  it('preserva uma sequência maior sem duplicar stages', () => {
    (['T1', 'T2', 'T3', 'T2', 'T4'] as const).forEach((stage) =>
      nextDocument(COMPLETE, stage),
    );

    expect(nextDocument(COMPLETE, 'T4').visitedStages).toEqual([
      'T1',
      'T2',
      'T3',
      'T4',
    ]);
  });

  it.each([
    ['JSON inválido', '{'],
    ['schema desconhecido', JSON.stringify({ schemaVersion: 2 })],
    [
      'stage inválido',
      JSON.stringify({
        schemaVersion: 1,
        identity: COMPLETE,
        visitedStages: ['T2', 'T99'],
      }),
    ],
  ])('ignora %s', (_label, raw) => {
    const canonical = 'uid:UID-A|flow:1595';
    sessionStorage.setItem(
      `${VISUAL_HISTORY_STORAGE_PREFIX}:record:${canonical}`,
      raw,
    );
    sessionStorage.setItem(
      `${VISUAL_HISTORY_STORAGE_PREFIX}:uid:UID-A`,
      canonical,
    );
    sessionStorage.setItem(
      `${VISUAL_HISTORY_STORAGE_PREFIX}:flow:1595`,
      canonical,
    );

    expect(nextDocument(COMPLETE, 'T3').visitedStages).toEqual(['T3']);
  });

  it('continua em memória quando storage está indisponível', () => {
    const unavailable: VisualHistoryStorage = {
      getItem: () => {
        throw new DOMException('blocked');
      },
      setItem: () => {
        throw new DOMException('blocked');
      },
      removeItem: () => {
        throw new DOMException('blocked');
      },
    };
    const first = reconcileVisualHistory(EMPTY, COMPLETE, 'T2', unavailable);
    const second = reconcileVisualHistory(first, COMPLETE, 'T3', unavailable);

    expect(second.visitedStages).toEqual(['T2', 'T3']);
  });

  it.each([
    ['UID', UID_ONLY, FLOW_ONLY],
    ['flowExecute', FLOW_ONLY, UID_ONLY],
  ])('complementa alias iniciado por %s', (_label, initial, complement) => {
    const first = nextDocument(initial, 'T1');
    const completed = reconcileVisualHistory(first, complement, 'T2');
    const hydrated = nextDocument(COMPLETE, 'T3');

    expect(completed.identity).toEqual(COMPLETE);
    expect(hydrated.visitedStages).toEqual(['T1', 'T2', 'T3']);
  });

  it('permite lookup posterior por qualquer alias conhecido', () => {
    nextDocument(COMPLETE, 'T1');

    expect(nextDocument(UID_ONLY, 'T2').visitedStages).toEqual(['T1', 'T2']);
    expect(nextDocument(FLOW_ONLY, 'T3').visitedStages).toEqual([
      'T1',
      'T2',
      'T3',
    ]);
  });

  it('não mescla aliases que apontam para registros divergentes', () => {
    nextDocument({ uid: 'UID-A', flowExecute: '100' }, 'T1');
    nextDocument({ uid: 'UID-B', flowExecute: '1595' }, 'T4');

    expect(nextDocument(COMPLETE, 'T2').visitedStages).toEqual(['T2']);
  });

  it('isola uma nova execução', () => {
    nextDocument(COMPLETE, 'T1');

    expect(
      nextDocument({ uid: 'UID-B', flowExecute: '1596' }, 'T2').visitedStages,
    ).toEqual(['T2']);
  });

  it('mantém START em memória e promove quando a identidade surge', () => {
    const start = reconcileVisualHistory(EMPTY, null, 'START');
    expect(sessionStorage.length).toBe(0);

    const promoted = reconcileVisualHistory(start, COMPLETE, 'T1');
    const next = nextDocument(COMPLETE, 'T2');

    expect(promoted.visitedStages).toEqual(['START', 'T1']);
    expect(next.visitedStages).toEqual(['START', 'T1', 'T2']);
  });
});
