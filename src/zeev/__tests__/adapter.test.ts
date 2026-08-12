// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';

import { zeevAdapter } from '../adapter';
import { PROCESS_STEPS } from '../steps';

function renderZeevDom(title: string): void {
  document.body.innerHTML = `
    <input data-name="nomeCompleto" value="fora-do-formulario">
    <div id="containerRequest">
      <div class="page-title"><h1>${title}</h1></div>
      <div id="ContainerForm">
        <div id="BoxFrmExecute">
          <form id="FrmExecute">
            <input type="text" data-name="nomeCompleto" data-fieldformat="TEXT" value="Maria">
            <input type="text" data-name="cpfCliente" data-fieldformat="TEXT" value="000.000.000-00">
            <input type="text" data-name="nacionalidade" data-fieldformat="TEXT" value="Brasileira">
            <input type="text" data-name="profissao" data-fieldformat="TEXT" value="Analista">
            <input type="text" data-name="numeroDocumento" data-fieldformat="TEXT" value="123456">
            <input type="radio" name="estadoCivil" data-name="estadoCivil" data-fieldformat="RADIO" value="solteiro" checked>
            <input type="radio" name="estadoCivil" data-name="estadoCivil" data-fieldformat="RADIO" value="casado">
            <input type="radio" name="tipoDocumento" data-name="tipoDocumento" data-fieldformat="RADIO" value="rg" checked>
            <input type="radio" name="tipoDocumento" data-name="tipoDocumento" data-fieldformat="RADIO" value="cnh">
            <input type="tel" data-name="telefone" value="71999999999">
            <input type="text" data-name="logradouro" value="Rua da Paz">
            <input data-name="cepEndereco" value="40000-000">
            <input type="number" data-name="numeroEndereco" value="42">
            <input type="file" data-name="documentoCadastroPdf">
            <textarea data-name="correcaoRealizada">Dados atualizados</textarea>
            <input type="text" data-name="numeroContrato" value="CTR-001">
            <input type="date" data-name="dataContrato" value="2026-08-12">
            <input type="text" data-name="valorContrato" value="1000,00">
            <input type="file" data-name="documentoContratoPdf">
          </form>
        </div>
      </div>
      <div id="controllers">
        <div id="buttons"><button id="BtnSend">Enviar</button></div>
      </div>
    </div>
  `;
}

