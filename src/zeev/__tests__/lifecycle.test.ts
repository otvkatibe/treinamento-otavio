// @vitest-environment jsdom

import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  LifecycleReason,
  ProcessExecutionIdentity,
  ZeevFiebRuntime,
} from '../types';

const DEFAULT_IDENTITY: ProcessExecutionIdentity = {
  uid: 'UID-A',
  flowExecute: '6683',
};

function hiddenInput(id: string, value: string | null): string {
  return value === null
    ? ''
    : `<input type="hidden" id="${id}" value="${value}">`;
}

function zeevMarkup(
  title = 'Solicitar registro',
  identity: ProcessExecutionIdentity = DEFAULT_IDENTITY,
): string {
  return `
    <div id="containerRequest">
      <div class="page-title"><h1>${title}</h1></div>
      ${hiddenInput('inpCodFlowExecuteUID', identity.uid)}
      ${hiddenInput('inpCodFlowExecute', identity.flowExecute)}
      <section class="main-col">
        <div id="ContainerForm"><form id="FrmExecute"></form></div>
      </section>
      <div id="controllers">
        <div id="buttons"><button id="BtnSend">Enviar</button></div>
      </div>
    </div>
  `;
}

function renderZeevDom(
  title = 'Solicitar registro',
  identity: ProcessExecutionIdentity = DEFAULT_IDENTITY,
): void {
  document.body.innerHTML = zeevMarkup(title, identity);
}

function setIdentity(identity: ProcessExecutionIdentity): void {
  document.querySelector('#inpCodFlowExecuteUID')?.remove();
  document.querySelector('#inpCodFlowExecute')?.remove();
  document.querySelector('#containerRequest')?.insertAdjacentHTML(
    'afterbegin',
    `${hiddenInput('inpCodFlowExecuteUID', identity.uid)}${hiddenInput(
      'inpCodFlowExecute',
      identity.flowExecute,
    )}`,
  );
}

