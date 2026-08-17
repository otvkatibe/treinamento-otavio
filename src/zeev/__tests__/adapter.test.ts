// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';

import {
  canonicalizeNativeActionLabel,
  zeevAdapter,
} from '../adapter';
import { PROCESS_STEPS } from '../steps';
import {
  EXPECTED_T04_NATIVE_SECTIONS,
  t04RealSectionsMarkup,
} from './fixtures/t04-sections.fixture';
import {
  EXPECTED_T05_NATIVE_SECTIONS,
  t05RealSectionsMarkup,
} from './fixtures/t05-sections.fixture';

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
  it.each([
    ['Reprovar...', 'Reprovar'],
    ['Reprovar…', 'Reprovar'],
    ['Solicitar   correção ...', 'Solicitar correção'],
    ['Solicitar\ncorreção\t…  ', 'Solicitar correção'],
    ['Aprovar', 'Aprovar'],
    ['aprovar', 'aprovar'],
    ['Revisão: aprovar, depois corrigir?', 'Revisão: aprovar, depois corrigir?'],
    ['Aprovar o contrato', 'Aprovar o contrato'],
  ] as const)(
    'canonicaliza conservadoramente o label de ação %j',
    (rawLabel, expectedLabel): void => {
      expect(canonicalizeNativeActionLabel(rawLabel)).toBe(expectedLabel);
    },
  );

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

  it('resolve as ações decisórias T02 pelo label canônico e preserva a observação real', () => {
    renderNativeActionsDom(`
      <div id="controllers">
        <div id="buttons">
          <button id="customBtn_Cancelado" type="button">Reprovar...</button>
          <button id="customBtn_Revisão solicitada" type="button" disabled>
            Solicitar correção...
          </button>
          <button id="btnApprove" type="button" data-result="1">Aprovar</button>
        </div>
      </div>
    `);

    expect(zeevAdapter.getNativeAction('Aprovar')?.id).toBe('btnApprove');
    expect(zeevAdapter.getNativeAction('Solicitar correção')?.id).toBe(
      'customBtn_Revisão solicitada',
    );
    expect(zeevAdapter.getNativeAction('Reprovar')?.id).toBe(
      'customBtn_Cancelado',
    );

    const correction = zeevAdapter
      .getNativeActionObservations()
      .find(({ element }): boolean => element.id === 'customBtn_Revisão solicitada');

    expect(correction).toMatchObject({
      rawLabel: '\n            Solicitar correção...\n          ',
      label: 'Solicitar correção',
      visible: true,
      disabled: true,
    });
    expect(correction?.element).toBe(
      document.getElementById('customBtn_Revisão solicitada'),
    );
  });

  it('resolve as duas ações T05 com IDs que contêm espaços sem interpolá-los em CSS', () => {
    renderNativeActionsDom(`
      <div id="controllers">
        <div id="buttons">
          <button id="customBtn_Reprovar o contrato" type="button">
            Reprovar o contrato
          </button>
          <button id="customBtn_Aprovar o contrato" type="button">
            Aprovar o contrato
          </button>
        </div>
      </div>
    `);

    expect(zeevAdapter.getNativeAction('Reprovar o contrato')?.id).toBe(
      'customBtn_Reprovar o contrato',
    );
    expect(zeevAdapter.getNativeAction('Aprovar o contrato')?.id).toBe(
      'customBtn_Aprovar o contrato',
    );
  });

  it('prioriza #buttons, ignora controles funcionalmente ocultos e mantém disabled', () => {
    renderNativeActionsDom(`
      <div id="controllers">
        <button id="fallback-approve" type="button">Aprovar</button>
        <div id="buttons">
          <button id="primary-approve" type="button" disabled>Aprovar</button>
          <div style="display: none">
            <button id="hidden-reject" type="button">Reprovar</button>
          </div>
        </div>
      </div>
    `);

    expect(zeevAdapter.getNativeAction('Aprovar')?.id).toBe('primary-approve');
    expect(zeevAdapter.getNativeAction('Reprovar')).toBeNull();
    expect(zeevAdapter.getNativeActions()).not.toContain(
      document.getElementById('hidden-reject'),
    );
    expect(zeevAdapter.getNativeActionObservations()[0]).toMatchObject({
      disabled: true,
      visible: true,
    });
  });

  it('descobre dinamicamente as seções da T05 com exatidão de contador, labels e ordem no DOM', () => {
    document.body.innerHTML = t05RealSectionsMarkup();

    const sections = zeevAdapter.getSections();

    expect(sections).toHaveLength(3);
    expect(sections).toEqual(EXPECTED_T05_NATIVE_SECTIONS);
    expect(sections.map(({ label }) => label)).toEqual([
      'Dados da prestação de serviço',
      'Documentos',
      'Validação',
    ]);
    expect(sections.map(({ id }) => id)).toEqual(['7727', '7728', '7729']);
  });

  it('prioriza b[data-key] correspondente ao data-groupid e normaliza whitespace', () => {
    document.body.innerHTML = `
      <div id="containerRequest">
        <div id="ContainerForm">
          <table class="form" id="SecaoComposta" data-groupid="9901">
            <tbody>
              <tr class="group">
                <td class="group">
                  <span class="prefix">Prefixo</span>
                  <b id="otherKey" data-key="0000">Outro heading</b>
                  <b id="targetKey" data-key="9901">
                    Dados   da   prestação
                    de serviço
                  </b>
                </td>
              </tr>
            </tbody>
          </table>
          <table class="form" data-groupid="9902">
            <tbody>
              <tr class="group">
                <td><b>  Documentos  </b></td>
              </tr>
            </tbody>
          </table>
          <table class="form" data-groupid="9903">
            <tbody>
              <tr class="group">
                <td>  Validação  </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    const sections = zeevAdapter.getSections();

    expect(sections).toEqual([
      { id: '9901', label: 'Dados da prestação de serviço', fields: [] },
      { id: '9902', label: 'Documentos', fields: [] },
      { id: '9903', label: 'Validação', fields: [] },
    ]);
  });

  it('ignora tabelas sem data-groupid ou fora de #ContainerForm', () => {
    document.body.innerHTML = `
      <table class="form" data-groupid="9999">
        <tr class="group"><td><b>Tabela Externa</b></td></tr>
      </table>
      <div id="containerRequest">
        <div id="ContainerForm">
          <table class="form">
            <tr class="group"><td><b>Sem group id</b></td></tr>
          </table>
          <table class="form" data-groupid="1111">
            <tr class="group"><td><b>Seção Válida</b></td></tr>
          </table>
        </div>
      </div>
    `;

    const sections = zeevAdapter.getSections();

    expect(sections).toEqual([{ id: '1111', label: 'Seção Válida', fields: [] }]);
  });

  it('descobre todas as linhas funcionais das seções 7727, 7728 e 7729 da T05', () => {
    document.body.innerHTML = t05RealSectionsMarkup();

    const sections = zeevAdapter.getSections();
    const section7727 = sections.find(({ id }): boolean => id === '7727');
    const section7728 = sections.find(({ id }): boolean => id === '7728');
    const section7729 = sections.find(({ id }): boolean => id === '7729');

    expect(section7727).toBeDefined();
    expect(section7727?.fields).toHaveLength(4);
    expect(section7727?.fields).toEqual([
      { name: 'numeroContrato', label: 'Numero do contrato' },
      { name: 'dataContrato', label: 'Data do contrato' },
      { name: 'valorContrato', label: 'Valor do contrato' },
      { name: 'documentoContratoPdf', label: 'Contrato em PDF' },
    ]);
    expect(section7727?.fields?.map(({ name }): string => name)).toEqual([
      'numeroContrato',
      'dataContrato',
      'valorContrato',
      'documentoContratoPdf',
    ]);
    expect(section7727?.fields?.map(({ label }): string => label)).toEqual([
      'Numero do contrato',
      'Data do contrato',
      'Valor do contrato',
      'Contrato em PDF',
    ]);

    expect(section7728).toBeDefined();
    expect(section7728?.fields).toHaveLength(1);
    expect(section7728?.fields).toEqual([
      {
        name: 'documentoCadastroPdf',
        label: 'Documento escolhido no cadastro em pdf',
      },
    ]);

    expect(section7729).toBeDefined();
    expect(section7729?.fields).toHaveLength(1);
    expect(section7729?.fields).toEqual([
      {
        name: 'correcaoRealizada',
        label: 'Correções realizadas:',
      },
    ]);
  });

  it('inclui campo materializado na seção mesmo quando o valor e o renderer estão vazios', () => {
    document.body.innerHTML = `
      <div id="containerRequest">
        <div id="ContainerForm">
          <table class="form" data-groupid="7729">
            <tbody>
              <tr class="group">
                <td><b data-key="7729">Validação</b></td>
              </tr>
              <tr codgroup="7729">
                <td class="col0">   Correções   realizadas:   </td>
                <td class="col1">
                  <input type="hidden" data-name="correcaoRealizada" value="">
                  <div class="form-control-static"><span></span></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    const sections = zeevAdapter.getSections();
    expect(sections).toHaveLength(1);
    expect(sections[0].fields).toEqual([
      { name: 'correcaoRealizada', label: 'Correções realizadas:' },
    ]);
  });

  it('não inclui inputs fora das tabelas materializadas na coleção de campos da seção', () => {
    document.body.innerHTML = `
      <input type="hidden" data-name="numeroContrato" value="EXTERNO_DOCUMENTO">
      <input type="hidden" data-name="dataContrato" value="EXTERNO_DATA">
      <div id="containerRequest">
        <input type="hidden" data-name="valorContrato" value="FORA_DO_CONTAINER_FORM">
        <div id="ContainerForm">
          <input type="hidden" data-name="documentoContratoPdf" value="FORA_DAS_TABELAS">
          <table class="form" data-groupid="7727">
            <tbody>
              <tr class="group">
                <td><b data-key="7727">Dados da prestação de serviço</b></td>
              </tr>
              <tr codgroup="7727">
                <td class="col0">  Numero   do   contrato  </td>
                <td class="col1">
                  <input type="hidden" data-name="numeroContrato" value="CTR-7727">
                </td>
              </tr>
              <tr codgroup="7727">
                <td class="col0">Data do contrato</td>
                <td class="col1">
                  <input type="hidden" data-name="dataContrato" value="2026-08-17">
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    const sections = zeevAdapter.getSections();
    expect(sections).toHaveLength(1);
    expect(sections[0].fields).toEqual([
      { name: 'numeroContrato', label: 'Numero do contrato' },
      { name: 'dataContrato', label: 'Data do contrato' },
    ]);
  });

  it('descobre dinamicamente as seções e campos da T04 mantendo correcaoRealizada externa fora da coleção', () => {
    document.body.innerHTML = t04RealSectionsMarkup();

    const sections = zeevAdapter.getSections();

    expect(sections).toEqual(EXPECTED_T04_NATIVE_SECTIONS);
    expect(sections).toHaveLength(5);

    const section7724 = sections.find(({ id }): boolean => id === '7724');
    expect(section7724?.fields?.map(({ name }): string => name)).toEqual([
      'nomeCompleto',
      'cpfCliente',
      'nacionalidade',
      'estadoCivil',
      'profissao',
      'tipoDocumento',
      'numeroDocumento',
    ]);

    const section7725 = sections.find(({ id }): boolean => id === '7725');
    expect(section7725?.fields?.map(({ name }): string => name)).toEqual([
      'telefone',
    ]);

    const section7726 = sections.find(({ id }): boolean => id === '7726');
    expect(section7726?.fields?.map(({ name }): string => name)).toEqual([
      'logradouro',
      'cepEndereco',
      'numeroEndereco',
    ]);

    const section7727 = sections.find(({ id }): boolean => id === '7727');
    expect(section7727?.fields?.map(({ name }): string => name)).toEqual([
      'numeroContrato',
      'dataContrato',
      'valorContrato',
      'documentoContratoPdf',
    ]);

    const section7728 = sections.find(({ id }): boolean => id === '7728');
    expect(section7728?.fields?.map(({ name }): string => name)).toEqual([
      'documentoCadastroPdf',
    ]);

    const allDiscoveredFieldNames = sections.flatMap(
      ({ fields }): readonly string[] =>
        fields?.map(({ name }): string => name) ?? [],
    );
    expect(allDiscoveredFieldNames).not.toContain('correcaoRealizada');
  });

  it('retorna valores seguros quando o DOM Zeev está ausente', () => {
    expect(zeevAdapter.getRoot()).toBeNull();
    expect(zeevAdapter.getForm()).toBeNull();
    expect(zeevAdapter.getSections()).toEqual([]);
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