function renderNativeActionsDom(actions: string, outside = ''): void {
  document.body.innerHTML = `
    ${outside}
    <div id="containerRequest">
      ${actions}
    </div>
  `;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('zeevAdapter', () => {
  it.each(PROCESS_STEPS)('detecta $code pelo título Zeev exato', (task) => {
    renderZeevDom(`  ${task.title.replaceAll(' ', '   ')}  `);

    expect(zeevAdapter.getCurrentTaskTitle()).toBe(task.title);
    expect(zeevAdapter.getCurrentTask()).toEqual({
      code: task.code,
      title: task.title,
      stepIndex: task.stepIndex,
      metadata: task,
    });
  });

  it('mantém um título desconhecido sem classificar uma tarefa', () => {
    renderZeevDom('T99 - Tarefa externa');

    expect(zeevAdapter.getCurrentTask()).toEqual({
      code: null,
      title: 'T99 - Tarefa externa',
      stepIndex: null,
      metadata: null,
    });
  });

  it('nao classifica o contrato legado T0 como uma etapa conhecida', () => {
    renderZeevDom('T0 - Solicitar registro');

    expect(zeevAdapter.getCurrentTask()).toEqual({
      code: null,
      title: 'T0 - Solicitar registro',
      stepIndex: null,
      metadata: null,
    });
  });

  it('consulta os campos de texto e todas as opções dos radio groups dentro do formulário', () => {
    renderZeevDom('Solicitar registro');

    const textFields = [
      'nomeCompleto',
      'cpfCliente',
      'nacionalidade',
      'profissao',
      'numeroDocumento',
    ] as const;

    expect(zeevAdapter.getField('nomeCompleto')).toBeInstanceOf(HTMLInputElement);
    expect(zeevAdapter.getField('nomeCompleto')?.getAttribute('value')).toBe('Maria');
    textFields.forEach((name) => {
      expect(zeevAdapter.getField(name)).toBeInstanceOf(HTMLInputElement);
      expect(zeevAdapter.getField(name)?.getAttribute('type')).toBe('text');
      expect(zeevAdapter.getField(name)?.getAttribute('data-fieldformat')).toBe(
        'TEXT',
      );
      expect(zeevAdapter.getFields(name)).toHaveLength(1);
    });
    expect(zeevAdapter.getFields('estadoCivil')).toHaveLength(2);
    expect(zeevAdapter.getFields('tipoDocumento')).toHaveLength(2);
  });

  it('mantém getField estrutural e retorna separadamente a opção selecionada', () => {
    renderZeevDom('Solicitar registro');

    expect(zeevAdapter.getField('estadoCivil')?.getAttribute('value')).toBe(
      'solteiro',
    );
    expect(zeevAdapter.getSelectedField('estadoCivil')?.getAttribute('value')).toBe(
      'solteiro',
    );
    expect(zeevAdapter.getSelectedField('tipoDocumento')?.getAttribute('value')).toBe(
      'rg',
    );
  });

  it.each([
    ['telefone', HTMLInputElement],
    ['logradouro', HTMLInputElement],
    ['cepEndereco', HTMLInputElement],
    ['numeroEndereco', HTMLInputElement],
    ['documentoCadastroPdf', HTMLInputElement],
    ['correcaoRealizada', HTMLTextAreaElement],
    ['numeroContrato', HTMLInputElement],
    ['dataContrato', HTMLInputElement],
    ['valorContrato', HTMLInputElement],
    ['documentoContratoPdf', HTMLInputElement],
  ] as const)(
    'localiza o campo recente %s pelo data-name sem depender do tipo ou formato',
    (name, expectedElement): void => {
      renderZeevDom('T01 - Fazer o cadastro');

      expect(zeevAdapter.getField(name)).toBeInstanceOf(expectedElement);
      expect(zeevAdapter.getFields(name)).toHaveLength(1);
    },
  );

  it('permite somente uma opção checked por grupo de radio buttons', () => {
    renderZeevDom('Solicitar registro');
    const estadoCivil = zeevAdapter.getFields('estadoCivil') as readonly HTMLInputElement[];
    const tipoDocumento = zeevAdapter.getFields(
      'tipoDocumento',
    ) as readonly HTMLInputElement[];

    estadoCivil[1].checked = true;
    tipoDocumento[1].checked = true;

    expect(estadoCivil.filter(({ checked }) => checked)).toHaveLength(1);
    expect(tipoDocumento.filter(({ checked }) => checked)).toHaveLength(1);
    expect(zeevAdapter.getSelectedField('estadoCivil')).toBe(estadoCivil[1]);
    expect(zeevAdapter.getSelectedField('tipoDocumento')).toBe(tipoDocumento[1]);
  });

  it('retorna null quando um radio group não possui opção selecionada', () => {
    renderZeevDom('Solicitar registro');
    const selected = zeevAdapter.getSelectedField(
      'estadoCivil',
    ) as HTMLInputElement;
    selected.checked = false;

    expect(zeevAdapter.getSelectedField('estadoCivil')).toBeNull();
  });

  it('retorna os elementos estruturais e o botão de envio', () => {
    renderZeevDom('Solicitar registro');

    expect(zeevAdapter.getRoot()?.id).toBe('containerRequest');
    expect(zeevAdapter.getForm()?.id).toBe('FrmExecute');
    expect(zeevAdapter.getSendButton()?.id).toBe('BtnSend');
  });

  it.each([
    ['Aprovar', 'approve'],
    ['Reprovar', 'reject'],
    ['Solicitar correção', 'request-correction'],
    ['Aprovar o contrato', 'approve-contract'],
    ['Reprovar o contrato', 'reject-contract'],
  ] as const)('localiza a ação nativa %s', (label, expectedId) => {
    renderNativeActionsDom(`
      <div id="controllers">
        <input id="approve" type="button" value="  Aprovar  ">
        <div id="buttons">
          <button id="reject" type="button"> Reprovar </button>
          <button id="approve-contract" type="button" aria-label="Aprovar o contrato"></button>
        </div>
      </div>
      <div id="commands">
        <a id="request-correction" aria-label="Solicitar correção"></a>
        <input id="reject-contract" type="submit" value="Reprovar   o contrato">
      </div>
    `);

    expect(zeevAdapter.getNativeAction(label)?.id).toBe(expectedId);
  });

  it('usa value antes de textContent e aria-label', () => {
    renderNativeActionsDom(`
      <div id="buttons">
        <button
          id="action-with-all-labels"
          type="button"
          value="Reprovar o contrato"
          aria-label="Solicitar correção"
        >Aprovar o contrato</button>
      </div>
    `);

    expect(zeevAdapter.getNativeAction('Reprovar o contrato')?.id).toBe(
      'action-with-all-labels',
    );
    expect(zeevAdapter.getNativeAction('Aprovar o contrato')).toBeNull();
    expect(zeevAdapter.getNativeAction('Solicitar correção')).toBeNull();
  });

  it('ignora texto semelhante fora dos containers nativos', () => {
    renderNativeActionsDom(
      '<div id="controllers"><button type="button">Reprovar</button></div>',
      '<button id="outside-action" type="button">Aprovar</button>',
    );

    expect(zeevAdapter.getNativeAction('Aprovar')).toBeNull();
    expect(zeevAdapter.getNativeActions()).not.toContain(
      document.querySelector('#outside-action'),
    );
  });

  it('normaliza whitespace e mantém a correspondência exata', () => {
    renderNativeActionsDom(`
      <div id="commands">
        <button id="approve-contract" type="button">
          Aprovar
          o    contrato
        </button>
      </div>
    `);

    expect(zeevAdapter.getNativeAction('  Aprovar   o contrato  ')?.id).toBe(
      'approve-contract',
    );
    expect(zeevAdapter.getNativeAction('Aprovar')).toBeNull();
    expect(zeevAdapter.getNativeAction('aprovar o contrato')).toBeNull();
    expect(zeevAdapter.getNativeAction('Aprovar o contráto')).toBeNull();
    expect(zeevAdapter.getNativeAction('Ação ausente')).toBeNull();
  });

  it('retorna o primeiro elemento correspondente na ordem do DOM', () => {
    renderNativeActionsDom(`
      <div id="controllers">
        <button id="first-approve" type="button">Aprovar</button>
      </div>
      <div id="commands">
        <button id="second-approve" type="button">Aprovar</button>
      </div>
    `);

    expect(zeevAdapter.getNativeAction('Aprovar')?.id).toBe('first-approve');
  });

  it('retorna valores seguros quando o DOM Zeev está ausente', () => {
    expect(zeevAdapter.getRoot()).toBeNull();
    expect(zeevAdapter.getForm()).toBeNull();
    expect(zeevAdapter.getCurrentTaskTitle()).toBeNull();
    expect(zeevAdapter.getCurrentTask()).toBeNull();
    expect(zeevAdapter.getField('cpfCliente')).toBeNull();
    expect(zeevAdapter.getFields('estadoCivil')).toEqual([]);
    expect(zeevAdapter.getSelectedField('estadoCivil')).toBeNull();
    expect(zeevAdapter.getNativeActions()).toEqual([]);
    expect(zeevAdapter.getNativeAction('Aprovar')).toBeNull();
    expect(zeevAdapter.getSendButton()).toBeNull();
  });
});
