// @vitest-environment jsdom

import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  LifecycleReason,
  ZeevFiebRuntime,
} from '../types';

function zeevMarkup(title = 'Solicitar registro'): string {
  return `
    <div id="containerRequest">
      <div class="page-title"><h1>${title}</h1></div>
      <section class="main-col">
        <div id="ContainerForm"><form id="FrmExecute"></form></div>
      </section>
      <div id="controllers">
        <div id="buttons"><button id="BtnSend">Enviar</button></div>
      </div>
    </div>
  `;
}

function renderZeevDom(title = 'Solicitar registro'): void {
  document.body.innerHTML = zeevMarkup(title);
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
  document.body.innerHTML = '';
  window.history.replaceState(null, '', '/processo?instance=1');
  delete window.__ZEEV_FIEB__;
});

afterEach(async () => {
  const { teardown } = await import('../lifecycle');
  act((): void => teardown());
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

    const hydratedRuntime = boot();

    expect(hydratedRuntime).toBe(runtime);
    expect(window.__ZEEV_FIEB__).toBe(runtime);
    expect(typeof hydratedRuntime.diagnostics).toBe('function');
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

  it('atualiza a tarefa quando somente o título muda', async () => {
    renderZeevDom();
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const { sync } = await import('../lifecycle');

    const initialRuntime = syncWithAct(sync);
    const title = document.querySelector('.page-title h1');
    if (title) title.textContent = 'T01 - Fazer o cadastro';
    const runtime = syncWithAct(sync);

    expect(runtime).toBe(initialRuntime);
    expect(typeof runtime.diagnostics).toBe('function');
    expect(runtime.currentTask?.code).toBe('T1');
    expect(runtime.diagnostics().task.code).toBe('T1');
    expect(runtime.viewSignature?.title).toBe('T01 - Fazer o cadastro');
    expect(infoSpy).toHaveBeenCalledWith(
      '[Zeev FIEB v0.3.0] view changed: T0 -> T1',
    );
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
    expect(runtime.initialized).toBe(false);
    expect(runtime.domReadyHandler).not.toBeNull();

    const body = document.createElement('body');
    body.innerHTML = zeevMarkup();
    document.documentElement.append(body);
    document.dispatchEvent(new Event('DOMContentLoaded'));
    advanceTimersByTime(100);

    expect(runtime.initialized).toBe(true);
    expect(runtime.domReadyHandler).toBeNull();
    expect(runtime.observer).not.toBeNull();
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
});
