// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';

import { STAGE_CONTRACTS } from '../domain-contracts';
import {
  getNativeStageControlContract,
  resolveNativeStageControls,
} from '../native-controls';

afterEach((): void => {
  document.body.innerHTML = '';
});

describe('controles nativos por contexto', () => {
  it('resolve #BtnSend e o label esperado em START', () => {
    document.body.innerHTML = `
      <div id="buttons">
        <button id="BtnSend" type="button">Enviar solicitação</button>
      </div>
    `;

    const resolved = resolveNativeStageControls(STAGE_CONTRACTS.START);

    expect(resolved.contract).toMatchObject({
      context: 'start',
      primaryControl: {
        id: 'BtnSend',
        label: 'Enviar solicitação',
      },
      usesDirectActions: false,
    });
    expect(resolved.primaryControl).toBe(document.getElementById('BtnSend'));
    expect(resolved.primaryControl?.textContent?.trim()).toBe(
      'Enviar solicitação',
    );
    expect(resolved.directActions).toEqual([]);
  });

  it('resolve #btnFinish e o label esperado em tarefa humana comum', () => {
    document.body.innerHTML = `
      <div id="buttons">
        <button id="btnFinish" type="button">Concluir</button>
      </div>
    `;

    const resolved = resolveNativeStageControls(STAGE_CONTRACTS.T1);

    expect(resolved.contract).toMatchObject({
      context: 'human-task',
      primaryControl: {
        id: 'btnFinish',
        label: 'Concluir',
      },
      usesDirectActions: false,
    });
    expect(resolved.primaryControl).toBe(document.getElementById('btnFinish'));
    expect(resolved.primaryControl?.textContent?.trim()).toBe('Concluir');
    expect(resolved.directActions).toEqual([]);
  });

  it('resolve T02 nos wrappers de ação diretamente associados a #buttons', () => {
    document.body.innerHTML = `
      <div id="buttons">
        <div class="mb-2 mr-lg-1 btn-mobile">
          <button id="customBtn_Cancelado" type="button">Reprovar...</button>
        </div>
        <div class="mb-2 mr-lg-1 btn-mobile">
          <button id="customBtn_Revisão solicitada" type="button">Solicitar correção...</button>
        </div>
        <div class="mb-2 mr-lg-1 btn-mobile">
          <button id="btnApprove" type="button">Aprovar</button>
        </div>
        <span><button id="nested">Não pertence a wrapper de ação</button></span>
      </div>
      <div id="other-region"><button id="outside">Fora da região</button></div>
      <div id="BoxForceInputReason" style="display:none">
        <button id="BtnConfirmReason">Confirmar justificativa</button>
      </div>
    `;

    const resolved = resolveNativeStageControls(STAGE_CONTRACTS.T2);

    expect(getNativeStageControlContract(STAGE_CONTRACTS.T2)).toEqual({
      context: 'decision',
      regionSelector: '#buttons',
      primaryControl: null,
      usesDirectActions: true,
    });
    expect(resolved.primaryControl).toBeNull();
    expect(resolved.directActions.map(({ id }) => id)).toEqual([
      'customBtn_Cancelado',
      'customBtn_Revisão solicitada',
      'btnApprove',
    ]);
  });

  it('resolve T05 no nesting real #buttons > div > button e preserva ids com espaços', () => {
    document.body.innerHTML = `
      <div id="buttons">
        <div class="mb-2 mr-lg-1 btn-mobile">
          <button id="customBtn_Reprovar o contrato">Reprovar o contrato</button>
        </div>
        <div class="mb-2 mr-lg-1 btn-mobile">
          <button id="customBtn_Aprovar o contrato">Aprovar o contrato</button>
        </div>
        <div style="display:none">
          <button id="hidden-action">Ação auxiliar oculta</button>
        </div>
      </div>
      <div id="other-buttons">
        <button id="foreign-action">Ação de outra região</button>
      </div>
    `;

    const resolved = resolveNativeStageControls(STAGE_CONTRACTS.T5);

    expect(resolved.directActions.map(({ id }) => id)).toEqual([
      'customBtn_Reprovar o contrato',
      'customBtn_Aprovar o contrato',
    ]);
    expect(
      resolved.directActions.map(({ textContent }) => textContent?.trim()),
    ).toEqual(['Reprovar o contrato', 'Aprovar o contrato']);
  });
});
