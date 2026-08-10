// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function zeevMarkup(title = 'Solicitar registro'): string {
  return `
    <div id="containerRequest">
      <div class="page-title"><h1>${title}</h1></div>
      <section class="main-col">
        <div id="ContainerForm"><form id="FrmExecute"></form></div>
      </section>
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

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '';
  window.history.replaceState(null, '', '/processo?instance=1');
  delete window.__ZEEV_FIEB__;
});

afterEach(async () => {
  const { teardown } = await import('../lifecycle');
  teardown();
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
    vi.advanceTimersByTime(100);
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
  });

  it('inicializa uma vez e cria um único mount point sem React root', async () => {
    renderZeevDom();
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const { boot } = await import('../lifecycle');

    const firstRuntime = boot();
    const observer = firstRuntime.observer;
    const secondRuntime = boot();
    vi.advanceTimersByTime(100);

    expect(secondRuntime).toBe(firstRuntime);
    expect(secondRuntime.observer).toBe(observer);
    expect(secondRuntime.initialized).toBe(true);
    expect(secondRuntime.reactRoot).toBeNull();
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

  it('mantém um mount point após múltiplos syncs manuais', async () => {
    renderZeevDom();
    const { sync } = await import('../lifecycle');

    sync('manual');
    sync('manual');
    const runtime = sync('manual');

    expect(runtime.syncCount).toBe(3);
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
  });

  it('elimina mount points duplicados e mantém o elemento na posição correta', async () => {
    renderZeevDom();
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<div id="zeev-fieb-root"></div><div id="zeev-fieb-root"></div>',
    );
    const { sync } = await import('../lifecycle');

    const runtime = sync('manual');

    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
    expect(runtime.mountElement?.nextElementSibling?.id).toBe('ContainerForm');
  });

  it('atualiza a tarefa quando somente o título muda', async () => {
    renderZeevDom();
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const { sync } = await import('../lifecycle');

    sync('manual');
    const title = document.querySelector('.page-title h1');
    if (title) title.textContent = 'T01 - Fazer o cadastro';
    const runtime = sync('manual');

    expect(runtime.currentTask?.code).toBe('T1');
    expect(runtime.viewSignature?.title).toBe('T01 - Fazer o cadastro');
    expect(infoSpy).toHaveBeenCalledWith(
      '[Zeev FIEB v0.3.0] view changed: T0 -> T1',
    );
  });

  it('detecta a substituição completa de containerRequest', async () => {
    renderZeevDom();
    const { sync } = await import('../lifecycle');

    const initialRuntime = sync('manual');
    const initialRoot = initialRuntime.viewSignature?.root;
    const initialMount = initialRuntime.mountElement;
    document.querySelector('#containerRequest')?.remove();
    document.body.insertAdjacentHTML(
      'beforeend',
      zeevMarkup('T01 - Fazer o cadastro'),
    );
    const updatedRuntime = sync('manual');

    expect(updatedRuntime.viewSignature?.root).not.toBe(initialRoot);
    expect(updatedRuntime.mountElement).not.toBe(initialMount);
    expect(initialMount?.isConnected).toBe(false);
    expect(document.querySelectorAll('#zeev-fieb-root')).toHaveLength(1);
    expect(updatedRuntime.currentTask?.code).toBe('T1');
  });

  it('sincroniza mutações estruturais após debounce de 100 ms', async () => {
    renderZeevDom();
    const { boot } = await import('../lifecycle');

    const runtime = boot();
    vi.advanceTimersByTime(100);
    await flushMutationObserver();
    vi.runOnlyPendingTimers();
    const countBeforeMutation = runtime.syncCount;

    const title = document.querySelector('.page-title h1');
    if (title) title.textContent = 'T02 - Validar o cadastro';
    await flushMutationObserver();

    vi.advanceTimersByTime(99);
    expect(runtime.syncCount).toBe(countBeforeMutation);
    vi.advanceTimersByTime(1);
    expect(runtime.syncCount).toBe(countBeforeMutation + 1);
    expect(runtime.currentTask?.code).toBe('T2');
  });

  it('responde a popstate e hashchange pelo mesmo debounce', async () => {
    renderZeevDom();
    const { boot } = await import('../lifecycle');

    const runtime = boot();
    vi.advanceTimersByTime(100);
    const initialCount = runtime.syncCount;

    window.dispatchEvent(new PopStateEvent('popstate'));
    vi.advanceTimersByTime(100);
    expect(runtime.syncCount).toBe(initialCount + 1);

    window.dispatchEvent(new HashChangeEvent('hashchange'));
    vi.advanceTimersByTime(100);
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
    vi.advanceTimersByTime(100);

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
    vi.advanceTimersByTime(100);
    const observer = runtime.observer;
    const disconnectSpy = observer
      ? vi.spyOn(observer, 'disconnect')
      : undefined;

    teardown();

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
    expect(document.querySelector('#zeev-fieb-root')).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});