async function flushMutationObserver(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

function advanceTimersByTime(milliseconds: number): void {
  act((): void => {
    vi.advanceTimersByTime(milliseconds);
  });
}

function runPendingTimers(): void {
  act((): void => {
    vi.runOnlyPendingTimers();
  });
}

function syncWithAct(
  sync: (reason?: LifecycleReason) => ZeevFiebRuntime,
  reason: LifecycleReason = 'manual',
): ZeevFiebRuntime {
  let runtime: ZeevFiebRuntime | null = null;
  act((): void => {
    runtime = sync(reason);
  });
  if (!runtime) {
    throw new Error('Lifecycle sync did not return a runtime');
  }
  return runtime;
}

beforeEach(() => {
  vi.useFakeTimers();
  if (!document.body) {
    document.documentElement.append(document.createElement('body'));
  }
  document.body.innerHTML = '';
  sessionStorage.clear();
  window.history.replaceState(null, '', '/2.0/request?c=TOKEN-A');
  delete window.__ZEEV_FIEB__;
});

afterEach(async () => {
  const { teardown } = await import('../lifecycle');
  act((): void => teardown());
  if (!document.body) {
    document.documentElement.append(document.createElement('body'));
  }
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('lifecycle SPA', () => {
  it('não executa boot ao importar lifecycle.ts', async () => {
    await import('../lifecycle');

    expect(window.__ZEEV_FIEB__).toBeUndefined();
  });

  it('executa boot automaticamente somente pela entrada main.tsx', async () => {
    renderZeevDom();
    await import('../../main');

    expect(window.__ZEEV_FIEB__?.initialized).toBe(true);
    expect(typeof window.__ZEEV_FIEB__?.diagnostics).toBe('function');
    advanceTimersByTime(100);
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
  });

  it('inicializa uma vez e cria um único mount point sem React root', async () => {
    renderZeevDom();
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const { boot } = await import('../lifecycle');

    const firstRuntime = boot();
    const observer = firstRuntime.observer;
    const secondRuntime = boot();
    advanceTimersByTime(100);

    expect(secondRuntime).toBe(firstRuntime);
    expect(typeof secondRuntime.diagnostics).toBe('function');
    expect(secondRuntime.observer).toBe(observer);
    expect(secondRuntime.initialized).toBe(true);
    expect(secondRuntime.reactRoot).not.toBeNull();
    expect(secondRuntime.reactMountElement).toBe(secondRuntime.mountElement);
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
    expect(document.querySelector('#zeev-fieb-root')?.nextElementSibling?.id).toBe(
      'ContainerForm',
    );
    expect(
      addEventListenerSpy.mock.calls.filter(([type]) => type === 'popstate'),
    ).toHaveLength(1);
    expect(
      addEventListenerSpy.mock.calls.filter(([type]) => type === 'hashchange'),
    ).toHaveLength(1);
  });

  it('hidrata a API pública sem substituir um singleton existente', async () => {
    renderZeevDom();
    const { boot } = await import('../lifecycle');

    const runtime = boot();
    advanceTimersByTime(100);
    Reflect.deleteProperty(runtime, 'diagnostics');
    Reflect.deleteProperty(runtime, 'executionIdentity');

    const hydratedRuntime = boot();

    expect(hydratedRuntime).toBe(runtime);
    expect(window.__ZEEV_FIEB__).toBe(runtime);
    expect(typeof hydratedRuntime.diagnostics).toBe('function');
    expect(hydratedRuntime.executionIdentity).toBeNull();
  });

  it('mantém um mount point após múltiplos syncs manuais', async () => {
    renderZeevDom();
    const { sync } = await import('../lifecycle');

    const nativeForm = document.querySelector('#ContainerForm');
    const nativeSendButton = document.querySelector('#BtnSend');
    const firstRuntime = syncWithAct(sync);
    const firstReactRoot = firstRuntime.reactRoot;
    Reflect.deleteProperty(firstRuntime, 'diagnostics');
    syncWithAct(sync);
    const runtime = syncWithAct(sync);

    expect(runtime).toBe(firstRuntime);
    expect(typeof runtime.diagnostics).toBe('function');
    expect(runtime.syncCount).toBe(3);
    expect(runtime.reactRoot).toBe(firstReactRoot);
    expect(document.querySelector('#ContainerForm')).toBe(nativeForm);
    expect(document.querySelector('#BtnSend')).toBe(nativeSendButton);
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
  });

  it('elimina mount points duplicados e mantém o elemento na posição correta', async () => {
    renderZeevDom();
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<div id="zeev-fieb-root"></div><div id="zeev-fieb-root"></div>',
    );
    const { sync } = await import('../lifecycle');

    const runtime = syncWithAct(sync);

    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
    expect(runtime.mountElement?.nextElementSibling?.id).toBe('ContainerForm');
  });

  it('transiciona START para T1 sem estado stale e reutiliza a React root', async () => {
    renderZeevDom();
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const { sync } = await import('../lifecycle');

    const initialRuntime = syncWithAct(sync);
    const initialReactRoot = initialRuntime.reactRoot;
    expect(initialRuntime.currentTask?.code).toBe('START');
    expect(initialRuntime.currentTask?.metadata?.kind).toBe('start-event');
    const title = document.querySelector('.page-title h1');
    if (title) title.textContent = 'T01 - Fazer o cadastro';
    const runtime = syncWithAct(sync);

    expect(runtime).toBe(initialRuntime);
    expect(runtime.reactRoot).toBe(initialReactRoot);
    expect(runtime.reactMountElement).toBe(runtime.mountElement);
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
    expect(typeof runtime.diagnostics).toBe('function');
    expect(runtime.currentTask?.code).toBe('T1');
    expect(runtime.currentTask?.metadata?.kind).toBe('human-task');
    expect(runtime.currentTask?.title).toBe('T01 - Fazer o cadastro');
    expect(runtime.diagnostics().task.code).toBe('T1');
    expect(runtime.diagnostics().checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'task.synchronized', status: 'PASS' }),
        expect.objectContaining({ id: 'mount.unique', status: 'PASS' }),
        expect.objectContaining({ id: 'island.integrity', status: 'PASS' }),
      ]),
    );
    expect(runtime.viewSignature?.title).toBe('T01 - Fazer o cadastro');
    expect(infoSpy).toHaveBeenCalledWith(
      '[Zeev FIEB v0.4.0-rc.2] view changed: START -> T1',
    );
  });

  it('memoriza a rota observada no ciclo T2 para T3 para T2 sem duplicar stages', async () => {
    renderZeevDom();
    window.history.replaceState(null, '', '/2.0/request?c=TOKEN-A');
    const { sync } = await import('../lifecycle');
    const titles = [
      'Solicitar registro',
      'T01 - Fazer o cadastro',
      'T02 - Validar o cadastro',
      'T03 - Corrigir o cadastro',
      'T02 - Validar o cadastro',
      'T04 - Fazer o contrato',
      'T05 - Validar o contrato',
    ] as const;
    let runtime = syncWithAct(sync);

    titles.forEach((title, index): void => {
      const titleElement = document.querySelector('.page-title h1');
      if (titleElement) titleElement.textContent = title;
      if (index === 1) {
        window.history.replaceState(null, '', '/2.0/task?c=TOKEN-B');
      }
      runtime = syncWithAct(sync);
    });

    expect(runtime.currentTask?.code).toBe('T5');
    expect(runtime.visitedStages).toEqual([
      'START',
      'T1',
      'T2',
      'T3',
      'T4',
      'T5',
    ]);
    expect(runtime.viewSignature).toMatchObject({
      pathname: '/2.0/task',
      observedExecutionIdentity: DEFAULT_IDENTITY,
    });
    expect(runtime.executionIdentity).toEqual(DEFAULT_IDENTITY);
  });

  it('preserva a rota de T1 para T2 quando c muda e a identidade permanece', async () => {
    renderZeevDom('T01 - Fazer o cadastro');
    window.history.replaceState(null, '', '/2.0/task?c=TOKEN-B');
    const { sync } = await import('../lifecycle');

    const runtime = syncWithAct(sync);
    expect(runtime.visitedStages).toEqual(['T1']);

    window.history.replaceState(null, '', '/2.0/task?c=TOKEN-C');
    const title = document.querySelector('.page-title h1');
    if (title) title.textContent = 'T02 - Validar o cadastro';
    syncWithAct(sync);

    expect(runtime.visitedStages).toEqual(['T1', 'T2']);
    expect(runtime.executionIdentity).toEqual(DEFAULT_IDENTITY);
  });

  it.each([
    {
      label: 'UID ausente com flowExecute estavel',
      observed: { uid: null, flowExecute: '6683' },
    },
    {
      label: 'flowExecute ausente com UID estavel',
      observed: { uid: 'UID-A', flowExecute: null },
    },
  ] as const)('preserva a identidade quando $label', ({ observed }) => {
    renderZeevDom('T01 - Fazer o cadastro');
    return import('../lifecycle').then(({ sync }): void => {
      const runtime = syncWithAct(sync);
      setIdentity(observed);
      const title = document.querySelector('.page-title h1');
      if (title) title.textContent = 'T02 - Validar o cadastro';
      syncWithAct(sync);

      expect(runtime.executionIdentity).toEqual(DEFAULT_IDENTITY);
      expect(runtime.visitedStages).toEqual(['T1', 'T2']);
    });
  });

  it.each([
    {
      label: 'UID primeiro e flowExecute depois',
      initial: { uid: 'UID-A', flowExecute: null },
      observed: { uid: null, flowExecute: '6683' },
    },
    {
      label: 'flowExecute primeiro e UID depois',
      initial: { uid: null, flowExecute: '6683' },
      observed: { uid: 'UID-A', flowExecute: null },
    },
  ] as const)(
    'complementa aliases sem reiniciar quando $label',
    ({ initial, observed }) => {
      renderZeevDom('T01 - Fazer o cadastro', initial);
      return import('../lifecycle').then(({ sync }): void => {
        const runtime = syncWithAct(sync);
        setIdentity(observed);
        const title = document.querySelector('.page-title h1');
        if (title) title.textContent = 'T02 - Validar o cadastro';
        syncWithAct(sync);

        expect(runtime.executionIdentity).toEqual(DEFAULT_IDENTITY);
        expect(runtime.visitedStages).toEqual(['T1', 'T2']);
      });
    },
  );

  it.each([
    {
      label: 'UID conhecido',
      observed: { uid: 'UID-B', flowExecute: '6683' },
    },
    {
      label: 'flowExecute conhecido',
      observed: { uid: 'UID-A', flowExecute: '6691' },
    },
  ] as const)(
    'reinicia o historico quando muda o $label',
    ({ observed }) => {
      renderZeevDom('T01 - Fazer o cadastro');
      return import('../lifecycle').then(({ sync }): void => {
        const runtime = syncWithAct(sync);
        setIdentity(observed);
        const title = document.querySelector('.page-title h1');
        if (title) title.textContent = 'T02 - Validar o cadastro';
        syncWithAct(sync);

        expect(runtime.executionIdentity).toEqual(observed);
        expect(runtime.visitedStages).toEqual(['T2']);
      });
    },
  );

  it('preserva estado com observacao inconclusiva e aceita o reaparecimento', async () => {
    renderZeevDom('T01 - Fazer o cadastro');
    const { sync } = await import('../lifecycle');
    const runtime = syncWithAct(sync);

    setIdentity({ uid: null, flowExecute: null });
    const title = document.querySelector('.page-title h1');
    if (title) title.textContent = 'T02 - Validar o cadastro';
    syncWithAct(sync);
    expect(runtime.executionIdentity).toEqual(DEFAULT_IDENTITY);
    expect(runtime.visitedStages).toEqual(['T1', 'T2']);

    setIdentity(DEFAULT_IDENTITY);
    if (title) title.textContent = 'T03 - Corrigir o cadastro';
    syncWithAct(sync);
    expect(runtime.executionIdentity).toEqual(DEFAULT_IDENTITY);
    expect(runtime.visitedStages).toEqual(['T1', 'T2', 'T3']);
  });

  it('normaliza whitespace e reinicia uma unica vez para nova identidade', async () => {
    renderZeevDom('T01 - Fazer o cadastro', {
      uid: '  UID-A  ',
      flowExecute: ' 6683 ',
    });
    const { sync } = await import('../lifecycle');
    const runtime = syncWithAct(sync);
    expect(runtime.executionIdentity).toEqual(DEFAULT_IDENTITY);

    setIdentity({ uid: ' UID-B ', flowExecute: ' 6691 ' });
    const title = document.querySelector('.page-title h1');
    if (title) title.textContent = 'T02 - Validar o cadastro';
    syncWithAct(sync);
    syncWithAct(sync);

    expect(runtime.executionIdentity).toEqual({
      uid: 'UID-B',
      flowExecute: '6691',
    });
    expect(runtime.visitedStages).toEqual(['T2']);
  });

  it('detecta a substituição completa de containerRequest', async () => {
    renderZeevDom();
    const { sync } = await import('../lifecycle');

    const initialRuntime = syncWithAct(sync);
    const initialRoot = initialRuntime.viewSignature?.root;
    const initialMount = initialRuntime.mountElement;
    const initialReactRoot = initialRuntime.reactRoot;
    document.querySelector('#containerRequest')?.remove();
    document.body.insertAdjacentHTML(
      'beforeend',
      zeevMarkup('T01 - Fazer o cadastro'),
    );
    const updatedRuntime = syncWithAct(sync);

    expect(updatedRuntime.viewSignature?.root).not.toBe(initialRoot);
    expect(updatedRuntime.mountElement).not.toBe(initialMount);
    expect(updatedRuntime.reactRoot).not.toBe(initialReactRoot);
    expect(updatedRuntime.reactMountElement).toBe(updatedRuntime.mountElement);
    expect(initialMount?.isConnected).toBe(false);
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
    expect(updatedRuntime.currentTask?.code).toBe('T1');
    expect(updatedRuntime.executionIdentity).toEqual(DEFAULT_IDENTITY);
    expect(updatedRuntime.visitedStages).toEqual(['START', 'T1']);
  });

  it('encerra de forma neutra quando container ou titulo deixam de existir', async () => {
    renderZeevDom('T05 - Validar o contrato');
    const { sync } = await import('../lifecycle');

    const runtime = syncWithAct(sync);
    expect(runtime.visitedStages).toEqual(['T5']);

    document.querySelector('.page-title')?.remove();
    syncWithAct(sync);
    expect(runtime.currentTask).toBeNull();
    expect(runtime.visitedStages).toEqual(['T5']);
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);

    document.querySelector('#containerRequest')?.remove();
    syncWithAct(sync);
    expect(runtime.currentTask).toBeNull();
    expect(runtime.executionIdentity).toEqual(DEFAULT_IDENTITY);
    expect(runtime.visitedStages).toEqual(['T5']);
    expect(runtime.mountElement).toBeNull();
    expect(runtime.reactRoot).toBeNull();
    expect(document.querySelector('#zeev-fieb-root')).toBeNull();

    document.body.insertAdjacentHTML(
      'beforeend',
      zeevMarkup('T01 - Fazer o cadastro', DEFAULT_IDENTITY),
    );
    syncWithAct(sync);
    expect(runtime.executionIdentity).toEqual(DEFAULT_IDENTITY);
    expect(runtime.visitedStages).toEqual(['T5', 'T1']);
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
  });

  it('sincroniza mutações estruturais após debounce de 100 ms', async () => {
    renderZeevDom();
    const { boot } = await import('../lifecycle');

    const runtime = boot();
    advanceTimersByTime(100);
    await flushMutationObserver();
    runPendingTimers();
    const countBeforeMutation = runtime.syncCount;

    const title = document.querySelector('.page-title h1');
    if (title) title.textContent = 'T02 - Validar o cadastro';
    await flushMutationObserver();

    advanceTimersByTime(99);
    expect(runtime.syncCount).toBe(countBeforeMutation);
    advanceTimersByTime(1);
    expect(runtime.syncCount).toBe(countBeforeMutation + 1);
    expect(runtime.currentTask?.code).toBe('T2');
  });

  it('responde a popstate e hashchange pelo mesmo debounce', async () => {
    renderZeevDom();
    const { boot } = await import('../lifecycle');

    const runtime = boot();
    advanceTimersByTime(100);
    const initialCount = runtime.syncCount;

    window.dispatchEvent(new PopStateEvent('popstate'));
    advanceTimersByTime(100);
    expect(runtime.syncCount).toBe(initialCount + 1);

    window.dispatchEvent(new HashChangeEvent('hashchange'));
    advanceTimersByTime(100);
    expect(runtime.syncCount).toBe(initialCount + 2);
  });

  it('aguarda DOMContentLoaded quando document.body não existe', async () => {
    document.body.remove();
    const { boot } = await import('../lifecycle');

    const runtime = boot();
    expect(runtime.initialized).toBe(true);
    expect(runtime.bootstrapStatus).toBe('waiting-document');

    const body = document.createElement('body');
    body.innerHTML = zeevMarkup();
    document.documentElement.append(body);
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushMutationObserver();
    advanceTimersByTime(100);

    expect(runtime.initialized).toBe(true);
    expect(runtime.observer).not.toBeNull();
    expect(runtime.bootstrapStatus).toBe('mounted');
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
  });

  it('remove deterministicamente recursos, singleton e mount point', async () => {
    renderZeevDom();
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { boot, teardown } = await import('../lifecycle');

    const runtime = boot();
    advanceTimersByTime(100);
    const observer = runtime.observer;
    const disconnectSpy = observer
      ? vi.spyOn(observer, 'disconnect')
      : undefined;

    act((): void => teardown());

    expect(disconnectSpy).toHaveBeenCalledOnce();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'popstate',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'hashchange',
      expect.any(Function),
    );
    expect(window.__ZEEV_FIEB__).toBeUndefined();
    expect(runtime.reactRoot).toBeNull();
    expect(runtime.reactMountElement).toBeNull();
    expect(runtime.executionIdentity).toBeNull();
    expect(runtime.visitedStages).toEqual([]);
    expect(document.querySelector('#zeev-fieb-root')).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('autorrecupera mount e React root removidos externamente', async () => {
    renderZeevDom();
    const { sync } = await import('../lifecycle');

    const initialRuntime = syncWithAct(sync);
    const initialMount = initialRuntime.mountElement;
    const initialReactRoot = initialRuntime.reactRoot;
    initialMount?.remove();

    const recoveredRuntime = syncWithAct(sync);

    expect(recoveredRuntime).toBe(initialRuntime);
    expect(typeof recoveredRuntime.diagnostics).toBe('function');
    expect(recoveredRuntime.diagnostics().mount).toMatchObject({
      count: 1,
      id: 'zeev-fieb-root',
      connected: true,
      before: 'ContainerForm',
    });
    expect(recoveredRuntime.mountElement).not.toBe(initialMount);
    expect(recoveredRuntime.reactRoot).not.toBe(initialReactRoot);
    expect(recoveredRuntime.reactMountElement).toBe(recoveredRuntime.mountElement);
    expect(recoveredRuntime.mountElement?.isConnected).toBe(true);
    expect(recoveredRuntime.executionIdentity).toEqual(DEFAULT_IDENTITY);
    expect(recoveredRuntime.visitedStages).toEqual(['START']);
    expect(
      recoveredRuntime.mountElement?.querySelector(
        '[data-zeev-fieb-island="true"]',
      ),
    ).not.toBeNull();
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
  });

  it('recria o React root quando o conteúdo da Island é removido', async () => {
    renderZeevDom();
    const { sync } = await import('../lifecycle');

    const initialRuntime = syncWithAct(sync);
    const mountElement = initialRuntime.mountElement;
    const initialReactRoot = initialRuntime.reactRoot;
    mountElement?.replaceChildren();

    const recoveredRuntime = syncWithAct(sync);

    expect(recoveredRuntime.mountElement).toBe(mountElement);
    expect(recoveredRuntime.reactRoot).not.toBe(initialReactRoot);
    expect(recoveredRuntime.reactMountElement).toBe(mountElement);
    expect(
      mountElement?.querySelector('[data-zeev-fieb-island="true"]'),
    ).not.toBeNull();
  });

  it('recria o React root quando a associação com o mount é inválida', async () => {
    renderZeevDom();
    const { sync } = await import('../lifecycle');

    const initialRuntime = syncWithAct(sync);
    const initialReactRoot = initialRuntime.reactRoot;
    initialRuntime.reactMountElement = document.createElement('div');

    const recoveredRuntime = syncWithAct(sync);

    expect(recoveredRuntime.reactRoot).not.toBe(initialReactRoot);
    expect(recoveredRuntime.reactMountElement).toBe(recoveredRuntime.mountElement);
  });

  it('recupera a perda da referência pública sem manter dois roots', async () => {
    renderZeevDom();
    const { sync } = await import('../lifecycle');

    const initialRuntime = syncWithAct(sync);
    const initialReactRoot = initialRuntime.reactRoot;
    initialRuntime.reactRoot = null;

    const recoveredRuntime = syncWithAct(sync);

    expect(recoveredRuntime.reactRoot).not.toBeNull();
    expect(recoveredRuntime.reactRoot).not.toBe(initialReactRoot);
    expect(recoveredRuntime.reactMountElement).toBe(recoveredRuntime.mountElement);
    expect(document.querySelectorAll('[data-zeev-fieb-island="true"]')).toHaveLength(
      1,
    );
  });

  it('hidrata T2 -> T3 -> T2 como novos documentos da mesma sessão', async () => {
    const { sync, teardown } = await import('../lifecycle');

    for (const title of [
      'T02 - Validar o cadastro',
      'T03 - Corrigir o cadastro',
      'T02 - Validar o cadastro',
    ]) {
      renderZeevDom(title);
      syncWithAct(sync);
      act((): void => teardown());
    }

    renderZeevDom('T02 - Validar o cadastro');
    const runtime = syncWithAct(sync);

    expect(runtime.executionIdentity).toEqual(DEFAULT_IDENTITY);
    expect(runtime.visitedStages).toEqual(['T2', 'T3']);
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
  });

  it('monta quando o container chega durante os retries iniciais', async () => {
    const { boot } = await import('../lifecycle');
    const runtime = boot();

    expect(runtime.bootstrapStatus).toBe('waiting-container');
    document.body.innerHTML = zeevMarkup('T01 - Fazer o cadastro');
    advanceTimersByTime(100);

    expect(runtime.bootstrapStatus).toBe('mounted');
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
  });

  it('recupera chegada tardia posterior à janela de retries', async () => {
    const { boot } = await import('../lifecycle');
    const runtime = boot();

    advanceTimersByTime(2_000);
    expect(runtime.bootstrapStatus).toBe('mount-failed');

    document.body.innerHTML = zeevMarkup('T02 - Validar o cadastro');
    await flushMutationObserver();
    advanceTimersByTime(100);

    expect(runtime.bootstrapStatus).toBe('mounted');
    expect(runtime.currentTask?.code).toBe('T2');
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
  });

  it('repara o mount após substituição de ContainerForm', async () => {
    renderZeevDom('T02 - Validar o cadastro');
    const { boot } = await import('../lifecycle');
    const runtime = boot();
    const oldContainer = document.querySelector('#ContainerForm');

    oldContainer?.insertAdjacentHTML(
      'afterend',
      '<div id="ContainerForm"><form id="FrmExecute"></form></div>',
    );
    oldContainer?.remove();
    await flushMutationObserver();
    advanceTimersByTime(100);

    expect(runtime.bootstrapStatus).toBe('mounted');
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
    expect(document.querySelector('#zeev-fieb-root')?.nextElementSibling?.id).toBe(
      'ContainerForm',
    );
  });

  it('continua observando após substituição completa do body', async () => {
    renderZeevDom('T01 - Fazer o cadastro');
    const { boot } = await import('../lifecycle');
    const runtime = boot();
    const replacement = document.createElement('body');
    replacement.innerHTML = zeevMarkup('T03 - Corrigir o cadastro');

    document.documentElement.replaceChild(replacement, document.body);
    await flushMutationObserver();
    advanceTimersByTime(100);

    expect(runtime.bootstrapStatus).toBe('mounted');
    expect(runtime.currentTask?.code).toBe('T3');
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
  });

  it('sincroniza imediatamente ao restaurar o documento por pageshow', async () => {
    renderZeevDom('T01 - Fazer o cadastro');
    const { boot } = await import('../lifecycle');
    const runtime = boot();
    document.querySelector('#zeev-fieb-root')?.remove();

    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));

    expect(runtime.bootstrapStatus).toBe('mounted');
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
  });
});
