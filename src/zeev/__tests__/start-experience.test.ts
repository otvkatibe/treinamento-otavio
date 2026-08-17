import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  enhanceNativeExperience,
  resetNativeEnhancements,
} from '../native-enhancements';
import { startRealTableMarkup } from './fixtures/start-real-table.fixture';

function fieldRow(name: string, label: string, control: string): string {
  return `<tr><td class="col0"><label>${label}</label></td><td class="col1" id="td1${name}">${control}</td></tr>`;
}

function renderStartDocument(): void {
  document.body.innerHTML = `
    <section class="test-request-banner">
      <button id="reload">Recarregar</button>
      <span>Esta é uma solicitação de teste. Todas as tarefas serão redirecionadas a você.</span>
    </section>
    <aside class="host-sidebar">
      <nav aria-label="Navegação da solicitação">
        <a class="active" href="#inicio"><i></i>Início</a>
        <a href="#formulario"><i></i>Formulário</a>
        <a href="#mensagens"><i></i>Mensagens <span class="badge">2</span></a>
        <a href="#anexos"><i></i>Anexos <span class="badge">1</span></a>
      </nav>
    </aside>
    <main id="containerRequest">
      <header class="page-title"><h1>Solicitar registro</h1></header>
      <section id="ContainerForm">
        <table id="FrmExecute"><tbody>
          ${fieldRow('nomeCompleto', 'Nome completo', '<input data-name="nomeCompleto">')}
          ${fieldRow('cpfCliente', 'CPF', '<input data-name="cpfCliente"><small class="form-text">Somente números</small>')}
          ${fieldRow('nacionalidade', 'Nacionalidade', '<input data-name="nacionalidade">')}
          ${fieldRow('estadoCivil', 'Estado civil', '<label class="form-check"><input type="radio" data-name="estadoCivil" value="solteiro"> Solteiro(a)</label><label class="form-check"><input type="radio" data-name="estadoCivil" value="casado"> Casado(a)</label>')}
          ${fieldRow('profissao', 'Profissão', '<input data-name="profissao">')}
          ${fieldRow('tipoDocumento', 'Tipo de documento', '<label class="form-check"><input type="radio" data-name="tipoDocumento" value="cin"> CIN</label><label class="form-check"><input type="radio" data-name="tipoDocumento" value="rg"> RG</label>')}
          ${fieldRow('numeroDocumento', 'Número do documento', '<input data-name="numeroDocumento">')}
        </tbody></table>
      </section>
      <section class="communication">
        <div id="containerMessages"><button id="message-action">Nova mensagem</button></div>
        <div id="containerFiles"><button id="attachment-action">Anexar</button></div>
      </section>
      <div id="controllers"><div id="buttons"><button id="BtnSend">Enviar solicitação</button></div></div>
    </main>
  `;
}

function renderUploadModal(): void {
  document.body.insertAdjacentHTML(
    'beforeend',
    `
      <div id="template-upload"></div>
      <div id="template-download"></div>
      <div class="modal native-modal" role="dialog">
        <header class="modal-header">
          <h2 class="modal-title">Enviar arquivos</h2>
          <button class="btn-close native-close" data-bs-dismiss="modal">Fechar</button>
        </header>
        <div class="modal-body">
          <label class="dropzone native-dropzone">
            Selecionar arquivo
            <input id="upload-file" type="file">
          </label>
          <small>Formato PDF. Tamanho máximo 10 MB.</small>
          <div class="metadata">
            <div class="form-group"><label>Tipo do arquivo</label><select><option>Cadastro</option></select></div>
            <div class="form-group"><label>Comentário</label><input></div>
          </div>
          <table class="files"><thead><tr><th>Arquivo</th></tr></thead><tbody><tr><td>cadastro.pdf</td></tr></tbody></table>
          <div class="progress" role="progressbar"></div>
        </div>
        <footer class="modal-footer">
          <button id="cancel-upload">Cancelar</button>
          <button id="start-upload">Iniciar upload agora</button>
        </footer>
      </div>
    `,
  );
}

