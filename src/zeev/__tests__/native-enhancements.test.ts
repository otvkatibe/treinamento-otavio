import { afterEach, describe, expect, it, vi } from 'vitest';

import { STAGE_CONTRACTS } from '../domain-contracts';
import {
  enhanceNativeExperience,
  resetNativeEnhancements,
} from '../native-enhancements';

function renderDocument(stageTitle: string, actions: string): void {
  document.body.innerHTML = `
    <main id="containerRequest">
      <header class="page-title"><h1>${stageTitle}</h1></header>
      <section id="ContainerForm">
        <table id="FrmExecute"><tbody>
          <tr><td id="td1nomeCompleto"><input data-name="nomeCompleto"></td></tr>
          <tr><td id="td1numeroContrato">
            <input type="hidden" data-name="numeroContrato" value="CTR-42">
            <div class="form-control-static"><span>CTR-42</span></div>
          </td></tr>
          <tr><td id="td1dataContrato">
            <input type="hidden" data-name="dataContrato" value="2026-08-14">
            <div class="form-control-static"><span>14/08/2026</span></div>
          </td></tr>
          <tr><td id="td1valorContrato">
            <input type="hidden" data-name="valorContrato" value="1000">
            <div class="form-control-static"><span>R$ 1.000,00</span></div>
          </td></tr>
          <tr><td id="td1documentoContratoPdf">
            <input type="hidden" data-name="documentoContratoPdf">
            <a href="/contrato.pdf">Abrir contrato</a>
            <button id="btnDownload_documentoContratoPdf">Baixar</button>
          </td></tr>
        </tbody></table>
      </section>
      <div id="controllers"><div id="buttons">${actions}</div></div>
    </main>
  `;
}

