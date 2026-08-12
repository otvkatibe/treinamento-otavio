// @vitest-environment jsdom

import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ZeevFieldName } from '../types';
import {
  EXPECTED_STAGE_FIXTURES,
  type ExpectedStageFixture,
} from './fixtures/stage-contracts.fixture';

function textInput(name: string): string {
  return `<input
    type="text"
    data-name="${name}"
    data-fieldformat="TEXT"
    style="height: 40px; box-sizing: border-box; max-width: 100%;"
  >`;
}

function renderCompleteZeevDom(): void {
  document.body.innerHTML = `
    <div id="containerRequest">
      <div class="page-title"><h1>Solicitar registro</h1></div>
      <section class="main-col">
        <div id="ContainerForm">
          <form id="FrmExecute">
            ${textInput('nomeCompleto')}
            ${textInput('cpfCliente')}
            ${textInput('nacionalidade')}
            ${textInput('profissao')}
            ${textInput('numeroDocumento')}
            <input type="radio" name="estadoCivil" data-name="estadoCivil" data-fieldformat="RADIO" value="solteiro" checked>
            <input type="radio" name="estadoCivil" data-name="estadoCivil" data-fieldformat="RADIO" value="casado">
            <input type="radio" name="tipoDocumento" data-name="tipoDocumento" data-fieldformat="RADIO" value="rg" checked>
            <input type="radio" name="tipoDocumento" data-name="tipoDocumento" data-fieldformat="RADIO" value="cnh">
          </form>
        </div>
      </section>
      <div id="controllers">
        <div id="buttons"><button id="BtnSend">Enviar</button></div>
      </div>
    </div>
  `;
}

function fieldMarkup(name: ZeevFieldName): string {
  if (name === 'estadoCivil' || name === 'tipoDocumento') {
    return `<input type="radio" name="${name}" data-name="${name}" value="opcao" checked>`;
  }
  if (name === 'correcaoRealizada') {
    return `<textarea data-name="${name}"></textarea>`;
  }
  return `<input data-name="${name}">`;
}

function fixtureFieldsMarkup(fixture: ExpectedStageFixture): string {
  return [...fixture.fields.requiredEdit, ...fixture.fields.requiredRead]
    .map((name) => fieldMarkup(name))
    .join('');
}

function actionMarkup(labels: readonly string[]): string {
  return `<div id="controllers"><div id="buttons"><button id="BtnSend">Enviar</button>${labels
    .map((label) => `<button type="button"> ${label.replaceAll(' ', '   ')} </button>`)
    .join('')}</div></div>`;
}

function renderTaskDom(title: string, formContent = '', actions = ''): void {
  document.body.innerHTML = `
    <div id="containerRequest">
      <div class="page-title"><h1>${title}</h1></div>
      <section class="main-col">
        <div id="ContainerForm"><form id="FrmExecute">${formContent}</form></div>
      </section>
      ${actions}
    </div>
  `;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    height: '40px',
    boxSizing: 'border-box',
    maxWidth: '100%',
  } as CSSStyleDeclaration);
  document.body.innerHTML = '';
  window.history.replaceState(null, '', '/processo?instance=diagnostics');
  delete window.__ZEEV_FIEB__;
});