afterEach((): void => {
  resetNativeEnhancements(document);
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('refinamento nativo exclusivo do START', () => {
  it('normaliza o markup tabular real antes de aplicar o grid responsivo', () => {
    document.body.innerHTML = startRealTableMarkup();
    const originalNodes = Array.from(document.querySelectorAll('*'));

    const summary = enhanceNativeExperience('START');

    expect(summary.fieldShells).toHaveLength(7);
    expect(Array.from(document.querySelectorAll('*'))).toEqual(originalNodes);
    expect(document.querySelector('#ContainerForm')).toHaveClass(
      'box-border',
      '!w-full',
      '!max-w-full',
      '!overflow-x-clip',
    );
    expect(document.querySelector('#BoxFrmExecute')).toHaveClass(
      '!grid',
      'grid-cols-12',
      '!max-w-full',
      '!min-w-0',
    );
    document.querySelectorAll('.legacy-field-table, .legacy-heading-table').forEach(
      (table): void => {
        expect(table).toHaveClass('!contents');
      },
    );
    document.querySelectorAll('#BoxFrmExecute tbody').forEach((body): void => {
      expect(body).toHaveClass('!contents');
    });

    const headingRow = document.querySelector('.legacy-heading-row');
    expect(headingRow).toHaveClass('col-span-12', '!w-full', '!max-w-full');
    expect(headingRow?.firstElementChild).toHaveAttribute(
      'data-zeev-fieb-role',
      'start-section-heading',
    );
    expect(headingRow?.firstElementChild).toHaveClass(
      '!block',
      '!w-full',
      '!max-w-full',
      '!whitespace-normal',
    );

    for (const name of [
      'nomeCompleto',
      'estadoCivil',
      'profissao',
      'tipoDocumento',
      'numeroDocumento',
    ]) {
      expect(
        document.querySelector(`[data-zeev-fieb-role="start-field-row"][data-zeev-fieb-field="${name}"]`),
      ).toHaveClass('col-span-12', '!max-w-full', '!min-w-0');
    }
    for (const name of ['cpfCliente', 'nacionalidade']) {
      expect(
        document.querySelector(`[data-zeev-fieb-role="start-field-row"][data-zeev-fieb-field="${name}"]`),
      ).toHaveClass('col-span-6', 'max-md:col-span-12', '!max-w-full');
    }

    document.querySelectorAll('.radio-options').forEach((group): void => {
      expect(group).toHaveClass('!flex', 'flex-wrap', '!w-full', '!max-w-full');
    });
    document.querySelectorAll('.legacy-radio').forEach((choice): void => {
      expect(choice).toHaveClass(
        '!inline-flex',
        '!flex-none',
        'basis-auto',
        '!w-auto',
        '!max-w-full',
        '!whitespace-nowrap',
      );
    });
    expect(document.querySelector('#BoxFrmExecute')).toHaveClass('overflow-visible');
  });

  it('marca grid, radios, aside complementar, ação e chrome reconhecido', () => {
    renderStartDocument();

    const summary = enhanceNativeExperience('START');

    expect(summary.fieldShells).toHaveLength(7);
    expect(summary.actions).toEqual([document.querySelector('#BtnSend')]);
    expect(summary.hostSidebar).toHaveAttribute(
      'data-zeev-fieb-role',
      'host-sidebar',
    );
    expect(summary.testEnvironmentBar).toHaveAttribute(
      'data-zeev-fieb-role',
      'test-environment-bar',
    );
    expect(summary.messageRegion).toHaveAttribute(
      'data-zeev-fieb-role',
      'start-messages',
    );
    expect(summary.attachmentRegion).toHaveAttribute(
      'data-zeev-fieb-role',
      'start-attachments',
    );
    expect(document.querySelector('.communication')).toHaveAttribute(
      'data-zeev-fieb-role',
      'start-communication',
    );
    expect(
      document.querySelectorAll('[data-zeev-fieb-host-label]'),
    ).toHaveLength(4);
    expect(
      document.querySelector('[data-zeev-fieb-host-label="inicio"]'),
    ).toHaveAttribute('data-zeev-fieb-active', 'true');
    expect(
      document.querySelectorAll('[data-zeev-fieb-role="host-sidebar-badge"]'),
    ).toHaveLength(2);
    expect(
      document.querySelectorAll(
        '[data-zeev-fieb-field="estadoCivil"][data-zeev-fieb-role="native-field"]',
      ),
    ).toHaveLength(2);
    expect(
      document.querySelectorAll(
        '[data-zeev-fieb-field="tipoDocumento"][data-zeev-fieb-role="native-field"]',
      ),
    ).toHaveLength(2);
    expect(
      document.querySelectorAll('[data-zeev-fieb-grid-span="6"]'),
    ).toHaveLength(2);
    expect(
      document.querySelectorAll('[data-zeev-fieb-grid-span="12"]'),
    ).toHaveLength(5);
    expect(
      document.querySelectorAll('[data-zeev-fieb-role="radio-choice-card"]'),
    ).toHaveLength(4);
    expect(
      document.querySelector('[data-zeev-fieb-role="start-field-grid"]'),
    ).toHaveClass('!grid', 'grid-cols-12');
    expect(summary.hostSidebar).toHaveClass('bg-slate-50', 'border-slate-200');
    expect(summary.actions[0]).toHaveClass('bg-blue-700', 'min-h-11');
    expect(
      document.querySelector('[data-zeev-fieb-role="radio-choice-card"]'),
    ).toHaveClass('has-[:checked]:bg-blue-50');
  });

  it('aplica utilities Tailwind ao modal real de upload sem substituir controles', () => {
    renderStartDocument();
    renderUploadModal();
    const modal = document.querySelector<HTMLElement>('.native-modal');
    const input = document.querySelector<HTMLInputElement>('#upload-file');
    const cancel = document.querySelector<HTMLButtonElement>('#cancel-upload');
    const submit = document.querySelector<HTMLButtonElement>('#start-upload');
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    cancel?.addEventListener('click', onCancel);
    submit?.addEventListener('click', onSubmit);

    const summary = enhanceNativeExperience('START');

    expect(summary.uploadModal).toBe(modal);
    expect(summary.uploadInput).toBe(input);
    expect(summary.uploadTable).toHaveClass('w-full', 'border-collapse');
    expect(summary.uploadProgress).toHaveClass('rounded-full', 'bg-slate-200');
    expect(summary.uploadCancelAction).toHaveClass('border-slate-300', 'bg-white');
    expect(summary.uploadStartAction).toHaveClass('bg-blue-700', 'text-white');
    expect(modal).toHaveClass('rounded-2xl', 'shadow-2xl');
    expect(document.querySelector('.native-dropzone')).toHaveClass(
      'border-dashed',
      'bg-blue-50/50',
    );
    expect(document.querySelector('.metadata')).toHaveClass(
      'grid-cols-2',
      'max-sm:grid-cols-1',
    );
    cancel?.click();
    submit?.click();
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(document.querySelector('#upload-file')).toBe(input);

    enhanceNativeExperience('T1');

    expect(modal).toHaveClass('native-modal');
    expect(modal).not.toHaveClass('rounded-2xl', 'shadow-2xl');
    expect(document.querySelector('.native-dropzone')).toHaveClass(
      'native-dropzone',
    );
    expect(modal).not.toHaveAttribute('data-zeev-fieb-classes');
    expect(document.querySelector('.native-dropzone')).not.toHaveAttribute(
      'data-zeev-fieb-classes',
    );
  });

  it('preserva handlers e converge sem mover ou duplicar nós', () => {
    renderStartDocument();
    const send = document.querySelector<HTMLButtonElement>('#BtnSend');
    const reload = document.querySelector<HTMLButtonElement>('#reload');
    const navigation = document.querySelector<HTMLAnchorElement>('[href="#formulario"]');
    const onSend = vi.fn();
    const onReload = vi.fn();
    const onNavigate = vi.fn((event: Event) => event.preventDefault());
    send?.addEventListener('click', onSend);
    reload?.addEventListener('click', onReload);
    navigation?.addEventListener('click', onNavigate);
    const before = Array.from(document.querySelectorAll('*'));

    const first = enhanceNativeExperience('START');
    const firstClasses = Array.from(document.querySelectorAll<HTMLElement>('*')).map(
      (element) => element.className,
    );
    const second = enhanceNativeExperience('START');

    expect(Array.from(document.querySelectorAll('*'))).toEqual(before);
    expect(second.fieldShells).toEqual(first.fieldShells);
    expect(
      Array.from(document.querySelectorAll<HTMLElement>('*')).map(
        (element) => element.className,
      ),
    ).toEqual(firstClasses);
    send?.click();
    reload?.click();
    navigation?.click();
    expect(onSend).toHaveBeenCalledOnce();
    expect(onReload).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledOnce();
    expect(document.querySelector('#BtnSend')).toBe(send);
    expect(document.querySelector('#reload')).toBe(reload);
  });

  it('remove o chrome START ao sincronizar outra tarefa', () => {
    renderStartDocument();
    enhanceNativeExperience('START');

    enhanceNativeExperience('T1');

    expect(document.querySelector('#containerRequest')).toHaveAttribute(
      'data-zeev-fieb-stage',
      'T1',
    );
    expect(
      document.querySelector('[data-zeev-fieb-role="host-sidebar"]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-zeev-fieb-role="test-environment-bar"]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-zeev-fieb-role="start-messages"]'),
    ).toBeNull();
  });
});
