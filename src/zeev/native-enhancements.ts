import { observeNativeAction } from './adapter';
import { STAGE_CONTRACTS } from './domain-contracts';
import { resolveFieldObservation } from './field-resolver';
import { resolveNativeStageControls } from './native-controls';
import { ZEEV_SELECTORS } from './selectors';
import type { StageCode, StageContract, ZeevFieldName } from './types';

const ENHANCED_ATTRIBUTE = 'data-zeev-fieb-enhanced';
const ENHANCED_VALUE = 'native';
const OWNED_CLASSES_ATTRIBUTE = 'data-zeev-fieb-classes';

const START_CLASSES = {
  fieldGrid: ['grid', 'w-full', 'grid-cols-12', 'gap-x-5', 'gap-y-4'],
  fieldRow12: ['col-span-12', 'block', 'min-w-0', 'border-0', 'p-0'],
  fieldRow6: [
    'col-span-6',
    'max-md:col-span-12',
    'block',
    'min-w-0',
    'border-0',
    'p-0',
  ],
  fieldLabel: [
    'mb-1.5',
    'block',
    'w-full',
    'min-w-0',
    'p-0',
    'text-[0.8125rem]',
    'font-bold',
    'leading-snug',
    'text-slate-700',
  ],
  fieldShell: ['block', 'w-full', 'min-w-0', 'box-border', 'p-0'],
  input: [
    'h-[42px]',
    'w-full',
    'rounded-[0.625rem]',
    'border',
    'border-slate-300',
    'bg-white',
    'px-3',
    'py-2',
    'text-sm',
    'text-slate-800',
    'shadow-xs',
    'transition-colors',
    'duration-150',
    'focus-visible:border-blue-700',
    'focus-visible:outline-2',
    'focus-visible:outline-offset-1',
    'focus-visible:outline-blue-700',
  ],
  radioGrid: [
    'grid',
    'grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))]',
    'gap-2.5',
    'max-[390px]:grid-cols-1',
  ],
  radioChoice: [
    'm-0',
    'flex',
    'min-h-11',
    'w-full',
    'items-center',
    'gap-2',
    'whitespace-normal',
    'rounded-[0.625rem]',
    'border',
    'border-slate-300',
    'bg-white',
    'px-3',
    'py-2.5',
    'transition-colors',
    'duration-150',
    'hover:border-blue-300',
    'hover:bg-blue-50',
    'has-[:checked]:border-blue-700',
    'has-[:checked]:bg-blue-50',
    'has-[:focus-visible]:ring-2',
    'has-[:focus-visible]:ring-blue-300',
    'has-[:focus-visible]:ring-offset-1',
  ],
  sidebar: [
    'box-border',
    'w-[min(13rem,100%)]',
    'p-2',
    'border-r',
    'border-slate-200',
    'bg-slate-50',
    'max-lg:w-[min(10.5rem,100%)]',
    'max-md:w-full',
    'max-md:border-r-0',
    'max-md:border-b',
    'max-md:p-1.5',
  ],
  sidebarItem: [
    'my-0.5',
    'flex',
    'min-h-10',
    'items-center',
    'gap-2.5',
    'rounded-lg',
    'px-2.5',
    'py-2',
    'text-[0.8125rem]',
    'font-semibold',
    'text-slate-600',
    'no-underline',
    'transition-colors',
    'duration-150',
    'hover:bg-blue-50',
    'hover:text-blue-900',
  ],
  sidebarActive: ['bg-blue-50', 'text-blue-900'],
  badge: [
    'ml-auto',
    'min-w-5',
    'rounded-full',
    'bg-slate-200',
    'px-1.5',
    'py-0.5',
    'text-center',
    'text-[0.6875rem]',
    'leading-4',
    'text-slate-600',
  ],
  testBar: [
    'grid',
    'min-h-[3.25rem]',
    'grid-cols-[auto_minmax(0,1fr)]',
    'items-center',
    'gap-x-4',
    'gap-y-3',
    'border',
    'border-blue-900',
    'bg-blue-900',
    'px-4',
    'py-2',
    'text-white',
    'max-[390px]:grid-cols-1',
  ],
  reload: [
    'row-span-2',
    'min-h-9',
    'rounded-lg',
    'border',
    'border-white/50',
    'bg-white/10',
    'px-3',
    'py-1.5',
    'text-[0.8125rem]',
    'font-bold',
    'text-white',
    'transition-colors',
    'hover:bg-white/20',
    'focus-visible:outline-2',
    'focus-visible:outline-offset-2',
    'focus-visible:outline-white',
    'max-[390px]:row-auto',
  ],
  testMessage: [
    'col-start-2',
    'm-0',
    'self-start',
    'text-xs',
    'leading-snug',
    'text-white/85',
    'max-[390px]:col-start-1',
  ],
  communication: [
    'mt-4',
    'grid',
    'grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)]',
    'gap-4',
    'max-md:grid-cols-1',
  ],
  communicationCard: [
    'm-0',
    'min-w-0',
    'box-border',
    'rounded-xl',
    'border',
    'border-slate-200',
    'bg-white',
    'p-4',
    'shadow-sm',
  ],
  actionArea: [
    'relative',
    'col-start-1',
    'bottom-auto',
    'm-0',
    'border-x-0',
    'border-b-0',
    'border-t',
    'border-slate-200',
    'bg-white',
    'rounded-b-[0.875rem]',
    'px-5',
    'py-4',
    'shadow-none',
    'backdrop-blur-none',
  ],
  sendAction: [
    'min-h-11',
    'rounded-[0.625rem]',
    'border-blue-900',
    'bg-blue-700',
    'px-6',
    'font-bold',
    'text-white',
    'shadow-md',
    'transition-colors',
    'hover:bg-blue-900',
    'focus-visible:outline-2',
    'focus-visible:outline-offset-2',
    'focus-visible:outline-blue-700',
    'disabled:cursor-not-allowed',
    'disabled:border-slate-200',
    'disabled:bg-slate-100',
    'disabled:text-slate-400',
    'disabled:shadow-none',
  ],
} as const;

