import { zeevAdapter } from './adapter';
import { runDiagnostics } from './diagnostics';
import { ZEEV_SELECTORS } from './selectors';
import {
  enhanceNativeExperience,
  resetNativeEnhancements,
} from './native-enhancements';
import { reconcileVisualHistory } from './visual-history';
import { renderIsland, unmountIsland } from '../ui/render-island';
import type {
  LifecycleReason,
  ProcessExecutionIdentity,
  ProcessStepContext,
  ViewSignature,
  ZeevFiebRuntime,
} from './types';

const VERSION = '0.4.0-rc.3';
const LOG_PREFIX = `[Zeev FIEB v${VERSION}]`;
const MOUNT_ID = 'zeev-fieb-root';
const SYNC_DEBOUNCE_MS = 100;
const BOOTSTRAP_RETRY_DELAYS_MS = [100, 250, 500, 1_000, 2_000] as const;

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
    executionIdentity: null,
    visitedStages: [],
    viewSignature: null,
    syncCount: 0,
    lastSyncDuration: 0,
    syncTimer: null,
    pendingReason: null,
    popstateHandler: null,
    hashchangeHandler: null,
    domReadyHandler: null,
    pageshowHandler: null,
    retryTimers: [],
    bootstrapStatus: 'waiting-document',
    diagnostics: runDiagnostics,
  };
}

function getOrCreateRuntime(): ZeevFiebRuntime {
  const runtime = window.__ZEEV_FIEB__ ?? createRuntime();
  if (!isProcessExecutionIdentity(runtime.executionIdentity)) {
    runtime.executionIdentity = null;
  }
  if (!Array.isArray(runtime.visitedStages)) {
    runtime.visitedStages = [];
  }
  if (!Array.isArray(runtime.retryTimers)) {
    runtime.retryTimers = [];
  }
  if (
    ![
      'waiting-document',
      'waiting-container',
      'mounted',
      'mount-failed',
    ].includes(runtime.bootstrapStatus)
  ) {
    runtime.bootstrapStatus = 'waiting-document';
  }
  runtime.pageshowHandler ??= null;
  runtime.diagnostics = runDiagnostics;
  window.__ZEEV_FIEB__ = runtime;
  return runtime;
}

function isProcessExecutionIdentity(
  value: unknown,
): value is ProcessExecutionIdentity {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<ProcessExecutionIdentity>;
  return (
    (typeof candidate.uid === 'string' || candidate.uid === null) &&
    (typeof candidate.flowExecute === 'string' ||
      candidate.flowExecute === null)
  );
}

function cancelBootstrapRetries(runtime: ZeevFiebRuntime): void {
  runtime.retryTimers.forEach((timer: number): void => {
    window.clearTimeout(timer);
  });
  runtime.retryTimers = [];
}

function scheduleBootstrapRetries(runtime: ZeevFiebRuntime): void {
  cancelBootstrapRetries(runtime);
  const timers: number[] = [];
  BOOTSTRAP_RETRY_DELAYS_MS.forEach((delay: number, index: number): void => {
    const timer = window.setTimeout((): void => {
      runtime.retryTimers = runtime.retryTimers.filter(
        (candidate: number): boolean => candidate !== timer,
      );
      const synced = sync('retry');
      const isLast = index === BOOTSTRAP_RETRY_DELAYS_MS.length - 1;
      if (isLast && synced.bootstrapStatus !== 'mounted') {
        synced.bootstrapStatus = document.body
          ? 'mount-failed'
          : 'waiting-document';
      }
    }, delay);
    timers.push(timer);
  });
  runtime.retryTimers = timers;
}

function initialize(runtime: ZeevFiebRuntime): void {
  if (runtime.initialized) {
    return;
  }

  if (!document.documentElement) {
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
  runtime.observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  runtime.popstateHandler = () => scheduleSync('popstate');
  runtime.hashchangeHandler = () => scheduleSync('hashchange');
  runtime.pageshowHandler = () => {
    scheduleBootstrapRetries(runtime);
    sync('pageshow');
  };
  window.addEventListener('popstate', runtime.popstateHandler);
  window.addEventListener('hashchange', runtime.hashchangeHandler);
  window.addEventListener('pageshow', runtime.pageshowHandler);

  if (document.readyState === 'loading' && !runtime.domReadyHandler) {
    runtime.domReadyHandler = () => {
      runtime.domReadyHandler = null;
      sync('domcontentloaded');
    };
    document.addEventListener('DOMContentLoaded', runtime.domReadyHandler, {
      once: true,
    });
  }

  runtime.initialized = true;
  runtime.bootstrapStatus = document.body
    ? 'waiting-container'
    : 'waiting-document';
  scheduleBootstrapRetries(runtime);
  sync('boot');
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

function hiddenInputValue(id: string): string | null {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLInputElement)) {
    return null;
  }

  return element.value.trim() || null;
}

