// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';

import { zeevAdapter } from '../adapter';
import { TASKS } from '../tasks';

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
          </form>
        </div>
      </div>
      <div id="controllers">
        <div id="buttons"><button id="BtnSend">Enviar</button></div>
      </div>
    </div>
  `;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('zeevAdapter', () => {
  it.each(TASKS)('detecta $code pelo título Zeev exato', (task) => {
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

  it('retorna valores seguros quando o DOM Zeev está ausente', () => {
    expect(zeevAdapter.getRoot()).toBeNull();
    expect(zeevAdapter.getForm()).toBeNull();
    expect(zeevAdapter.getCurrentTaskTitle()).toBeNull();
    expect(zeevAdapter.getCurrentTask()).toBeNull();
    expect(zeevAdapter.getField('cpfCliente')).toBeNull();
    expect(zeevAdapter.getFields('estadoCivil')).toEqual([]);
    expect(zeevAdapter.getSelectedField('estadoCivil')).toBeNull();
    expect(zeevAdapter.getSendButton()).toBeNull();
  });
});
