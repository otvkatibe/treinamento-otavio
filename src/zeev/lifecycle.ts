import { zeevAdapter } from './adapter';
import { runDiagnostics } from './diagnostics';
import { ZEEV_SELECTORS } from './selectors';
import { renderIsland, unmountIsland } from '../ui/render-island';
import type {
  LifecycleReason,
  TaskContext,
  ViewSignature,
  ZeevFiebRuntime,
} from './types';

const VERSION = '0.3.0';
const LOG_PREFIX = `[Zeev FIEB v${VERSION}]`;
const MOUNT_ID = 'zeev-fieb-root';
const SYNC_DEBOUNCE_MS = 100;

function createRuntime(): ZeevFiebRuntime {
  return {
    version: VERSION,
    initialized: false,
    observer: null,
    reactRoot: null,
    reactMountElement: null,
    reactContentNodes: [],
    mountElement: null,
    currentTask: null,
    viewSignature: null,
    syncCount: 0,
    lastSyncDuration: 0,
    syncTimer: null,
    pendingReason: null,
    popstateHandler: null,
    hashchangeHandler: null,
    domReadyHandler: null,
    diagnostics: runDiagnostics,
  };
}

function getOrCreateRuntime(): ZeevFiebRuntime {
  const runtime = window.__ZEEV_FIEB__ ?? createRuntime();
  runtime.diagnostics = runDiagnostics;
  window.__ZEEV_FIEB__ = runtime;
  return runtime;
}

function initialize(runtime: ZeevFiebRuntime): void {
  if (runtime.initialized) {
    return;
  }

  if (!document.body) {
    if (!runtime.domReadyHandler) {
      runtime.domReadyHandler = () => {
        runtime.domReadyHandler = null;
        initialize(runtime);
      };
      document.addEventListener('DOMContentLoaded', runtime.domReadyHandler, {
        once: true,
      });
    }
    return;
  }

  runtime.observer = new MutationObserver(() => scheduleSync('mutation'));
  runtime.observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  runtime.popstateHandler = () => scheduleSync('popstate');
  runtime.hashchangeHandler = () => scheduleSync('hashchange');
  window.addEventListener('popstate', runtime.popstateHandler);
  window.addEventListener('hashchange', runtime.hashchangeHandler);

  runtime.initialized = true;
  scheduleSync('boot');
}

function ensureMountPoint(): HTMLElement | null {
  const root = zeevAdapter.getRoot();
  const containerForm = root?.querySelector<HTMLElement>(
    ZEEV_SELECTORS.containerForm,
  );
  const existingMounts = Array.from(
    document.querySelectorAll<HTMLElement>(`#${MOUNT_ID}`),
  );

  if (!containerForm?.parentElement) {
    existingMounts.slice(1).forEach((element) => element.remove());
    return existingMounts[0] ?? null;
  }

  const parent = containerForm.parentElement;
  const mountElement =
    existingMounts.find((element) => element.parentElement === parent) ??
    existingMounts[0] ??
    document.createElement('div');

  mountElement.id = MOUNT_ID;
  if (
    mountElement.parentElement !== parent ||
    mountElement.nextElementSibling !== containerForm
  ) {
    parent.insertBefore(mountElement, containerForm);
  }

  existingMounts
    .filter((element) => element !== mountElement)
    .forEach((element) => element.remove());

  return mountElement;
}

function createViewSignature(): ViewSignature {
  return {
    title: zeevAdapter.getCurrentTaskTitle(),
    pathname: window.location.pathname,
    search: window.location.search,
    root: zeevAdapter.getRoot(),
  };
}

function isSameView(
  previous: ViewSignature | null,
  current: ViewSignature,
): boolean {
  return (
    previous !== null &&
    previous.title === current.title &&
    previous.pathname === current.pathname &&
    previous.search === current.search &&
    previous.root === current.root
  );
}

function taskCode(task: TaskContext | null): string {
  return task?.code ?? 'unknown';
}

export function boot(): ZeevFiebRuntime {
  const runtime = getOrCreateRuntime();

  if (runtime.initialized || runtime.domReadyHandler) {
    return runtime;
  }

  console.info(`${LOG_PREFIX} boot`);
  initialize(runtime);
  return runtime;
}

export function scheduleSync(reason: LifecycleReason): void {
  const runtime = window.__ZEEV_FIEB__;

  if (!runtime) {
    return;
  }

  if (runtime.syncTimer !== null) {
    window.clearTimeout(runtime.syncTimer);
  }

  runtime.pendingReason = reason;
  runtime.syncTimer = window.setTimeout(() => {
    runtime.syncTimer = null;
    const pendingReason = runtime.pendingReason ?? reason;
    runtime.pendingReason = null;
    sync(pendingReason);
  }, SYNC_DEBOUNCE_MS);
}

export function sync(reason: LifecycleReason = 'manual'): ZeevFiebRuntime {
  const runtime = getOrCreateRuntime();
  const startedAt = performance.now();
  const previousSignature = runtime.viewSignature;
  const previousTask = runtime.currentTask;
  const previousMountElement = runtime.mountElement;

  console.info(`${LOG_PREFIX} sync`, reason);

  const nextMountElement = ensureMountPoint();
  const mountChanged = previousMountElement !== nextMountElement;

  if (mountChanged && (runtime.reactRoot || runtime.reactMountElement)) {
    unmountIsland(runtime);
  }

  runtime.mountElement = nextMountElement;
  runtime.currentTask = zeevAdapter.getCurrentTask();
  runtime.viewSignature = createViewSignature();
  runtime.syncCount += 1;

  const viewChanged = !isSameView(previousSignature, runtime.viewSignature);

  if (viewChanged && runtime.currentTask?.code) {
    console.info(`${LOG_PREFIX} task detected: ${runtime.currentTask.code}`);
  } else if (viewChanged && runtime.currentTask) {
    console.warn(`${LOG_PREFIX} task not recognized: ${runtime.currentTask.title}`);
  }

  if (previousSignature && viewChanged) {
    console.info(
      `${LOG_PREFIX} view changed: ${taskCode(previousTask)} -> ${taskCode(runtime.currentTask)}`,
    );
  }

  renderIsland(runtime, viewChanged || mountChanged);

  runtime.lastSyncDuration = performance.now() - startedAt;
  return runtime;
}

export function teardown(): void {
  const runtime = window.__ZEEV_FIEB__;

  if (runtime) {
    if (runtime.syncTimer !== null) {
      window.clearTimeout(runtime.syncTimer);
    }
    runtime.observer?.disconnect();
    unmountIsland(runtime);

    if (runtime.popstateHandler) {
      window.removeEventListener('popstate', runtime.popstateHandler);
    }
    if (runtime.hashchangeHandler) {
      window.removeEventListener('hashchange', runtime.hashchangeHandler);
    }
    if (runtime.domReadyHandler) {
      document.removeEventListener('DOMContentLoaded', runtime.domReadyHandler);
    }

    runtime.initialized = false;
    runtime.observer = null;
    runtime.reactRoot = null;
    runtime.reactMountElement = null;
    runtime.reactContentNodes = [];
    runtime.mountElement = null;
    runtime.currentTask = null;
    runtime.viewSignature = null;
    runtime.syncTimer = null;
    runtime.pendingReason = null;
    runtime.popstateHandler = null;
    runtime.hashchangeHandler = null;
    runtime.domReadyHandler = null;
  }

  document
    .querySelectorAll<HTMLElement>(`#${MOUNT_ID}`)
    .forEach((element) => element.remove());
  delete window.__ZEEV_FIEB__;
}