afterEach(async () => {
  const { teardown } = await import('../lifecycle');
  act((): void => teardown());
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('diagnóstico de homologação', () => {
  it('expõe diagnostics() no runtime com todos os contratos aprovados', async () => {
    renderCompleteZeevDom();
    const { boot } = await import('../lifecycle');

    const runtime = boot();
    act((): void => {
      vi.advanceTimersByTime(100);
    });
    const report = runtime.diagnostics();

    expect(window.__ZEEV_FIEB__?.diagnostics).toBe(runtime.diagnostics);
    expect(typeof window.__ZEEV_FIEB__?.diagnostics).toBe('function');
    expect(report.passed).toBe(true);
    expect(report.status).toBe('PASS');
    expect(report.task).toEqual({
      code: 'START',
      title: 'Solicitar registro',
      known: true,
    });
    expect(report.initialized).toBe(true);
    expect(report.rootCount).toBe(1);
    expect(report.mountBefore).toBe('ContainerForm');
    expect(report.mount).toEqual({
      count: 1,
      id: 'zeev-fieb-root',
      connected: true,
      before: 'ContainerForm',
    });
    expect(report.fields).toHaveLength(17);
    expect(report.radioGroups).toEqual([
      {
        name: 'estadoCivil',
        optionCount: 2,
        checkedCount: 1,
        selectedValue: 'solteiro',
      },
      {
        name: 'tipoDocumento',
        optionCount: 2,
        checkedCount: 1,
        selectedValue: 'rg',
      },
    ]);
    expect(report.sendButton).toMatchObject({
      present: true,
      tagName: 'BUTTON',
      id: 'BtnSend',
    });
    expect(report.failedChecks).toEqual([]);

    const selectedEstadoCivil = document.querySelector<HTMLInputElement>(
      '[data-name="estadoCivil"]:checked',
    );
    if (selectedEstadoCivil) selectedEstadoCivil.checked = false;
    const reportWithoutSelection = runtime.diagnostics();

    expect(
      reportWithoutSelection.radioGroups.find(
        ({ name }) => name === 'estadoCivil',
      )?.checkedCount,
    ).toBe(0);
    expect(
      reportWithoutSelection.checks.find(
        ({ id }) => id === 'radio.estadoCivil.single',
      )?.status,
    ).toBe('PASS');
  });

  it('retorna FAIL estruturado para violações sem lançar exceção', async () => {
    renderCompleteZeevDom();
    const { boot } = await import('../lifecycle');

    const runtime = boot();
    act((): void => {
      vi.advanceTimersByTime(100);
    });
    document.querySelector('[data-name="profissao"]')?.remove();
    document.querySelector('#BtnSend')?.remove();
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div id="zeev-fieb-root"></div>',
    );
    const estadoCivil = Array.from(
      document.querySelectorAll<HTMLInputElement>('[data-name="estadoCivil"]'),
    );
    estadoCivil.forEach((option, index) => {
      option.name = `estadoCivil-${index}`;
      option.checked = true;
    });

    const report = runtime.diagnostics();
    const failedChecks = report.checks
      .filter(({ status }) => status === 'FAIL')
      .map(({ id }) => id);

    expect(report.status).toBe('FAIL');
    expect(report.passed).toBe(false);
    expect(report.failedChecks.map(({ id }) => id).sort()).toEqual(
      failedChecks.sort(),
    );
    expect(failedChecks).toEqual(
      expect.arrayContaining([
        'mount.unique',
        'field.profissao.present',
        'radio.estadoCivil.single',
        'sendButton.native',
      ]),
    );
    expect(
      report.checks.find(({ id }) => id === 'field.profissao.type')?.status,
    ).toBe('SKIP/N/A');
  });

  it('aprova T1 sem aplicar universalmente o contrato de campos de START', async () => {
    renderTaskDom(
      EXPECTED_STAGE_FIXTURES.T1.title,
      fixtureFieldsMarkup(EXPECTED_STAGE_FIXTURES.T1),
    );
    const { boot } = await import('../lifecycle');

    const runtime = boot();
    act((): void => {
      vi.advanceTimersByTime(100);
    });
    const report = runtime.diagnostics();

    expect(report.task.code).toBe('T1');
    expect(report.status).toBe('PASS');
    expect(report.passed).toBe(true);
    expect(
      report.checks.find(({ id }) => id === 'field.nomeCompleto.present')
        ?.status,
    ).toBe('SKIP/N/A');
    expect(
      report.checks.find(({ id }) => id === 'radio.estadoCivil.single')
        ?.status,
    ).toBe('SKIP/N/A');
    expect(
      report.checks.find(({ id }) => id === 'sendButton.native')?.status,
    ).toBe('SKIP/N/A');
    expect(
      report.checks
        .filter(({ id }) =>
          [
            'runtime.initialized',
            'task.known',
            'task.synchronized',
            'mount.unique',
            'mount.connected',
            'mount.position',
            'island.integrity',
          ].includes(id),
        )
        .every(({ status }) => status === 'PASS'),
    ).toBe(true);
  });

  it('exige #BtnSend em T1 quando a barra de ações está presente', async () => {
    renderTaskDom(
      EXPECTED_STAGE_FIXTURES.T1.title,
      fixtureFieldsMarkup(EXPECTED_STAGE_FIXTURES.T1),
      '<div id="controllers"></div>',
    );
    const { boot } = await import('../lifecycle');

    const runtime = boot();
    act((): void => {
      vi.advanceTimersByTime(100);
    });
    const report = runtime.diagnostics();

    expect(report.passed).toBe(false);
    expect(
      report.checks.find(({ id }) => id === 'sendButton.native')?.status,
    ).toBe('FAIL');
  });
});
