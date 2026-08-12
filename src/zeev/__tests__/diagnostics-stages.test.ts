// @vitest-environment jsdom

import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ZeevFieldName } from '../types';
import {
  EXPECTED_STAGE_FIXTURES,
  EXPECTED_UNKNOWN_FIXTURE,
  type ExpectedStageFixture,
} from './fixtures/stage-contracts.fixture';

interface RenderStageOptions {
  excludedField?: ZeevFieldName;
  additionalFields?: readonly ZeevFieldName[];
  actionLabels?: readonly string[];
}

const STAGE_FIXTURES = Object.values(EXPECTED_STAGE_FIXTURES);

const REQUIRED_FIELD_CASES = STAGE_FIXTURES.flatMap((fixture) =>
  [...fixture.fields.requiredEdit, ...fixture.fields.requiredRead].map(
    (name) => ({ fixture, name }),
  ),
);

const OPTIONAL_STAGE_CASES = STAGE_FIXTURES.filter(
  (fixture) =>
    fixture.fields.optionalEdit.length + fixture.fields.optionalRead.length > 0,
);

const ACTION_CASES = STAGE_FIXTURES.flatMap((fixture) =>
  fixture.actions.map((label) => ({ fixture, label })),
);

function fieldMarkup(name: ZeevFieldName): string {
  if (name === 'estadoCivil' || name === 'tipoDocumento') {
    return `<input type="radio" name="${name}" data-name="${name}" checked>`;
  }
  return name === 'correcaoRealizada'
    ? `<textarea data-name="${name}"></textarea>`
    : `<input data-name="${name}">`;
}

function requiredFieldNames(
  fixture: ExpectedStageFixture,
): readonly ZeevFieldName[] {
  return [...fixture.fields.requiredEdit, ...fixture.fields.requiredRead];
}

function optionalFieldNames(
  fixture: ExpectedStageFixture,
): readonly ZeevFieldName[] {
  return [...fixture.fields.optionalEdit, ...fixture.fields.optionalRead];
}

function renderStage(
  fixture: ExpectedStageFixture,
  options: RenderStageOptions = {},
): void {
  const fields = [
    ...requiredFieldNames(fixture).filter(
      (name) => name !== options.excludedField,
    ),
    ...(options.additionalFields ?? []),
  ];
  const labels = options.actionLabels ?? fixture.actions;

  document.body.innerHTML = `
    <div id="containerRequest">
      <div class="page-title"><h1>${fixture.title}</h1></div>
      <div><div id="ContainerForm"><form id="FrmExecute">${fields
        .map(fieldMarkup)
        .join('')}</form></div></div>
      <div id="controllers"><div id="buttons">
        <button id="BtnSend">Enviar</button>
        ${labels
          .map(
            (label) =>
              `<button type="button"> ${label.replaceAll(' ', '   ')} </button>`,
          )
          .join('')}
      </div></div>
    </div>`;
}

async function diagnosticReport(
  fixture: ExpectedStageFixture,
  options: RenderStageOptions = {},
) {
  renderStage(fixture, options);
  const { boot } = await import('../lifecycle');
  const runtime = boot();
  act((): void => {
    vi.advanceTimersByTime(100);
  });
  return { runtime, report: runtime.diagnostics() };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    height: '40px',
    boxSizing: 'border-box',
    maxWidth: '100%',
  } as CSSStyleDeclaration);
  document.body.innerHTML = '';
  window.history.replaceState(null, '', '/2.0/task?instance=diagnostics');
  delete window.__ZEEV_FIEB__;
});