afterEach((): void => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('enhancements visuais do DOM nativo', () => {
  it('decora T05 sem substituir controles, handlers ou a ordem das decisões', () => {
    renderDocument(
      'T05 - Validar o contrato',
      '<div><button id="approve">Aprovar o contrato</button></div>' +
        '<div><button id="reject">Reprovar o contrato</button></div>',
    );
    const approve = document.querySelector<HTMLButtonElement>('#approve');
    const reject = document.querySelector<HTMLButtonElement>('#reject');
    const onApprove = vi.fn();
    approve?.addEventListener('click', onApprove);

    const summary = enhanceNativeExperience('T5');

    expect(summary.actions).toEqual([approve, reject]);
    expect(summary.actionRegion).toHaveAttribute(
      'data-zeev-fieb-role',
      'decision-panel',
    );
    expect(approve).toHaveAttribute(
      'data-zeev-fieb-action',
      'approve',
    );
    expect(reject).toHaveAttribute(
      'data-zeev-fieb-action',
      'reject',
    );
    expect(approve).toHaveAttribute(
      'data-zeev-fieb-action-label',
      'Aprovar o contrato',
    );

    approve?.click();
    expect(onApprove).toHaveBeenCalledOnce();
    expect(document.querySelector('#approve')).toBe(approve);
    expect(document.querySelector('#reject')).toBe(reject);
  });

  it('resolve e marca os três scalars readonly e o arquivo composto de T05', () => {
    renderDocument(
      'T05 - Validar o contrato',
      '<button>Aprovar o contrato</button><button>Reprovar o contrato</button>',
    );

    const summary = enhanceNativeExperience('T5');

    for (const name of ['numeroContrato', 'dataContrato', 'valorContrato']) {
      expect(
        document.querySelector(
          `[data-zeev-fieb-role="readonly-scalar-renderer"][data-zeev-fieb-field="${name}"]`,
        ),
      ).toBeInTheDocument();
      expect(document.querySelector(`#td1${name}`)).toHaveAttribute(
        'data-zeev-fieb-access',
        'read',
      );
    }
    expect(summary.readonlyRenderers).toHaveLength(3);
    expect(document.querySelector('#td1documentoContratoPdf')).toHaveAttribute(
      'data-zeev-fieb-role',
      'file-shell',
    );
    expect(
      document.querySelector('#btnDownload_documentoContratoPdf'),
    ).toHaveAttribute('data-zeev-fieb-role', 'file-download');
  });

  it('converge após sincronizações repetidas sem criar ou duplicar nós', () => {
    renderDocument(
      'T05 - Validar o contrato',
      '<button>Aprovar o contrato</button><button>Reprovar o contrato</button>',
    );
    const before = Array.from(document.querySelectorAll('*'));

    const first = enhanceNativeExperience('T5');
    const second = enhanceNativeExperience('T5');

    expect(Array.from(document.querySelectorAll('*'))).toEqual(before);
    expect(second.fieldShells).toEqual(first.fieldShells);
    expect(second.actions).toEqual(first.actions);
    expect(
      document.querySelectorAll('[data-zeev-fieb-role="decision-panel"]'),
    ).toHaveLength(1);
  });

  it('exposes stable semantic tokens for all T02 decisions', () => {
    renderDocument(
      'T02 - Validar o cadastro',
      '<div><button>Aprovar</button></div>' +
        '<div><button>Solicitar correÃ§Ã£o...</button></div>' +
        '<div><button>Reprovar</button></div>',
    );

    const summary = enhanceNativeExperience('T2');

    expect(
      summary.actions.map((element) =>
        element.getAttribute('data-zeev-fieb-action'),
      ),
    ).toEqual(['approve', 'correction', 'reject']);
  });

  it.each([
    ['START', '<button id="BtnSend">Enviar solicitação</button>', 'Enviar solicitação'],
    ['T1', '<button id="btnFinish">Concluir</button>', 'Concluir'],
    ['T2', '<div><button>Aprovar</button></div><div><button>Solicitar correção</button></div><div><button>Reprovar</button></div>', 'Aprovar'],
    ['T3', '<button id="btnFinish">Concluir</button>', 'Concluir'],
    ['T4', '<button id="btnFinish">Concluir</button>', 'Concluir'],
    ['T5', '<div><button>Aprovar o contrato</button></div><div><button>Reprovar o contrato</button></div>', 'Aprovar o contrato'],
  ] as const)(
    'integra a região e a ação nativa esperada em %s',
    (stageCode, actions, expectedAction): void => {
      renderDocument(STAGE_CONTRACTS[stageCode].title, actions);

      const summary = enhanceNativeExperience(stageCode);

      expect(summary.actionRegion).toHaveAttribute(
        'data-zeev-fieb-role',
        STAGE_CONTRACTS[stageCode].decisions.length > 0
          ? 'decision-panel'
          : 'native-action-region',
      );
      expect(summary.actions[0]).toHaveAttribute(
        'data-zeev-fieb-action',
        STAGE_CONTRACTS[stageCode].decisions.length > 0
          ? expectedAction.includes('Aprovar')
            ? 'approve'
            : expectedAction.includes('correÃ§Ã£o')
              ? 'correction'
              : 'reject'
          : 'submit',
      );
      expect(summary.actions[0]).toHaveAttribute(
        'data-zeev-fieb-action-label',
        expectedAction,
      );
    },
  );

  it('remove somente o contrato visual e preserva o DOM funcional', () => {
    renderDocument(
      'T05 - Validar o contrato',
      '<button id="approve">Aprovar o contrato</button><button>Reprovar o contrato</button>',
    );
    const root = document.querySelector('#containerRequest');
    const approve = document.querySelector('#approve');
    enhanceNativeExperience('T5');

    resetNativeEnhancements();

    expect(document.querySelector('#containerRequest')).toBe(root);
    expect(document.querySelector('#approve')).toBe(approve);
    expect(
      document.querySelectorAll('[data-zeev-fieb-enhanced="native"]'),
    ).toHaveLength(0);
    expect(document.querySelectorAll('[data-zeev-fieb-role]')).toHaveLength(0);
  });
});