function readExecutionIdentity(): ProcessExecutionIdentity | null {
  if (!zeevAdapter.getRoot()) {
    return null;
  }

  return {
    uid: hiddenInputValue('inpCodFlowExecuteUID'),
    flowExecute: hiddenInputValue('inpCodFlowExecute'),
  };
}

function createViewSignature(): ViewSignature {
  const search = window.location.search;
  return {
    title: zeevAdapter.getCurrentTaskTitle(),
    pathname: window.location.pathname,
    search,
    observedExecutionIdentity: readExecutionIdentity(),
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
    previous.observedExecutionIdentity?.uid ===
      current.observedExecutionIdentity?.uid &&
    previous.observedExecutionIdentity?.flowExecute ===
      current.observedExecutionIdentity?.flowExecute &&
    previous.root === current.root
  );
}

function updateVisitedStages(
  runtime: ZeevFiebRuntime,
  current: ViewSignature,
): void {
  const history = reconcileVisualHistory(
    {
      identity: runtime.executionIdentity,
      visitedStages: runtime.visitedStages,
    },
    current.observedExecutionIdentity,
    runtime.currentTask?.code ?? null,
  );
  runtime.executionIdentity = history.identity;
  runtime.visitedStages = history.visitedStages;
}

function stepCode(step: ProcessStepContext | null): string {
  return step?.code ?? 'unknown';
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
  if (nextMountElement) {
    runtime.bootstrapStatus = 'mounted';
    cancelBootstrapRetries(runtime);
  } else if (!document.body) {
    runtime.bootstrapStatus = 'waiting-document';
  } else if (reason !== 'retry' || runtime.bootstrapStatus !== 'mount-failed') {
    runtime.bootstrapStatus = 'waiting-container';
  }
  runtime.currentTask = zeevAdapter.getCurrentTask();
  runtime.viewSignature = createViewSignature();
  updateVisitedStages(runtime, runtime.viewSignature);
  enhanceNativeExperience(runtime.currentTask?.code ?? null);
  runtime.syncCount += 1;

  const viewChanged = !isSameView(previousSignature, runtime.viewSignature);

  if (viewChanged && runtime.currentTask?.code) {
    console.info(`${LOG_PREFIX} step detected: ${runtime.currentTask.code}`);
  } else if (viewChanged && runtime.currentTask) {
    console.warn(`${LOG_PREFIX} step not recognized: ${runtime.currentTask.title}`);
  }

  if (previousSignature && viewChanged) {
    console.info(
      `${LOG_PREFIX} view changed: ${stepCode(previousTask)} -> ${stepCode(runtime.currentTask)}`,
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
    cancelBootstrapRetries(runtime);
    unmountIsland(runtime);
    resetNativeEnhancements();

    if (runtime.popstateHandler) {
      window.removeEventListener('popstate', runtime.popstateHandler);
    }
    if (runtime.hashchangeHandler) {
      window.removeEventListener('hashchange', runtime.hashchangeHandler);
    }
    if (runtime.pageshowHandler) {
      window.removeEventListener('pageshow', runtime.pageshowHandler);
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
    runtime.executionIdentity = null;
    runtime.visitedStages = [];
    runtime.viewSignature = null;
    runtime.syncTimer = null;
    runtime.pendingReason = null;
    runtime.popstateHandler = null;
    runtime.hashchangeHandler = null;
    runtime.domReadyHandler = null;
    runtime.pageshowHandler = null;
    runtime.retryTimers = [];
    runtime.bootstrapStatus = 'waiting-document';
  }

  document
    .querySelectorAll<HTMLElement>(`#${MOUNT_ID}`)
    .forEach((element) => element.remove());
  delete window.__ZEEV_FIEB__;
}
