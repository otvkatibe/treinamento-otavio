// @vitest-environment jsdom

import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
    expect(report.status).toBe('PASS');
    expect(report.task).toEqual({
      code: 'T0',
      title: 'Solicitar registro',
      known: true,
    });
    expect(report.initialized).toBe(true);
    expect(report.rootCount).toBe(1);
    expect(report.mountBefore).toBe('ContainerForm');
    expect(report.fields).toHaveLength(7);
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
    expect(report.checks.every(({ status }) => status === 'PASS')).toBe(true);

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
    expect(failedChecks).toEqual(
      expect.arrayContaining([
        'mount.unique',
        'field.profissao.present',
        'field.profissao.type',
        'radio.estadoCivil.single',
        'sendButton.native',
      ]),
    );
  });
});
