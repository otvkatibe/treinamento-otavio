// @vitest-environment jsdom

import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ZeevFieldName } from '../types';
import {
  EXPECTED_STAGE_FIXTURES,
  type ExpectedStageFixture,
} from './fixtures/stage-contracts.fixture';
import {
  EXPECTED_T05_NATIVE_SECTIONS,
  t05RealSectionsMarkup,
} from './fixtures/t05-sections.fixture';

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
        <div id="buttons"><button id="BtnSend">Enviar solicitação</button></div>
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
    expect(report.nativeControl).toMatchObject({
      context: 'start',
      expectedId: 'BtnSend',
      id: 'BtnSend',
      rawLabel: 'Enviar solicitação',
      canonicalLabel: 'Enviar solicitação',
      visible: true,
      disabled: false,
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
      '<div id="controllers"><div id="buttons"><button id="btnFinish">Concluir</button></div></div>',
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
      report.checks.find(({ id }) => id === 'completionButton.native')?.status,
    ).toBe('PASS');
    expect(report.nativeControl).toMatchObject({
      context: 'human-task',
      expectedId: 'btnFinish',
      expectedLabel: 'Concluir',
      id: 'btnFinish',
      canonicalLabel: 'Concluir',
    });
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

  it('exige #btnFinish em T1 quando o controle nativo está ausente', async () => {
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
      report.checks.find(({ id }) => id === 'completionButton.native')?.status,
    ).toBe('FAIL');
  });

  it('rejeita controle START com id e label corretos quando não é BUTTON', async () => {
    renderCompleteZeevDom();
    const send = document.getElementById('BtnSend');
    if (!send) throw new Error('controle START ausente na fixture');
    send.outerHTML = '<div id="BtnSend">Enviar solicitação</div>';
    const { boot } = await import('../lifecycle');
    const report = boot().diagnostics();

    expect(report.nativeControl).toMatchObject({
      context: 'start',
      expectedId: 'BtnSend',
      present: false,
    });
    expect(
      report.checks.find(({ id }) => id === 'sendButton.native')?.status,
    ).toBe('FAIL');
  });

  it('diagnostica campos distribuídos em FrmExecute repetidos e arquivo composto', async () => {
    document.body.innerHTML = `
      <div id="containerRequest">
        <div class="page-title"><h1>T01 - Fazer o cadastro</h1></div>
        <section class="main-col">
          <div id="ContainerForm">
            <table id="FrmExecute"><tr><td>
              ${textInput('nomeCompleto')}
              ${textInput('cpfCliente')}
            </td></tr></table>
            <table id="FrmExecute"><tr><td>
              ${textInput('telefone')}
            </td></tr></table>
            <table id="FrmExecute"><tr><td>
              ${textInput('logradouro')}
              ${textInput('cepEndereco')}
              ${textInput('numeroEndereco')}
            </td></tr></table>
            <table id="FrmExecute"><tr><td id="td1documentoCadastroPdf">
              <div id="divdocumentoCadastroPdf"></div>
              <input style="display:none" type="text" id="inpdocumentoCadastroPdf" data-name="documentoCadastroPdf" data-fieldformat="FILE">
              <button type="button" id="btnUploaddocumentoCadastroPdf">anexar arquivo</button>
            </td></tr></table>
          </div>
        </section>
      </div>
    `;
    const { boot } = await import('../lifecycle');
    const runtime = boot();
    const report = runtime.diagnostics();

    for (const name of [
      'telefone',
      'logradouro',
      'cepEndereco',
      'numeroEndereco',
      'documentoCadastroPdf',
    ] as const) {
      expect(report.fields.find((field) => field.name === name)).toMatchObject({
        present: true,
        presence: 'functional',
        elementCount: 1,
      });
      expect(
        report.checks.find(({ id }) => id === `field.${name}.present`)?.status,
      ).toBe('PASS');
    }

    expect(
      report.fields.find(({ name }) => name === 'documentoCadastroPdf'),
    ).toMatchObject({
      candidateCount: 2,
      functionalCandidateCount: 1,
      technicalCandidateCount: 1,
      uploadButtonPresent: true,
      viewerCount: 0,
    });
    expect(report.bootstrapStatus).toBe('mounted');
  });

  it('expõe a coleção runtime.sections observada com id, label e fields no diagnostics()', async () => {
    document.body.innerHTML = t05RealSectionsMarkup();
    const { boot } = await import('../lifecycle');
    const runtime = boot();
    act((): void => {
      vi.advanceTimersByTime(100);
    });

    const report = runtime.diagnostics();

    expect(report.sections).toEqual(EXPECTED_T05_NATIVE_SECTIONS);
    expect(report.sections).toHaveLength(3);
    expect(report.sections[0]).toEqual({
      id: '7727',
      label: 'Dados da prestação de serviço',
      fields: [
        { name: 'numeroContrato', label: 'Numero do contrato' },
        { name: 'dataContrato', label: 'Data do contrato' },
        { name: 'valorContrato', label: 'Valor do contrato' },
        { name: 'documentoContratoPdf', label: 'Contrato em PDF' },
      ],
    });
    expect(report.sections[1]).toEqual({
      id: '7728',
      label: 'Documentos',
      fields: [
        {
          name: 'documentoCadastroPdf',
          label: 'Documento escolhido no cadastro em pdf',
        },
      ],
    });
    expect(report.sections[2]).toEqual({
      id: '7729',
      label: 'Validação',
      fields: [
        {
          name: 'correcaoRealizada',
          label: 'Correções realizadas:',
        },
      ],
    });
  });
});
