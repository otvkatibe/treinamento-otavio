// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';

import { zeevAdapter } from '../adapter';
import {
  isElementVisible,
  resolveFieldObservation,
} from '../field-resolver';

function renderRealGroupedFields(): void {
  document.body.innerHTML = `
    <div id="containerRequest">
      <div id="ContainerForm">
        <table id="FrmExecute"><tr><td>
          <input type="hidden" data-name="nomeCompleto" id="technicalName">
          <input type="text" data-name="nomeCompleto" id="inpnomeCompleto">
          <input type="text" data-name="cpfCliente" id="inpcpfCliente">
          <input type="radio" data-name="estadoCivil" name="estadoCivil" value="solteiro">
          <input type="radio" data-name="estadoCivil" name="estadoCivil" value="casado" checked>
        </td></tr></table>
        <table id="FrmExecute"><tr><td>
          <input type="text" data-name="telefone" id="inptelefone">
        </td></tr></table>
        <table id="FrmExecute"><tr><td>
          <input type="text" data-name="logradouro" id="inplogradouro">
          <input type="text" data-name="cepEndereco" id="inpcepEndereco">
          <input type="text" data-name="numeroEndereco" id="inpnumeroEndereco">
        </td></tr></table>
        <table id="FrmExecute"><tr><td id="td1documentoCadastroPdf">
          <div id="divdocumentoCadastroPdf"></div>
          <input style="display: none" type="text" data-name="documentoCadastroPdf" id="inpdocumentoCadastroPdf" data-fieldformat="FILE">
          <button type="button" id="btnUploaddocumentoCadastroPdf">anexar arquivo</button>
        </td></tr></table>
      </div>
    </div>
  `;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('resolver de campos do DOM real', () => {
  it('considera oculto um elemento sob ancestral com display none', () => {
    document.body.innerHTML = `
      <div style="display: none"><div><button id="nested">Confirmar</button></div></div>
    `;

    expect(
      isElementVisible(document.querySelector<HTMLElement>('#nested')!),
    ).toBe(false);
  });

  it('considera visivel um elemento quando todos os ancestrais estao visiveis', () => {
    document.body.innerHTML = `
      <div style="display: block"><div style="visibility: visible"><button id="nested">Confirmar</button></div></div>
    `;

    expect(
      isElementVisible(document.querySelector<HTMLElement>('#nested')!),
    ).toBe(true);
  });

  it('atravessa todos os grupos FrmExecute repetidos', () => {
    renderRealGroupedFields();

    expect(zeevAdapter.getForms()).toHaveLength(4);
    expect(zeevAdapter.getField('telefone')?.id).toBe('inptelefone');
    expect(zeevAdapter.getField('logradouro')?.id).toBe('inplogradouro');
    expect(zeevAdapter.getField('cepEndereco')?.id).toBe('inpcepEndereco');
    expect(zeevAdapter.getField('numeroEndereco')?.id).toBe(
      'inpnumeroEndereco',
    );
  });

  it('prefere candidato funcional visível à cópia técnica anterior', () => {
    renderRealGroupedFields();

    expect(zeevAdapter.getFields('nomeCompleto')).toHaveLength(2);
    expect(zeevAdapter.getField('nomeCompleto')?.id).toBe('inpnomeCompleto');
    expect(zeevAdapter.getField('cpfCliente')?.id).toBe('inpcpfCliente');
  });

  it('preserva radio group como coleção lógica e seleção separada', () => {
    renderRealGroupedFields();

    expect(zeevAdapter.getFields('estadoCivil')).toHaveLength(2);
    expect(zeevAdapter.getSelectedField('estadoCivil')).toMatchObject({
      value: 'casado',
    });
    expect(resolveFieldObservation('estadoCivil').logicalElementCount).toBe(1);
  });

  it('modela arquivo oculto mais upload como um campo funcional', () => {
    renderRealGroupedFields();

    const observation = resolveFieldObservation(
      'documentoCadastroPdf',
      'edit',
    );

    expect(observation.presence).toBe('functional');
    expect(observation.logicalElementCount).toBe(1);
    expect(observation.semanticControls).toHaveLength(1);
    expect(observation.uploadButton?.id).toBe(
      'btnUploaddocumentoCadastroPdf',
    );
    expect(observation.candidates.map(({ role }) => role)).toEqual([
      'semantic-control',
      'upload-button',
    ]);
  });

  it('distingue arquivo técnico sem affordance funcional', () => {
    renderRealGroupedFields();
    document.querySelector('#btnUploaddocumentoCadastroPdf')?.remove();

    expect(
      resolveFieldObservation('documentoCadastroPdf', 'edit').presence,
    ).toBe('technical-only');
  });

  it('reconhece viewer nativo em acesso de leitura', () => {
    renderRealGroupedFields();
    document.querySelector('#btnUploaddocumentoCadastroPdf')?.remove();
    document.querySelector('#divdocumentoCadastroPdf')?.insertAdjacentHTML(
      'beforeend',
      '<a href="/document/preview/1">visualizar arquivo</a>',
    );

    const observation = resolveFieldObservation(
      'documentoCadastroPdf',
      'read',
    );
    expect(observation.presence).toBe('functional');
    expect(observation.viewerElements).toHaveLength(1);
  });

  it('modela arquivo readonly com download e viewer como um unico campo funcional', () => {
    renderRealGroupedFields();
    document.querySelector('#btnUploaddocumentoCadastroPdf')?.remove();
    document.querySelector('#divdocumentoCadastroPdf')?.insertAdjacentHTML(
      'beforeend',
      `<button type="button" id="btnDownload_839">Download</button>
       <a href="/document/preview/839">visualizar arquivo</a>`,
    );
    document.querySelector('#ContainerForm')?.insertAdjacentHTML(
      'beforeend',
      '<button type="button" id="btnDownload_unrelated">Download externo</button>',
    );

    const observation = resolveFieldObservation(
      'documentoCadastroPdf',
      'read',
    );

    expect(observation.presence).toBe('functional');
    expect(observation.logicalElementCount).toBe(1);
    expect(observation.readable).toBe(true);
    expect(observation.editable).toBe(false);
    expect(observation.downloadButtons.map(({ id }) => id)).toEqual([
      'btnDownload_839',
    ]);
    expect(observation.viewerElements).toHaveLength(1);
    expect(observation.candidates.map(({ role }) => role)).toEqual([
      'semantic-control',
      'download-button',
      'viewer',
    ]);
  });
});