const UPLOAD_CLASSES = {
  modal: ['overflow-hidden', 'rounded-2xl', 'border', 'border-slate-200', 'bg-white', 'shadow-2xl'],
  header: ['flex', 'items-center', 'justify-between', 'border-b', 'border-slate-200', 'px-5', 'py-4'],
  title: ['m-0', 'text-lg', 'font-bold', 'text-slate-900'],
  body: ['space-y-4', 'p-5'],
  footer: ['flex', 'justify-end', 'gap-3', 'border-t', 'border-slate-200', 'p-4', 'max-sm:flex-col-reverse'],
  input: [
    'block',
    'w-full',
    'text-sm',
    'text-slate-600',
    'file:mr-3',
    'file:min-h-10',
    'file:rounded-lg',
    'file:border-0',
    'file:bg-blue-50',
    'file:px-4',
    'file:py-2',
    'file:font-semibold',
    'file:text-blue-900',
  ],
  dropzone: ['rounded-xl', 'border-2', 'border-dashed', 'border-blue-200', 'bg-blue-50/50', 'p-5'],
  table: ['w-full', 'border-collapse', 'overflow-hidden', 'rounded-xl', 'text-sm'],
  tableHead: ['bg-slate-50', 'px-3', 'py-2.5', 'text-left', 'text-xs', 'font-bold', 'text-slate-600'],
  tableCell: ['border-t', 'border-slate-200', 'px-3', 'py-3', 'align-middle', 'text-slate-700'],
  progress: ['overflow-hidden', 'rounded-full', 'bg-slate-200'],
  help: ['m-0', 'text-xs', 'leading-relaxed', 'text-slate-500'],
  metadata: ['grid', 'grid-cols-2', 'gap-4', 'max-sm:grid-cols-1'],
  cancel: ['min-h-10', 'rounded-lg', 'border', 'border-slate-300', 'bg-white', 'px-4', 'font-semibold', 'text-slate-700', 'hover:bg-slate-50'],
  submit: ['min-h-10', 'rounded-lg', 'border', 'border-blue-900', 'bg-blue-700', 'px-4', 'font-bold', 'text-white', 'hover:bg-blue-900'],
  close: ['rounded-lg', 'p-2', 'text-slate-500', 'hover:bg-slate-100', 'hover:text-slate-800'],
} as const;

