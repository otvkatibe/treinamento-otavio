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
  const nativeControls = fixture.code === 'START'
    ? '<button id="BtnSend">Enviar solicitação</button>'
    : fixture.actions.length === 0
      ? '<button id="btnFinish">Concluir</button>'
      : labels
          .map((label) => {
            const rawLabel =
              fixture.code === 'T2' && label !== 'Aprovar'
                ? `${label}...`
                : label;
            const id = label === 'Aprovar'
              ? 'btnApprove'
              : `customBtn_${label}`;
            return `<div class="mb-2 mr-lg-1 btn-mobile"><button id="${id}" type="button"> ${rawLabel.replaceAll(' ', '   ')} </button></div>`;
          })
          .join('');

  document.body.innerHTML = `
    <div id="containerRequest">
      <div class="page-title"><h1>${fixture.title}</h1></div>
      <div><div id="ContainerForm"><form id="FrmExecute">${fields
        .map(fieldMarkup)
        .join('')}</form></div></div>
      <div id="controllers"><div id="buttons">
        ${nativeControls}
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
      if (fixture.actions.length === 0) {
        expect(report.nativeControl).toMatchObject(
          fixture.code === 'START'
            ? {
                context: 'start',
                id: 'BtnSend',
                canonicalLabel: 'Enviar solicitação',
              }
            : {
                context: 'human-task',
                id: 'btnFinish',
                canonicalLabel: 'Concluir',
              },
        );
      } else {
        expect(report.nativeControl).toMatchObject({
          context: 'decision',
          expectedId: null,
          present: false,
        });
      }
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

  it.each(['sibling', 'deeply-nested'] as const)(
    'não aceita ação decisória fora do conjunto direto de #buttons: %s',
    async (placement): Promise<void> => {
      const fixture = EXPECTED_STAGE_FIXTURES.T2;
      renderStage(fixture, {
        actionLabels: fixture.actions.filter(
          (label) => label !== 'Solicitar correção',
        ),
      });
      const markup =
        '<button id="outside-correction">Solicitar correção...</button>';
      const buttons = document.getElementById('buttons');
      if (!buttons) throw new Error('região #buttons ausente na fixture');
      if (placement === 'deeply-nested') {
        buttons.insertAdjacentHTML('beforeend', `<div><div>${markup}</div></div>`);
      } else {
        buttons.insertAdjacentHTML('afterend', markup);
      }

      const { boot } = await import('../lifecycle');
      const report = boot().diagnostics();

      expect(
        report.checks.find(
          ({ id }) => id === 'action.Solicitar correção',
        )?.status,
      ).toBe('FAIL');
    },
  );

  it('preserva labels brutos de T02 e reporta matching canonicalizado, id e disabled', async () => {
    renderStage(EXPECTED_STAGE_FIXTURES.T2);
    const correction = document.getElementById('customBtn_Solicitar correção');
    const rejection = document.getElementById('customBtn_Reprovar');
    if (!(correction instanceof HTMLButtonElement) ||
        !(rejection instanceof HTMLButtonElement)) {
      throw new Error('ações T02 ausentes na fixture');
    }
    correction.textContent = 'Solicitar correção...';
    rejection.textContent = 'Reprovar...';
    rejection.disabled = true;

    const { boot } = await import('../lifecycle');
    const report = boot().diagnostics();

    expect(report.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Solicitar correção',
          canonicalLabel: 'Solicitar correção',
          rawLabel: 'Solicitar correção...',
          id: 'customBtn_Solicitar correção',
          visible: true,
          disabled: false,
        }),
        expect.objectContaining({
          label: 'Reprovar',
          rawLabel: 'Reprovar...',
          disabled: true,
        }),
      ]),
    );
    expect(report.failedChecks).toEqual([]);
  });

  it('preserva ids com espaços nas duas ações diretas de T05', async () => {
    const { report } = await diagnosticReport(EXPECTED_STAGE_FIXTURES.T5);

    expect(report.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          canonicalLabel: 'Aprovar o contrato',
          id: 'customBtn_Aprovar o contrato',
        }),
        expect.objectContaining({
          canonicalLabel: 'Reprovar o contrato',
          id: 'customBtn_Reprovar o contrato',
        }),
      ]),
    );
  });

  it('diagnostica Arquivo readonly como composite funcional de viewer e download', async () => {
    const fixture = EXPECTED_STAGE_FIXTURES.T5;
    const remainingFields = requiredFieldNames(fixture)
      .filter((name) => name !== 'documentoContratoPdf')
      .map(fieldMarkup)
      .join('');
    document.body.innerHTML = `
      <div id="containerRequest">
        <div class="page-title"><h1>${fixture.title}</h1></div>
        <div><div id="ContainerForm"><form id="FrmExecute">
          ${remainingFields}
          <div id="divdocumentoContratoPdf">
            <input type="hidden" data-name="documentoContratoPdf">
            <a href="/arquivo/contrato.pdf">contrato.pdf</a>
            <button id="btnDownload_documentoContratoPdf">Download</button>
          </div>
        </form></div></div>
        <div id="controllers"><div id="buttons">
          <button id="customBtn_Aprovar o contrato">Aprovar o contrato</button>
          <button id="customBtn_Reprovar o contrato">Reprovar o contrato</button>
        </div></div>
      </div>`;
    const { boot } = await import('../lifecycle');
    const report = boot().diagnostics();
    const file = report.fields.find(
      ({ name }) => name === 'documentoContratoPdf',
    );

    expect(file).toMatchObject({
      access: 'read',
      present: true,
      presence: 'functional',
      elementCount: 1,
      downloadButtonCount: 1,
      viewerCount: 1,
      editable: false,
      readable: true,
      functionalCandidateCount: 2,
      technicalCandidateCount: 1,
    });
    expect(
      report.checks.find(
        ({ id }) => id === 'field.documentoContratoPdf.present',
      )?.status,
    ).toBe('PASS');
  });

  it('não aceita Arquivo somente leitura quando o stage exige edição', async () => {
    const fixture = EXPECTED_STAGE_FIXTURES.T2;
    renderStage(fixture);
    document.querySelector('[data-name="documentoCadastroPdf"]')?.remove();
    const form = document.querySelector('#ContainerForm #FrmExecute');
    if (!form) throw new Error('formulário ausente na fixture');
    form.insertAdjacentHTML(
      'beforeend',
      `<div id="divdocumentoCadastroPdf">
        <input type="hidden" data-name="documentoCadastroPdf">
        <a href="/arquivo/cadastro.pdf">cadastro.pdf</a>
        <button id="btnDownload_documentoCadastroPdf">Download</button>
      </div>`,
    );
    const { boot } = await import('../lifecycle');
    const report = boot().diagnostics();
    const file = report.fields.find(
      ({ name }) => name === 'documentoCadastroPdf',
    );

    expect(file).toMatchObject({
      access: 'edit',
      presence: 'technical-only',
      editable: false,
      readable: true,
    });
    expect(
      report.checks.find(
        ({ id }) => id === 'field.documentoCadastroPdf.present',
      )?.status,
    ).toBe('FAIL');
  });

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