afterEach(async () => {
  const { teardown } = await import('../lifecycle');
  act((): void => teardown());
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('diagnostics por fixture literal de stages', () => {
  it.each(STAGE_FIXTURES)(
    'valida campos e ações de $code sem derivar o DOM de produção',
    async (fixture): Promise<void> => {
      const { report } = await diagnosticReport(fixture);

      expect(report.task).toEqual({
        code: fixture.code,
        title: fixture.title,
        known: true,
      });
      expect(report.actions.map(({ label }) => label)).toEqual(fixture.actions);
      expect(report.failedChecks).toEqual([]);
      expect(report.status).toBe('PASS');

      requiredFieldNames(fixture).forEach((name) => {
        expect(
          report.checks.find(({ id }) => id === `field.${name}.present`)
            ?.status,
        ).toBe('PASS');
      });
      optionalFieldNames(fixture).forEach((name) => {
        expect(
          report.checks.find(({ id }) => id === `field.${name}.present`)
            ?.status,
        ).toBe('SKIP/N/A');
      });
      fixture.fields.notApplicable.forEach((name) => {
        expect(
          report.checks.find(({ id }) => id === `field.${name}.present`)
            ?.status,
        ).toBe('SKIP/N/A');
      });
    },
  );

  it.each(REQUIRED_FIELD_CASES)(
    '$fixture.code reporta o campo required $name ausente',
    async ({ fixture, name }): Promise<void> => {
      const { report } = await diagnosticReport(fixture, {
        excludedField: name,
      });

      expect(
        report.checks.find(({ id }) => id === `field.${name}.present`)?.status,
      ).toBe('FAIL');
      expect(report.failedChecks.map(({ id }) => id)).toEqual([
        `field.${name}.present`,
      ]);
      expect(report.status).toBe('FAIL');
    },
  );

  it.each(OPTIONAL_STAGE_CASES)(
    '$code mantém campos optional ausentes como SKIP/N/A',
    async (fixture): Promise<void> => {
      const { report } = await diagnosticReport(fixture);

      optionalFieldNames(fixture).forEach((name) => {
        expect(
          report.checks.find(({ id }) => id === `field.${name}.present`)
            ?.status,
        ).toBe('SKIP/N/A');
      });
    },
  );

  it.each(OPTIONAL_STAGE_CASES)(
    '$code aprova campos optional presentes com cardinalidade válida',
    async (fixture): Promise<void> => {
      const optionalFields = optionalFieldNames(fixture);
      const { report } = await diagnosticReport(fixture, {
        additionalFields: optionalFields,
      });

      optionalFields.forEach((name) => {
        expect(
          report.checks.find(({ id }) => id === `field.${name}.present`)
            ?.status,
        ).toBe('PASS');
      });
      expect(report.failedChecks).toEqual([]);
    },
  );

  it.each(STAGE_FIXTURES)(
    '$code mantém notApplicable presente como evidência com SKIP/N/A',
    async (fixture): Promise<void> => {
      const { report } = await diagnosticReport(fixture, {
        additionalFields: fixture.fields.notApplicable,
      });

      fixture.fields.notApplicable.forEach((name) => {
        expect(report.fields.find((field) => field.name === name)?.present).toBe(
          true,
        );
        expect(
          report.checks.find(({ id }) => id === `field.${name}.present`)
            ?.status,
        ).toBe('SKIP/N/A');
      });
      expect(report.failedChecks).toEqual([]);
    },
  );

  it.each(ACTION_CASES)(
    '$fixture.code reporta a ação obrigatória $label ausente',
    async ({ fixture, label }): Promise<void> => {
      const { report } = await diagnosticReport(fixture, {
        actionLabels: fixture.actions.filter((action) => action !== label),
      });

      expect(
        report.checks.find(({ id }) => id === `action.${label}`)?.status,
      ).toBe('FAIL');
      expect(report.failedChecks.map(({ id }) => id)).toEqual([
        `action.${label}`,
      ]);
    },
  );

  it('mantém UNKNOWN neutro, observável e sem contrato de campos ou ações', async () => {
    document.body.innerHTML = `
      <div id="containerRequest">
        <div class="page-title"><h1>${EXPECTED_UNKNOWN_FIXTURE.title}</h1></div>
        <div><div id="ContainerForm"><form id="FrmExecute">
          ${fieldMarkup('numeroContrato')}
        </form></div></div>
        <div id="controllers"><div id="buttons">
          <button id="BtnSend">Enviar</button>
          <button type="button">Aprovar</button>
        </div></div>
      </div>`;
    const { boot } = await import('../lifecycle');
    const runtime = boot();
    act((): void => {
      vi.advanceTimersByTime(100);
    });

    const report = runtime.diagnostics();
    expect(report.task).toEqual({
      code: EXPECTED_UNKNOWN_FIXTURE.code,
      title: EXPECTED_UNKNOWN_FIXTURE.title,
      known: EXPECTED_UNKNOWN_FIXTURE.known,
    });
    expect(report.actions).toEqual(EXPECTED_UNKNOWN_FIXTURE.actions);
    expect(
      report.checks.find(({ id }) => id === 'field.numeroContrato.present')
        ?.status,
    ).toBe('SKIP/N/A');
    expect(
      report.fields.find(({ name }) => name === 'numeroContrato')?.present,
    ).toBe(true);
    expect(report.failedChecks.map(({ id }) => id)).toEqual(['task.known']);

    const frame = document.createElement('iframe');
    document.body.append(frame);
    if (!frame.contentWindow) throw new Error('frame sem contentWindow');
    frame.contentWindow.__ZEEV_FIEB__ = runtime;
    expect(frame.contentWindow.__ZEEV_FIEB__.diagnostics().task.known).toBe(false);
  });
});