export interface NativeEnhancementSummary {
  root: HTMLElement | null;
  fieldShells: readonly HTMLElement[];
  readonlyRenderers: readonly HTMLElement[];
  fileShells: readonly HTMLElement[];
  actionRegion: HTMLElement | null;
  actions: readonly HTMLElement[];
  hostSidebar: HTMLElement | null;
  testEnvironmentBar: HTMLElement | null;
  messageRegion: HTMLElement | null;
  attachmentRegion: HTMLElement | null;
  uploadModal: HTMLElement | null;
  uploadInput: HTMLInputElement | null;
  uploadTable: HTMLElement | null;
  uploadProgress: HTMLElement | null;
  uploadCancelAction: HTMLElement | null;
  uploadStartAction: HTMLElement | null;
}

function mark(
  element: HTMLElement,
  role: string,
  attributes: Readonly<Record<string, string>> = {},
): void {
  element.setAttribute(ENHANCED_ATTRIBUTE, ENHANCED_VALUE);
  element.setAttribute('data-zeev-fieb-role', role);
  Object.entries(attributes).forEach(([name, value]): void => {
    element.setAttribute(name, value);
  });
}

function applyTailwindClasses(
  element: HTMLElement,
  classes: readonly string[],
): void {
  const owned = new Set(
    (element.getAttribute(OWNED_CLASSES_ATTRIBUTE) ?? '')
      .split(/\s+/)
      .filter(Boolean),
  );
  classes.forEach((className): void => {
    if (element.classList.contains(className)) return;
    element.classList.add(className);
    owned.add(className);
  });
  if (owned.size > 0) {
    element.setAttribute(OWNED_CLASSES_ATTRIBUTE, Array.from(owned).join(' '));
  }
}

function decorate(
  element: HTMLElement,
  role: string,
  classes: readonly string[],
  attributes: Readonly<Record<string, string>> = {},
): void {
  mark(element, role, attributes);
  applyTailwindClasses(element, classes);
}

/** Removes only attributes owned by this module; native nodes and handlers stay intact. */
export function resetNativeEnhancements(scope: ParentNode = document): void {
  scope
    .querySelectorAll<HTMLElement>(`[${ENHANCED_ATTRIBUTE}="${ENHANCED_VALUE}"]`)
    .forEach((element: HTMLElement): void => {
      const ownedClasses = (
        element.getAttribute(OWNED_CLASSES_ATTRIBUTE) ?? ''
      )
        .split(/\s+/)
        .filter(Boolean);
      ownedClasses.forEach((className): void => {
        element.classList.remove(className);
      });
      element.removeAttribute(OWNED_CLASSES_ATTRIBUTE);
      element.removeAttribute(ENHANCED_ATTRIBUTE);
      element.removeAttribute('data-zeev-fieb-role');
      element.removeAttribute('data-zeev-fieb-field');
      element.removeAttribute('data-zeev-fieb-access');
      element.removeAttribute('data-zeev-fieb-action');
      element.removeAttribute('data-zeev-fieb-action-label');
      element.removeAttribute('data-zeev-fieb-host-label');
      element.removeAttribute('data-zeev-fieb-active');
      element.removeAttribute('data-zeev-fieb-grid-span');
    });
  const roots = scope instanceof HTMLElement && scope.matches(ZEEV_SELECTORS.root)
    ? [scope]
    : Array.from(scope.querySelectorAll<HTMLElement>(ZEEV_SELECTORS.root));
  roots.forEach((root: HTMLElement): void => {
    root.removeAttribute('data-zeev-fieb-ui');
    root.removeAttribute('data-zeev-fieb-stage');
  });
}

