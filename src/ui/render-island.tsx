import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';

import type { ZeevFiebRuntime } from '../zeev/types';
import { App } from './App';

const ISLAND_MARKER = '[data-zeev-fieb-island="true"]';
const rootRegistry = new WeakMap<HTMLElement, Root>();

export function unmountIsland(runtime: ZeevFiebRuntime): void {
  const associatedMount = runtime.reactMountElement ?? runtime.mountElement;
  const root =
    runtime.reactRoot ??
    (associatedMount ? rootRegistry.get(associatedMount) ?? null : null);

  if (root) {
    const connectedContentNode = runtime.reactContentNodes.find(
      (node: Node): boolean => node.parentNode instanceof HTMLElement,
    );
    const ownedContainer =
      (connectedContentNode?.parentNode as HTMLElement | null) ??
      runtime.mountElement ??
      runtime.reactMountElement;

    if (ownedContainer) {
      runtime.reactContentNodes.forEach((node: Node): void => {
        if (node.parentNode !== ownedContainer) {
          ownedContainer.append(node);
        }
      });
    }

    try {
      root.unmount();
    } catch (error: unknown) {
      console.warn('[Zeev FIEB v0.4.0-rc.2] React root unmount failed', error);
    }

    if (associatedMount) {
      rootRegistry.delete(associatedMount);
    }
    if (ownedContainer) {
      rootRegistry.delete(ownedContainer);
    }
  }

  runtime.reactRoot = null;
  runtime.reactMountElement = null;
  runtime.reactContentNodes = [];
}

export function renderIsland(
  runtime: ZeevFiebRuntime,
  shouldRender: boolean,
): void {
  const mountElement = runtime.mountElement;

  if (!mountElement?.isConnected) {
    unmountIsland(runtime);
    return;
  }

  const associationInvalid =
    (runtime.reactRoot !== null &&
      (runtime.reactMountElement !== mountElement ||
        !mountElement.querySelector(ISLAND_MARKER))) ||
    (runtime.reactRoot === null && rootRegistry.has(mountElement));

  if (runtime.reactRoot === null && rootRegistry.has(mountElement)) {
    runtime.reactRoot = rootRegistry.get(mountElement) ?? null;
    runtime.reactMountElement = mountElement;
  }

  if (associationInvalid) {
    unmountIsland(runtime);
  }

  if (!runtime.reactRoot) {
    mountElement.replaceChildren();
    runtime.reactRoot = createRoot(mountElement);
    runtime.reactMountElement = mountElement;
    rootRegistry.set(mountElement, runtime.reactRoot);
    shouldRender = true;
  }

  if (!shouldRender) {
    return;
  }

  flushSync((): void => {
    runtime.reactRoot?.render(
      <App
        taskContext={runtime.currentTask}
        visitedStages={runtime.visitedStages}
        environment="homologacao"
        version={runtime.version}
      />,
    );
  });
  runtime.reactContentNodes = Array.from(mountElement.childNodes);
}