function normalizedText(element: HTMLElement): string {
  const raw =
    element instanceof HTMLInputElement ? element.value : element.textContent;
  return (raw ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

function navigationItemText(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll('.badge, [class*="badge"], [data-count]')
    .forEach((badge) => badge.remove());
  return normalizedText(clone);
}

function commonAncestor(elements: readonly HTMLElement[]): HTMLElement | null {
  let candidate: HTMLElement | null = elements[0] ?? null;
  while (candidate && !elements.every((element) => candidate?.contains(element))) {
    candidate = candidate.parentElement;
  }
  return candidate;
}

function enhanceStartHostChrome(): Pick<
  NativeEnhancementSummary,
  | 'hostSidebar'
  | 'testEnvironmentBar'
  | 'messageRegion'
  | 'attachmentRegion'
  | 'uploadModal'
  | 'uploadInput'
  | 'uploadTable'
  | 'uploadProgress'
  | 'uploadCancelAction'
  | 'uploadStartAction'
> {
  const controls = Array.from(
    document.querySelectorAll<HTMLElement>(
      'a, button, [role="link"], [role="button"], input[type="button"]',
    ),
  );
  const navigationLabels = ['inicio', 'formulario', 'mensagens', 'anexos'];
  const navigationItems = navigationLabels.map(
    (label) => controls.find((element) => navigationItemText(element) === label) ?? null,
  );
  const completeNavigation = navigationItems.every(
    (element): element is HTMLElement => element !== null,
  )
    ? (navigationItems as HTMLElement[])
    : [];
  const navigationCommon = commonAncestor(completeNavigation);
  const hostSidebar = navigationCommon
    ? navigationCommon.closest<HTMLElement>(
        'nav, aside, [role="navigation"], [class*="sidebar"], [class*="menu"]',
      ) ?? navigationCommon
    : null;

  if (hostSidebar && hostSidebar !== document.body) {
    decorate(hostSidebar, 'host-sidebar', START_CLASSES.sidebar);
    completeNavigation.forEach((item, index): void => {
      const active =
        item.matches('.active, [aria-current="page"]') ||
        item.closest('.active') !== null;
      decorate(item, 'host-sidebar-item', [
        ...START_CLASSES.sidebarItem,
        ...(active ? START_CLASSES.sidebarActive : []),
      ], {
        'data-zeev-fieb-host-label': navigationLabels[index] ?? '',
        'data-zeev-fieb-active': active ? 'true' : 'false',
      });
      item
        .querySelectorAll<HTMLElement>('.badge, [class*="badge"], [data-count]')
        .forEach((badge): void =>
          decorate(badge, 'host-sidebar-badge', START_CLASSES.badge),
        );
    });
  }

  const reloadAction = controls.find(
    (element) => normalizedText(element) === 'recarregar',
  ) ?? null;
  const testMessageCandidates = Array.from(
    document.querySelectorAll<HTMLElement>('p, span, strong, div'),
  ).filter((element) => {
    const text = normalizedText(element);
    return (
      text.includes('esta e uma solicitacao de teste') &&
      text.includes('todas as tarefas serao redirecionadas') &&
      text.includes('voce')
    );
  });
  const testMessage = testMessageCandidates.sort(
    (left, right) => left.children.length - right.children.length,
  )[0] ?? null;
  const testEnvironmentBar =
    reloadAction && testMessage
      ? commonAncestor([reloadAction, testMessage])
      : null;
  const safeTestEnvironmentBar =
    testEnvironmentBar &&
    testEnvironmentBar !== document.body &&
    !testEnvironmentBar.matches(ZEEV_SELECTORS.root)
      ? testEnvironmentBar
      : null;
  if (safeTestEnvironmentBar && reloadAction && testMessage) {
    decorate(
      safeTestEnvironmentBar,
      'test-environment-bar',
      START_CLASSES.testBar,
    );
    decorate(
      reloadAction,
      'test-environment-reload',
      START_CLASSES.reload,
    );
    decorate(
      testMessage,
      'test-environment-message',
      START_CLASSES.testMessage,
    );
  }

  const root = document.querySelector<HTMLElement>(ZEEV_SELECTORS.root);
  const messageRegion = root?.querySelector<HTMLElement>(ZEEV_SELECTORS.messages) ?? null;
  const attachmentRegion = root?.querySelector<HTMLElement>(ZEEV_SELECTORS.attachments) ?? null;
  if (messageRegion) {
    decorate(
      messageRegion,
      'start-messages',
      START_CLASSES.communicationCard,
    );
  }
  if (attachmentRegion) {
    decorate(
      attachmentRegion,
      'start-attachments',
      START_CLASSES.communicationCard,
    );
  }
  const communication =
    messageRegion && attachmentRegion
      ? commonAncestor([messageRegion, attachmentRegion])
      : null;
  if (
    communication &&
    communication !== root &&
    communication !== document.body
  ) {
    decorate(
      communication,
      'start-communication',
      START_CLASSES.communication,
    );
  }

  const uploadModalContract = enhanceStartUploadModal();

  return {
    hostSidebar: hostSidebar && hostSidebar !== document.body ? hostSidebar : null,
    testEnvironmentBar: safeTestEnvironmentBar,
    messageRegion,
    attachmentRegion,
    ...uploadModalContract,
  };
}

function enhanceStartUploadModal(): Pick<
  NativeEnhancementSummary,
  | 'uploadModal'
  | 'uploadInput'
  | 'uploadTable'
  | 'uploadProgress'
  | 'uploadCancelAction'
  | 'uploadStartAction'
> {
  const empty = {
    uploadModal: null,
    uploadInput: null,
    uploadTable: null,
    uploadProgress: null,
    uploadCancelAction: null,
    uploadStartAction: null,
  };
  const title = Array.from(
    document.querySelectorAll<HTMLElement>(
      '.modal-title, [role="dialog"] h1, [role="dialog"] h2, [role="dialog"] h3, .modal h1, .modal h2, .modal h3',
    ),
  ).find((element) => normalizedText(element) === 'enviar arquivos') ?? null;
  const uploadModal = title?.closest<HTMLElement>('[role="dialog"], .modal') ?? null;
  if (!title || !uploadModal) return empty;

  const uploadInput = uploadModal.querySelector<HTMLInputElement>(
    'input[type="file"]',
  );
  const uploadTemplate = document.querySelector<HTMLElement>('#template-upload');
  const downloadTemplate = document.querySelector<HTMLElement>('#template-download');
  const uploadTable = uploadModal.querySelector<HTMLElement>(
    'table.files, table[data-role="presentation"], table',
  );
  if (!uploadInput || !uploadTemplate || !downloadTemplate || !uploadTable) {
    return empty;
  }

  decorate(uploadModal, 'start-upload-modal', UPLOAD_CLASSES.modal);
  const header = title.closest<HTMLElement>('.modal-header') ?? title.parentElement;
  if (header) decorate(header, 'start-upload-header', UPLOAD_CLASSES.header);
  decorate(title, 'start-upload-title', UPLOAD_CLASSES.title);
  const body = uploadInput.closest<HTMLElement>('.modal-body') ?? uploadModal;
  if (body !== uploadModal) {
    decorate(body, 'start-upload-body', UPLOAD_CLASSES.body);
  }
  const footer = uploadModal.querySelector<HTMLElement>('.modal-footer');
  if (footer) decorate(footer, 'start-upload-footer', UPLOAD_CLASSES.footer);

  decorate(uploadInput, 'start-upload-input', UPLOAD_CLASSES.input);
  const dropzone =
    uploadInput.closest<HTMLElement>(
      '.dropzone, [class*="drop-zone"], [class*="upload-area"], .fileinput-button, label',
    ) ?? uploadInput.parentElement;
  if (dropzone && dropzone !== uploadModal) {
    decorate(dropzone, 'start-upload-dropzone', UPLOAD_CLASSES.dropzone);
  }
  decorate(uploadTable, 'start-upload-file-table', UPLOAD_CLASSES.table);
  uploadTable.querySelectorAll<HTMLElement>('th').forEach((cell): void => {
    decorate(cell, 'start-upload-table-head', UPLOAD_CLASSES.tableHead);
  });
  uploadTable.querySelectorAll<HTMLElement>('td').forEach((cell): void => {
    decorate(cell, 'start-upload-table-cell', UPLOAD_CLASSES.tableCell);
  });

  const progress = uploadModal.querySelector<HTMLElement>(
    '[role="progressbar"], .progress-bar, .progress',
  );
  if (progress) {
    decorate(progress, 'start-upload-progress', UPLOAD_CLASSES.progress);
  }

  const helpCandidates = Array.from(
    body.querySelectorAll<HTMLElement>('small, p, span, div'),
  ).filter((element) => {
    const text = normalizedText(element);
    return text.includes('formato') || text.includes('tamanho');
  });
  const help = helpCandidates.sort(
    (left, right) => left.children.length - right.children.length,
  )[0] ?? null;
  if (help && help !== body) {
    decorate(help, 'start-upload-help', UPLOAD_CLASSES.help);
  }

  const metadataCandidates = Array.from(
    uploadModal.querySelectorAll<HTMLElement>('label, th, span, div'),
  );
  const smallestMetadataLabel = (prefix: string): HTMLElement | null =>
    metadataCandidates
      .filter((element) => normalizedText(element).startsWith(prefix))
      .sort((left, right) => left.children.length - right.children.length)[0] ??
    null;
  const metadataLabels = [
    smallestMetadataLabel('tipo do arquivo'),
    smallestMetadataLabel('coment'),
  ].filter((element): element is HTMLElement => element !== null);
  if (metadataLabels.length === 2) {
    const metadataContainers = metadataLabels.map(
      (label) =>
        label.closest<HTMLElement>('.form-group, [class*="field"], td, div') ??
        label,
    );
    const metadataGrid = commonAncestor(metadataContainers);
    if (
      metadataGrid &&
      metadataGrid !== uploadModal &&
      !metadataGrid.matches('table, tbody')
    ) {
      decorate(
        metadataGrid,
        'start-upload-metadata-grid',
        UPLOAD_CLASSES.metadata,
      );
    }
  }

  const modalActions = Array.from(
    uploadModal.querySelectorAll<HTMLElement>(
      'button, [role="button"], input[type="button"], input[type="submit"], a',
    ),
  );
  const uploadCancelAction = modalActions.find(
    (element) => normalizedText(element) === 'cancelar',
  ) ?? null;
  const uploadStartAction = modalActions.find((element) =>
    normalizedText(element).startsWith('iniciar upload agora'),
  ) ?? null;
  if (uploadCancelAction) {
    decorate(
      uploadCancelAction,
      'start-upload-cancel',
      UPLOAD_CLASSES.cancel,
    );
  }
  if (uploadStartAction) {
    decorate(
      uploadStartAction,
      'start-upload-submit',
      UPLOAD_CLASSES.submit,
    );
  }
  const closeAction = uploadModal.querySelector<HTMLElement>(
    '[data-bs-dismiss="modal"], [data-dismiss="modal"], .btn-close, .close',
  );
  if (closeAction) {
    decorate(closeAction, 'start-upload-close', UPLOAD_CLASSES.close);
  }

  return {
    uploadModal,
    uploadInput,
    uploadTable,
    uploadProgress: progress,
    uploadCancelAction,
    uploadStartAction,
  };
}

function enhanceStartFields(fieldShells: readonly HTMLElement[]): void {
  fieldShells.forEach((shell): void => {
    const name = shell.getAttribute('data-zeev-fieb-field');
    shell.setAttribute(
      'data-zeev-fieb-grid-span',
      name === 'cpfCliente' || name === 'nacionalidade' ? '6' : '12',
    );
    decorate(shell, 'field-shell', [
      ...START_CLASSES.fieldShell,
      ...(name === 'estadoCivil' || name === 'tipoDocumento'
        ? START_CLASSES.radioGrid
        : []),
    ], {
      'data-zeev-fieb-field': name ?? '',
      'data-zeev-fieb-access': 'edit',
    });
    const row = shell.closest<HTMLElement>('tr');
    if (row) {
      decorate(
        row,
        'start-field-row',
        name === 'cpfCliente' || name === 'nacionalidade'
          ? START_CLASSES.fieldRow6
          : START_CLASSES.fieldRow12,
        { 'data-zeev-fieb-field': name ?? '' },
      );
      const labelCell = row.querySelector<HTMLElement>('td.col0');
      if (labelCell) {
        decorate(labelCell, 'start-field-label', START_CLASSES.fieldLabel, {
          'data-zeev-fieb-field': name ?? '',
        });
      }
      const grid = row.parentElement;
      if (grid?.matches('tbody')) {
        decorate(grid, 'start-field-grid', START_CLASSES.fieldGrid);
        const table = grid.closest<HTMLElement>('#FrmExecute');
        if (table) decorate(table, 'start-form-table', ['block', 'w-full']);
      }
    }
    shell
      .querySelectorAll<HTMLElement>(
        'input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), select, textarea',
      )
      .forEach((control): void => {
        applyTailwindClasses(control, START_CLASSES.input);
      });
    if (name !== 'estadoCivil' && name !== 'tipoDocumento') return;
    shell.querySelectorAll<HTMLElement>('.form-check').forEach((choice): void => {
      decorate(choice, 'radio-choice-card', START_CLASSES.radioChoice, {
        'data-zeev-fieb-field': name,
        'data-zeev-fieb-access': 'edit',
      });
    });
  });
}

function enhanceFields(
  stage: StageContract,
): Pick<
  NativeEnhancementSummary,
  'fieldShells' | 'readonlyRenderers' | 'fileShells'
> {
  const fieldShells = new Set<HTMLElement>();
  const readonlyRenderers = new Set<HTMLElement>();
  const fileShells = new Set<HTMLElement>();

  (Object.keys(stage.fields) as ZeevFieldName[]).forEach(
    (name: ZeevFieldName): void => {
      const rule = stage.fields[name];
      if (rule.access === 'hidden') return;

      const observation = resolveFieldObservation(name, rule.access);
      const shell = observation.logicalWrapper;
      if (shell) {
        const role =
          observation.uploadButton ||
          observation.downloadButtons.length > 0 ||
          observation.viewerElements.length > 0
            ? 'file-shell'
            : 'field-shell';
        mark(shell, role, {
          'data-zeev-fieb-field': name,
          'data-zeev-fieb-access': rule.access,
        });
        fieldShells.add(shell);
        if (role === 'file-shell') fileShells.add(shell);
      }

      observation.semanticControls.forEach((element): void => {
        mark(element, 'native-field', {
          'data-zeev-fieb-field': name,
          'data-zeev-fieb-access': rule.access,
        });
      });
      observation.readonlyRenderers.forEach((element): void => {
        mark(element, 'readonly-scalar-renderer', {
          'data-zeev-fieb-field': name,
          'data-zeev-fieb-access': rule.access,
        });
        readonlyRenderers.add(element);
      });
      observation.viewerElements.forEach((element): void => {
        mark(element, 'file-viewer', {
          'data-zeev-fieb-field': name,
          'data-zeev-fieb-access': rule.access,
        });
      });
      observation.downloadButtons.forEach((element): void => {
        mark(element, 'file-download', {
          'data-zeev-fieb-field': name,
          'data-zeev-fieb-access': rule.access,
        });
      });
      if (observation.uploadButton) {
        mark(observation.uploadButton, 'file-upload', {
          'data-zeev-fieb-field': name,
          'data-zeev-fieb-access': rule.access,
        });
      }
    },
  );

  return {
    fieldShells: Array.from(fieldShells),
    readonlyRenderers: Array.from(readonlyRenderers),
    fileShells: Array.from(fileShells),
  };
}

function semanticActionToken(label: string): string {
  const normalized = label.trim().toLocaleLowerCase('pt-BR');
  if (normalized.startsWith('aprovar')) return 'approve';
  if (normalized.startsWith('solicitar')) return 'correction';
  if (normalized.startsWith('reprovar')) return 'reject';
  return 'submit';
}

/**
 * Adds a presentation contract to the live Zeev DOM. Repeated calls converge
 * to the same attributes and never replace native controls.
 */
export function enhanceNativeExperience(
  stageCode: StageCode | null,
): NativeEnhancementSummary {
  const root = document.querySelector<HTMLElement>(ZEEV_SELECTORS.root);
  if (!root || !stageCode) {
    resetNativeEnhancements(document);
    return {
      root,
      fieldShells: [],
      readonlyRenderers: [],
      fileShells: [],
      actionRegion: null,
      actions: [],
      hostSidebar: null,
      testEnvironmentBar: null,
      messageRegion: null,
      attachmentRegion: null,
      uploadModal: null,
      uploadInput: null,
      uploadTable: null,
      uploadProgress: null,
      uploadCancelAction: null,
      uploadStartAction: null,
    };
  }

  resetNativeEnhancements(document);
  root.setAttribute('data-zeev-fieb-ui', 'true');
  root.setAttribute('data-zeev-fieb-stage', stageCode);

  const stage = STAGE_CONTRACTS[stageCode];
  const fieldSummary = enhanceFields(stage);
  if (stageCode === 'START') enhanceStartFields(fieldSummary.fieldShells);
  const controls = resolveNativeStageControls(stage, root);
  const actionRegion = controls.region;
  const actions = controls.primaryControl
    ? [controls.primaryControl]
    : [...controls.directActions];

  if (actionRegion) {
    mark(
      actionRegion,
      stage.decisions.length > 0 ? 'decision-panel' : 'native-action-region',
    );
  }
  actions.forEach((element: HTMLElement): void => {
    const label = observeNativeAction(element).label;
    mark(element, 'native-action', {
      'data-zeev-fieb-action': semanticActionToken(label),
      'data-zeev-fieb-action-label': label,
    });
  });
  if (stageCode === 'START') {
    const controllers = actionRegion?.closest<HTMLElement>('#controllers');
    if (controllers) {
      decorate(controllers, 'start-action-area', START_CLASSES.actionArea);
    }
    actions.forEach((element): void => {
      applyTailwindClasses(element, START_CLASSES.sendAction);
    });
  }
  const startHost = stageCode === 'START'
    ? enhanceStartHostChrome()
    : {
        hostSidebar: null,
        testEnvironmentBar: null,
        messageRegion: null,
        attachmentRegion: null,
        uploadModal: null,
        uploadInput: null,
        uploadTable: null,
        uploadProgress: null,
        uploadCancelAction: null,
        uploadStartAction: null,
      };

  return {
    root,
    ...fieldSummary,
    actionRegion,
    actions,
    ...startHost,
  };
}
