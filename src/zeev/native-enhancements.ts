import { observeNativeAction } from './adapter';
import {
  PERSONAL_FIELD_NAMES,
  REGISTRATION_FIELD_NAMES,
  STAGE_CONTRACTS,
} from './domain-contracts';
import { resolveFieldObservation } from './field-resolver';
import { resolveNativeStageControls } from './native-controls';
import { ZEEV_SELECTORS } from './selectors';
import type { StageCode, StageContract, ZeevFieldName } from './types';

const ENHANCED_ATTRIBUTE = 'data-zeev-fieb-enhanced';
const ENHANCED_VALUE = 'native';
const OWNED_CLASSES_ATTRIBUTE = 'data-zeev-fieb-classes';

const START_CLASSES = {
  formScope: ['box-border', '!w-full', '!min-w-0', '!max-w-full', '!overflow-x-clip'],
  formTable: ['!block', '!w-full', '!max-w-full', '!min-w-0', '!table-auto', 'overflow-visible'],
  structuralContents: ['!contents'],
  fieldGrid: ['!grid', '!w-full', '!max-w-full', '!min-w-0', 'grid-cols-12', 'gap-x-5', 'gap-y-4', 'overflow-visible'],
  sectionHeadingRow: ['col-span-12', '!block', '!w-full', '!max-w-full', '!min-w-0', '!border-0', '!p-0'],
  sectionHeadingCell: ['!block', '!w-full', '!max-w-full', '!min-w-0', '!p-0', '!text-left', '!align-top', '!whitespace-normal', 'text-lg', 'font-bold', 'leading-tight', 'text-slate-900'],
  fieldCell: ['!block', '!w-full', '!max-w-full', '!min-w-0', '!p-0', '!text-left', '!align-top'],
  fieldRow12: ['col-span-12', '!block', '!w-auto', '!max-w-full', '!min-w-0', '!border-0', '!p-0', '!text-left', '!align-top'],
  fieldRow6: [
    'col-span-6',
    'max-md:col-span-12',
    '!block',
    '!w-auto',
    '!max-w-full',
    '!min-w-0',
    '!border-0',
    '!p-0',
    '!text-left',
    '!align-top',
  ],
  fieldLabel: [
    'mb-1.5',
    '!block',
    '!w-full',
    '!max-w-full',
    '!min-w-0',
    '!p-0',
    '!text-left',
    '!align-top',
    'text-[0.8125rem]',
    'font-bold',
    'leading-snug',
    'text-slate-700',
  ],
  fieldShell: ['!block', '!w-full', '!max-w-full', '!min-w-0', 'box-border', '!p-0', '!text-left', '!align-top'],
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
  radioGroup: ['!flex', '!w-full', '!max-w-full', '!min-w-0', 'flex-wrap', 'items-stretch', 'gap-2.5', 'overflow-visible'],
  radioChoice: [
    '!m-0',
    '!inline-flex',
    '!flex-none',
    'basis-auto',
    '!min-h-11',
    '!w-auto',
    '!max-w-full',
    '!items-center',
    '!gap-2',
    '!whitespace-nowrap',
    '!rounded-[0.625rem]',
    '!border',
    '!border-slate-300',
    '!bg-white',
    '!px-3',
    '!py-2.5',
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
    'box-border',
    'w-full',
    'max-w-full',
    'overflow-x-clip',
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

const T1_CLASSES = {
  formScope: ['box-border', 'mt-4', '!w-full', '!max-w-full', '!min-w-0', '!overflow-x-clip', 'rounded-2xl', 'border', 'border-slate-200', 'bg-white', 'p-4', 'shadow-sm', 'md:p-6'],
  formTable: ['!block', '!w-full', '!max-w-full', '!min-w-0', '!table-auto', 'overflow-visible'],
  structuralContents: ['!contents'],
  fieldGrid: ['!grid', '!w-full', '!max-w-full', '!min-w-0', 'grid-cols-12', 'gap-x-5', 'gap-y-4', 'overflow-visible'],
  headingRow: ['col-span-12', '!block', '!w-full', '!max-w-full', '!min-w-0', '!border-0', '!p-0'],
  headingCell: ['!block', '!w-full', '!max-w-full', '!min-w-0', '!p-0', '!text-left', '!align-top', '!whitespace-normal', 'text-lg', 'font-bold', 'leading-tight', 'text-slate-900'],
  previousHeadingCell: ['mt-3', 'border-t', 'border-slate-200', 'pt-5', 'text-base', 'text-slate-700'],
  row12: ['col-span-12', '!block', '!w-auto', '!max-w-full', '!min-w-0', '!border-0', '!p-0', '!text-left', '!align-top'],
  row6: ['col-span-6', 'max-md:col-span-12', '!block', '!w-auto', '!max-w-full', '!min-w-0', '!border-0', '!p-0', '!text-left', '!align-top'],
  previousRow: ['col-span-4', 'max-lg:col-span-6', 'max-sm:col-span-12', '!block', '!w-auto', '!max-w-full', '!min-w-0', '!border-0', 'rounded-xl', 'bg-slate-50', '!p-3', '!text-left', '!align-top'],
  label: ['mb-1.5', '!block', '!w-full', '!max-w-full', '!min-w-0', '!p-0', '!text-left', '!align-top', 'text-[0.8125rem]', 'font-bold', 'leading-snug', 'text-slate-700'],
  shell: ['!block', '!w-full', '!max-w-full', '!min-w-0', 'box-border', '!p-0', '!text-left', '!align-top'],
  input: START_CLASSES.input,
  previousInput: ['h-10', 'w-full', 'max-w-full', 'min-w-0', 'rounded-lg', 'border', 'border-slate-200', 'bg-white', 'px-3', 'py-2', 'text-sm', 'text-slate-700', 'focus-visible:border-blue-700', 'focus-visible:outline-2', 'focus-visible:outline-offset-1', 'focus-visible:outline-blue-700'],
  readonlyValue: ['block', 'min-w-0', 'max-w-full', 'break-words', 'text-sm', 'font-semibold', 'leading-relaxed', 'text-slate-700'],
  uploadRow: ['col-span-12', '!block', '!w-auto', '!max-w-full', '!min-w-0', '!border-0', '!p-0'],
  uploadShell: ['!block', '!w-full', '!max-w-full', '!min-w-0', 'box-border', 'rounded-xl', 'border-2', 'border-dashed', 'border-blue-200', 'bg-blue-50/50', '!p-4', 'md:!p-5'],
  uploadInput: ['block', 'w-full', 'max-w-full', 'min-w-0', 'text-sm', 'text-slate-600', 'file:mr-3', 'file:min-h-10', 'file:rounded-lg', 'file:border-0', 'file:bg-blue-700', 'file:px-4', 'file:py-2', 'file:font-bold', 'file:text-white'],
  uploadButton: ['inline-flex', 'min-h-10', 'max-w-full', 'items-center', 'justify-center', 'gap-2', 'whitespace-normal', 'rounded-lg', 'border', 'border-blue-900', 'bg-blue-700', 'px-4', 'py-2.5', 'text-center', 'text-sm', 'font-bold', 'text-white', 'hover:bg-blue-900', 'focus-visible:outline-2', 'focus-visible:outline-offset-2', 'focus-visible:outline-blue-700'],
  fileViewer: ['inline-flex', 'max-w-full', 'min-w-0', 'items-center', 'gap-2', 'break-all', 'text-sm', 'font-semibold', 'text-blue-800', 'underline-offset-2', 'hover:underline'],
  fileAction: ['inline-flex', 'min-h-9', 'max-w-full', 'items-center', 'justify-center', 'rounded-lg', 'border', 'border-slate-300', 'bg-white', 'px-3', 'py-2', 'text-sm', 'font-semibold', 'text-slate-700', 'hover:bg-slate-50'],
  actionArea: ['mt-4', 'flex', 'w-full', 'max-w-full', 'min-w-0', 'justify-end', 'border-t', 'border-slate-200', 'pt-4'],
  actionRegion: ['flex', 'w-full', 'max-w-full', 'min-w-0', 'justify-end'],
  finishAction: ['inline-flex', 'min-h-11', 'w-auto', 'max-w-full', 'items-center', 'justify-center', 'rounded-lg', 'border', 'border-blue-900', 'bg-blue-700', 'px-6', 'py-2.5', 'text-sm', 'font-bold', 'text-white', 'shadow-sm', 'hover:bg-blue-900', 'focus-visible:outline-2', 'focus-visible:outline-offset-2', 'focus-visible:outline-blue-700', 'disabled:cursor-not-allowed', 'disabled:opacity-60', 'max-[390px]:w-full'],
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

const HUMAN_TASK_CLASSES = {
  card: ['box-border', 'w-full', 'max-w-full', 'min-w-0', 'overflow-x-clip', 'rounded-xl', 'border', 'border-slate-200', 'bg-white', 'p-4', 'shadow-sm'],
  title: ['m-0', 'mb-4', 'whitespace-nowrap', 'text-sm', 'font-bold', 'uppercase', 'tracking-[0.04em]', 'text-slate-700'],
  attachmentBody: ['!grid', 'w-full', 'max-w-full', 'min-w-0', 'grid-cols-1', 'gap-4'],
  fileAction: ['box-border', '!flex', '!w-full', '!max-w-full', '!min-w-0', 'items-center', 'justify-center', 'gap-2', '!whitespace-nowrap', 'rounded-lg', 'border', 'border-blue-900', 'bg-blue-700', 'px-3', 'py-2.5', 'text-sm', 'font-bold', 'text-white', 'hover:bg-blue-900'],
  fileInput: ['box-border', 'block', 'w-full', 'max-w-full', 'min-w-0', 'text-sm'],
  sortGroup: ['!grid', 'w-full', 'max-w-full', 'min-w-0', 'grid-cols-1', 'gap-1.5'],
  sortLabel: ['block', 'w-full', 'min-w-0', 'text-xs', 'font-bold', 'text-slate-600'],
  sortSelect: ['box-border', '!block', '!w-full', '!max-w-full', '!min-w-0', 'truncate', 'rounded-lg', 'border', 'border-slate-300', 'bg-white', 'px-3', 'py-2.5', 'text-sm', 'text-slate-700'],
  viewAll: ['box-border', '!flex', '!w-full', '!max-w-full', '!min-w-0', 'items-center', 'justify-center', 'gap-2', '!whitespace-nowrap', 'rounded-lg', 'border', 'border-slate-300', 'bg-white', 'px-3', 'py-2.5', 'text-sm', 'font-semibold', 'text-slate-700', 'hover:bg-slate-50'],
  historyList: ['grid', 'w-full', 'max-w-full', 'min-w-0', 'grid-cols-1'],
  historyItem: ['grid', 'w-full', 'max-w-full', 'min-w-0', 'grid-cols-[2.5rem_minmax(0,1fr)]', 'gap-x-3', 'gap-y-1', 'border-b', 'border-slate-200', 'py-3', 'first:pt-0', 'last:border-b-0', 'last:pb-0'],
  historyAvatar: ['row-span-3', 'flex', 'h-10', 'w-10', 'shrink-0', 'items-center', 'justify-center', 'self-start', 'overflow-hidden', 'rounded-full', 'bg-blue-50', 'text-xs', 'font-bold', 'text-blue-900'],
  historyContent: ['col-start-2', 'w-full', 'max-w-full', 'min-w-0'],
  historyName: ['min-w-0', 'break-words', 'text-sm', 'font-bold', 'leading-snug', 'text-slate-800'],
  historyActivity: ['min-w-0', 'basis-full', 'break-words', 'text-xs', 'leading-snug', 'text-slate-600'],
  historyMeta: ['flex', 'w-full', 'max-w-full', 'min-w-0', 'flex-wrap', 'items-center', 'gap-x-2', 'gap-y-1', 'pt-1'],
  historyDate: ['min-w-0', 'basis-full', 'whitespace-nowrap', 'text-xs', 'text-slate-500'],
  historyStatus: ['shrink-0', 'whitespace-nowrap', 'rounded-full', 'border', 'px-2', 'py-0.5', 'text-[0.6875rem]', 'font-bold'],
  historyStatusComplete: ['border-emerald-200', 'bg-emerald-50', 'text-emerald-700'],
  historyStatusActive: ['border-blue-200', 'bg-blue-50', 'text-blue-900'],
  additionalBody: ['grid', 'w-full', 'max-w-full', 'min-w-0', 'grid-cols-1', 'gap-3'],
  additionalAction: ['!flex', '!w-full', '!max-w-full', '!min-w-0', 'items-center', 'justify-center', 'gap-2', 'rounded-lg', 'border', 'border-slate-300', 'bg-white', 'px-3', 'py-2.5', 'text-sm', 'font-semibold', 'text-slate-700', 'hover:bg-slate-50'],
  beforeCompleteTitle: ['m-0', 'mb-4', 'min-w-0', 'whitespace-normal', 'break-words', 'text-sm', 'font-bold', 'uppercase', 'leading-snug', 'tracking-[0.04em]', 'text-slate-700'],
  beforeCompleteList: ['grid', 'w-full', 'max-w-full', 'min-w-0', 'grid-cols-1', 'gap-3'],
  beforeCompleteItem: ['grid', 'w-full', 'max-w-full', 'min-w-0', 'grid-cols-[1.25rem_minmax(0,1fr)]', 'items-start', 'gap-2.5'],
  beforeCompleteIcon: ['mt-0.5', 'flex', 'h-5', 'w-5', 'shrink-0', 'items-center', 'justify-center', 'self-start', 'text-blue-700'],
  beforeCompleteControl: ['mt-0.5', 'h-5', 'w-5', 'shrink-0', 'self-start', 'accent-blue-700'],
  beforeCompleteContent: ['min-w-0', 'max-w-full', 'break-words', 'text-sm', 'leading-relaxed', 'text-slate-700'],
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
  sharedAttachmentRegion: HTMLElement | null;
  sharedFileAction: HTMLElement | null;
  sharedSortSelect: HTMLSelectElement | null;
  sharedViewAllAction: HTMLElement | null;
  sharedHistoryRegion: HTMLElement | null;
  sharedHistoryItems: readonly HTMLElement[];
  sharedAdditionalRegion: HTMLElement | null;
  sharedBeforeCompleteRegion: HTMLElement | null;
  sharedBeforeCompleteItems: readonly HTMLElement[];
  t1FormScope: HTMLElement | null;
  t1RegistrationFields: readonly HTMLElement[];
  t1UploadShell: HTMLElement | null;
  t1PreviousDataFields: readonly HTMLElement[];
  t1FinishAction: HTMLElement | null;
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

function smallestElementWithText(
  scope: ParentNode,
  text: string,
  selector = 'h1, h2, h3, h4, h5, h6, legend, label, strong, span, p, div',
): HTMLElement | null {
  return Array.from(scope.querySelectorAll<HTMLElement>(selector))
    .filter((element): boolean => normalizedText(element) === text)
    .sort((left, right): number => left.children.length - right.children.length)[0] ?? null;
}

function controlWithText(
  scope: ParentNode,
  text: string,
): HTMLElement | null {
  return Array.from(
    scope.querySelectorAll<HTMLElement>(
      'button, a[href], label, [role="button"], input[type="button"], input[type="submit"]',
    ),
  ).find((element): boolean => normalizedText(element) === text) ?? null;
}

function regionFromTitle(
  title: HTMLElement | null,
): HTMLElement | null {
  if (!title) return null;
  const region = title.closest<HTMLElement>(
    `[data-shared-region], ${ZEEV_SELECTORS.historyRegions}, section, aside, article, .card, .panel`,
  );
  return region && !region.matches(ZEEV_SELECTORS.root) ? region : title.parentElement;
}

interface SharedHumanTaskSummary {
  sharedAttachmentRegion: HTMLElement | null;
  sharedFileAction: HTMLElement | null;
  sharedSortSelect: HTMLSelectElement | null;
  sharedViewAllAction: HTMLElement | null;
  sharedHistoryRegion: HTMLElement | null;
  sharedHistoryItems: readonly HTMLElement[];
  sharedAdditionalRegion: HTMLElement | null;
  sharedBeforeCompleteRegion: HTMLElement | null;
  sharedBeforeCompleteItems: readonly HTMLElement[];
}

const EMPTY_SHARED_HUMAN_TASK: SharedHumanTaskSummary = {
  sharedAttachmentRegion: null,
  sharedFileAction: null,
  sharedSortSelect: null,
  sharedViewAllAction: null,
  sharedHistoryRegion: null,
  sharedHistoryItems: [],
  sharedAdditionalRegion: null,
  sharedBeforeCompleteRegion: null,
  sharedBeforeCompleteItems: [],
};

interface T1ExperienceSummary {
  t1FormScope: HTMLElement | null;
  t1RegistrationFields: readonly HTMLElement[];
  t1UploadShell: HTMLElement | null;
  t1PreviousDataFields: readonly HTMLElement[];
  t1FinishAction: HTMLElement | null;
}

const EMPTY_T1_EXPERIENCE: T1ExperienceSummary = {
  t1FormScope: null,
  t1RegistrationFields: [],
  t1UploadShell: null,
  t1PreviousDataFields: [],
  t1FinishAction: null,
};

function resolveLabeledSelect(
  region: HTMLElement,
  label: HTMLElement | null,
): HTMLSelectElement | null {
  const nativeFileOrder = region.querySelector<HTMLSelectElement>('#fileOrder');
  if (nativeFileOrder) return nativeFileOrder;
  if (label instanceof HTMLLabelElement && label.htmlFor) {
    const labeled = document.getElementById(label.htmlFor);
    if (labeled instanceof HTMLSelectElement && region.contains(labeled)) {
      return labeled;
    }
  }
  return label?.parentElement?.querySelector<HTMLSelectElement>('select') ??
    region.querySelector<HTMLSelectElement>('select');
}

function enhanceSharedAttachments(
  root: HTMLElement,
): Pick<
  SharedHumanTaskSummary,
  | 'sharedAttachmentRegion'
  | 'sharedFileAction'
  | 'sharedSortSelect'
  | 'sharedViewAllAction'
> {
  const region = root.querySelector<HTMLElement>(ZEEV_SELECTORS.attachments);
  if (!region) {
    return {
      sharedAttachmentRegion: null,
      sharedFileAction: null,
      sharedSortSelect: null,
      sharedViewAllAction: null,
    };
  }

  const title = smallestElementWithText(region, 'anexos opcionais');
  const fileAction = controlWithText(region, 'selecionar arquivos');
  const fileInput = region.querySelector<HTMLInputElement>('input[type="file"]');
  const sortLabel = smallestElementWithText(region, 'ordenar por', 'label, span, strong, p, div');
  const sortSelect = resolveLabeledSelect(region, sortLabel);
  const viewAllAction = controlWithText(region, 'visualizar todos os arquivos');
  const attachmentBody = commonAncestor(
    [fileAction, sortLabel, sortSelect, viewAllAction].filter(
      (element): element is HTMLElement => element !== null,
    ),
  );

  decorate(region, 'human-attachments', HUMAN_TASK_CLASSES.card);
  if (title) decorate(title, 'human-attachments-title', HUMAN_TASK_CLASSES.title);
  if (attachmentBody && attachmentBody !== region) {
    decorate(
      attachmentBody,
      'human-attachments-body',
      HUMAN_TASK_CLASSES.attachmentBody,
    );
  } else {
    applyTailwindClasses(region, HUMAN_TASK_CLASSES.attachmentBody);
  }
  if (fileAction) {
    decorate(fileAction, 'human-attachments-file-action', HUMAN_TASK_CLASSES.fileAction);
  }
  if (fileInput) {
    decorate(fileInput, 'human-attachments-file-input', HUMAN_TASK_CLASSES.fileInput);
  }
  if (sortLabel) {
    decorate(sortLabel, 'human-attachments-sort-label', HUMAN_TASK_CLASSES.sortLabel);
  }
  if (sortSelect) {
    const sortGroup = commonAncestor(
      [sortLabel, sortSelect].filter(
        (element): element is HTMLElement => element !== null,
      ),
    );
    if (sortGroup && sortGroup !== region) {
      decorate(sortGroup, 'human-attachments-sort', HUMAN_TASK_CLASSES.sortGroup);
    }
    decorate(sortSelect, 'human-attachments-sort-select', HUMAN_TASK_CLASSES.sortSelect);
  }
  if (viewAllAction) {
    decorate(viewAllAction, 'human-attachments-view-all', HUMAN_TASK_CLASSES.viewAll);
  }

  return {
    sharedAttachmentRegion: region,
    sharedFileAction: fileAction,
    sharedSortSelect: sortSelect,
    sharedViewAllAction: viewAllAction,
  };
}

function historyItemCandidates(region: HTMLElement): HTMLElement[] {
  const explicit = Array.from(
    region.querySelectorAll<HTMLElement>(ZEEV_SELECTORS.historyItems),
  );
  if (explicit.length > 0) return Array.from(new Set(explicit));
  return Array.from(region.children).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement &&
      /\b\d{2}\/\d{2}\/\d{4}\b/.test(normalizedText(element)),
  );
}

function enhanceSharedHistory(
  root: HTMLElement,
): Pick<
  SharedHumanTaskSummary,
  'sharedHistoryRegion' | 'sharedHistoryItems'
> {
  const title = smallestElementWithText(root, 'historico');
  const region = regionFromTitle(title);
  if (!title || !region || region === root) {
    return { sharedHistoryRegion: null, sharedHistoryItems: [] };
  }

  const items = historyItemCandidates(region);
  decorate(region, 'human-history', HUMAN_TASK_CLASSES.card);
  decorate(title, 'human-history-title', HUMAN_TASK_CLASSES.title);
  const list = commonAncestor(items);
  if (list && list !== region && !items.includes(list)) {
    decorate(list, 'human-history-list', HUMAN_TASK_CLASSES.historyList);
  }

  items.forEach((item): void => {
    const avatar = item.querySelector<HTMLElement>(
      '.avatar, [data-initials], [class*="avatar" i], [class*="initial" i]',
    );
    const name = item.querySelector<HTMLElement>(
      '.person-name, [data-person-name], [class*="person" i], [class*="user-name" i]',
    );
    const activity = item.querySelector<HTMLElement>(
      '.activity-name, [data-activity], [class*="activity" i], [class*="task-name" i]',
    );
    const date = item.querySelector<HTMLElement>(
      'time, [data-history-date], [class*="date" i], [class*="time" i]',
    );
    const status = item.querySelector<HTMLElement>(
      'span.badge.badge-light-secondary, .status, [data-status], [class*="status" i], .badge',
    );
    const content = name?.closest<HTMLElement>(
      '.history-content, .timeline-content, [class*="content" i]',
    );
    const meta = commonAncestor(
      [activity, date, status].filter(
        (element): element is HTMLElement => element !== null,
      ),
    );

    decorate(item, 'human-history-item', HUMAN_TASK_CLASSES.historyItem);
    if (avatar) decorate(avatar, 'human-history-avatar', HUMAN_TASK_CLASSES.historyAvatar);
    if (content && content !== item) {
      decorate(content, 'human-history-content', HUMAN_TASK_CLASSES.historyContent);
    }
    if (name) decorate(name, 'human-history-person', HUMAN_TASK_CLASSES.historyName);
    if (activity) decorate(activity, 'human-history-activity', HUMAN_TASK_CLASSES.historyActivity);
    if (meta && meta !== item) {
      decorate(meta, 'human-history-meta', HUMAN_TASK_CLASSES.historyMeta);
    }
    if (date) decorate(date, 'human-history-date', HUMAN_TASK_CLASSES.historyDate);
    if (status) {
      decorate(status, 'human-history-status', [
        ...HUMAN_TASK_CLASSES.historyStatus,
        ...(normalizedText(status) === 'concluido'
          ? HUMAN_TASK_CLASSES.historyStatusComplete
          : HUMAN_TASK_CLASSES.historyStatusActive),
      ]);
    }
  });

  return { sharedHistoryRegion: region, sharedHistoryItems: items };
}

function enhanceSharedAdditionalRegion(
  root: HTMLElement,
): HTMLElement | null {
  const region = root.querySelector<HTMLElement>(ZEEV_SELECTORS.messages);
  if (!region) return null;
  decorate(region, 'human-shared-messages', HUMAN_TASK_CLASSES.card);
  const title = smallestElementWithText(region, 'mensagens');
  if (title) decorate(title, 'human-shared-messages-title', HUMAN_TASK_CLASSES.title);
  const body = title?.parentElement === region
    ? Array.from(region.children).find(
        (element): element is HTMLElement =>
          element instanceof HTMLElement && element !== title,
      ) ?? null
    : null;
  if (body) decorate(body, 'human-shared-messages-body', HUMAN_TASK_CLASSES.additionalBody);
  region
    .querySelectorAll<HTMLElement>('button, a[href], [role="button"]')
    .forEach((action): void => {
      decorate(action, 'human-shared-messages-action', HUMAN_TASK_CLASSES.additionalAction);
    });
  return region;
}

function beforeCompleteItemCandidates(
  region: HTMLElement,
  title: HTMLElement,
): HTMLElement[] {
  const explicit = Array.from(
    region.querySelectorAll<HTMLElement>(ZEEV_SELECTORS.beforeCompleteItems),
  );
  if (explicit.length > 0) {
    const unique = Array.from(new Set(explicit));
    return unique.filter(
      (candidate): boolean =>
        !unique.some(
          (other): boolean => other !== candidate && other.contains(candidate),
        ),
    );
  }

  const body = Array.from(region.children).find(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && element !== title,
  );
  if (!body) return [];
  const children = Array.from(body.children).filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  );
  return children.length > 0 ? children : [body];
}

function enhanceSharedBeforeComplete(
  root: HTMLElement,
): Pick<
  SharedHumanTaskSummary,
  'sharedBeforeCompleteRegion' | 'sharedBeforeCompleteItems'
> {
  const title = smallestElementWithText(
    root,
    'antes de concluir',
    'h1, h2, h3, h4, h5, h6, legend, [role="heading"], .card-title, .panel-title, [class*="title" i]',
  );
  const region = regionFromTitle(title);
  if (!title || !region || region === root) {
    return { sharedBeforeCompleteRegion: null, sharedBeforeCompleteItems: [] };
  }

  const items = beforeCompleteItemCandidates(region, title);
  decorate(region, 'human-before-complete', HUMAN_TASK_CLASSES.card);
  decorate(
    title,
    'human-before-complete-title',
    HUMAN_TASK_CLASSES.beforeCompleteTitle,
  );
  const list = commonAncestor(items);
  if (list && list !== region && !items.includes(list)) {
    decorate(
      list,
      'human-before-complete-list',
      HUMAN_TASK_CLASSES.beforeCompleteList,
    );
  }

  items.forEach((item): void => {
    const icon = item.querySelector<HTMLElement>(
      'input[type="checkbox"], [data-check-icon], svg, i, .material-icons, [class*="icon" i]',
    );
    const content = item.querySelector<HTMLElement>(
      '[data-check-content], .check-content, .item-content, .content, p',
    ) ?? Array.from(item.children).find(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        element !== icon &&
        (icon === null || !element.contains(icon)),
    ) ?? null;

    decorate(item, 'human-before-complete-item', HUMAN_TASK_CLASSES.beforeCompleteItem);
    if (icon) {
      decorate(
        icon,
        'human-before-complete-icon',
        icon instanceof HTMLInputElement
          ? HUMAN_TASK_CLASSES.beforeCompleteControl
          : HUMAN_TASK_CLASSES.beforeCompleteIcon,
      );
    }
    if (content) {
      decorate(
        content,
        'human-before-complete-content',
        HUMAN_TASK_CLASSES.beforeCompleteContent,
      );
    }
  });

  return {
    sharedBeforeCompleteRegion: region,
    sharedBeforeCompleteItems: items,
  };
}

function enhanceSharedHumanTaskChrome(
  root: HTMLElement,
): SharedHumanTaskSummary {
  const attachments = enhanceSharedAttachments(root);
  const history = enhanceSharedHistory(root);
  const beforeComplete = enhanceSharedBeforeComplete(root);
  return {
    ...attachments,
    ...history,
    ...beforeComplete,
    sharedAdditionalRegion: enhanceSharedAdditionalRegion(root),
  };
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

function startSectionHeadingRows(scope: ParentNode): HTMLElement[] {
  return Array.from(scope.querySelectorAll<HTMLElement>('tr')).filter(
    (row): boolean =>
      Array.from(row.children).some(
        (cell): boolean =>
          cell instanceof HTMLElement && normalizedText(cell) === 'dados pessoais',
      ),
  );
}

function normalizeStartFormStructure(
  fieldShells: readonly HTMLElement[],
): void {
  const formScope = document.querySelector<HTMLElement>(
    ZEEV_SELECTORS.containerForm,
  );
  if (!formScope) return;
  decorate(formScope, 'start-form-scope', START_CLASSES.formScope);

  const fieldRows = Array.from(
    new Set(
      fieldShells
        .map((shell): HTMLElement | null => shell.closest<HTMLElement>('tr'))
        .filter((row): row is HTMLElement => row !== null),
    ),
  );
  const headingRows = startSectionHeadingRows(formScope);
  const layoutRows = [...headingRows, ...fieldRows];
  if (layoutRows.length === 0) return;

  const gridRoot = commonAncestor(layoutRows);
  if (!gridRoot || !formScope.contains(gridRoot)) return;
  decorate(gridRoot, 'start-field-grid', START_CLASSES.fieldGrid);

  const tables = new Set<HTMLElement>();
  const bodies = new Set<HTMLElement>();
  layoutRows.forEach((row): void => {
    const table = row.closest<HTMLElement>('table');
    const body = row.closest<HTMLElement>('tbody');
    if (table) tables.add(table);
    if (body) bodies.add(body);
  });

  tables.forEach((table): void => {
    decorate(
      table,
      'start-form-table',
      table === gridRoot || table.contains(gridRoot)
        ? START_CLASSES.formTable
        : START_CLASSES.structuralContents,
    );
  });
  bodies.forEach((body): void => {
    if (body === gridRoot) return;
    decorate(body, 'start-form-body', START_CLASSES.structuralContents);
  });

  layoutRows.forEach((row): void => {
    let ancestor = row.parentElement;
    while (ancestor && ancestor !== gridRoot) {
      if (!tables.has(ancestor) && !bodies.has(ancestor)) {
        decorate(
          ancestor,
          'start-form-structural-wrapper',
          START_CLASSES.structuralContents,
        );
      }
      ancestor = ancestor.parentElement;
    }
  });

  headingRows.forEach((row): void => {
    decorate(row, 'start-section-heading-row', START_CLASSES.sectionHeadingRow);
    Array.from(row.children).forEach((cell): void => {
      if (cell instanceof HTMLElement) {
        decorate(
          cell,
          'start-section-heading',
          START_CLASSES.sectionHeadingCell,
        );
      }
    });
  });
}

function enhanceStartFields(fieldShells: readonly HTMLElement[]): void {
  normalizeStartFormStructure(fieldShells);
  fieldShells.forEach((shell): void => {
    const name = shell.getAttribute('data-zeev-fieb-field');
    shell.setAttribute(
      'data-zeev-fieb-grid-span',
      name === 'cpfCliente' || name === 'nacionalidade' ? '6' : '12',
    );
    decorate(shell, 'field-shell', START_CLASSES.fieldShell, {
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
      Array.from(row.children).forEach((cell): void => {
        if (cell instanceof HTMLElement && cell !== shell) {
          decorate(cell, 'start-field-cell', START_CLASSES.fieldCell, {
            'data-zeev-fieb-field': name ?? '',
          });
        }
      });
      const previousCell = shell.previousElementSibling;
      const labelCell =
        row.querySelector<HTMLElement>('td.col0, th.col0') ??
        (previousCell instanceof HTMLElement ? previousCell : null);
      if (labelCell) {
        decorate(labelCell, 'start-field-label', START_CLASSES.fieldLabel, {
          'data-zeev-fieb-field': name ?? '',
        });
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
    const choices = Array.from(
      shell.querySelectorAll<HTMLElement>('.form-check'),
    );
    const choiceGroup = commonAncestor(choices);
    if (choiceGroup && shell.contains(choiceGroup)) {
      if (choiceGroup === shell) {
        applyTailwindClasses(choiceGroup, START_CLASSES.radioGroup);
      } else {
        decorate(choiceGroup, 'radio-choice-group', START_CLASSES.radioGroup, {
          'data-zeev-fieb-field': name,
        });
      }
    }
    choices.forEach((choice): void => {
      decorate(choice, 'radio-choice-card', START_CLASSES.radioChoice, {
        'data-zeev-fieb-field': name,
        'data-zeev-fieb-access': 'edit',
      });
    });
  });
}

function t1SectionHeadings(scope: ParentNode): HTMLElement[] {
  const accepted = new Set([
    'dados do cadastro',
    'dados pessoais',
    'dados pessoais informados anteriormente',
  ]);
  return Array.from(
    scope.querySelectorAll<HTMLElement>(
      'h1, h2, h3, h4, h5, h6, legend, th, td, [role="heading"], .card-title, .panel-title',
    ),
  )
    .filter((element): boolean => accepted.has(normalizedText(element)))
    .sort((left, right): number => left.children.length - right.children.length);
}

function normalizeT1FormStructure(
  formScope: HTMLElement,
  fieldShells: readonly HTMLElement[],
): void {
  decorate(formScope, 't1-form-scope', T1_CLASSES.formScope);
  const fieldRows = Array.from(
    new Set(
      fieldShells
        .map((shell): HTMLElement | null => shell.closest<HTMLElement>('tr'))
        .filter((row): row is HTMLElement => row !== null),
    ),
  );
  const headings = t1SectionHeadings(formScope);
  const headingRows = headings
    .map((heading): HTMLElement | null => heading.closest<HTMLElement>('tr'))
    .filter((row): row is HTMLElement => row !== null);
  const layoutRows = Array.from(new Set([...headingRows, ...fieldRows]));
  if (layoutRows.length === 0) return;

  const gridRoot = commonAncestor(layoutRows);
  if (!gridRoot || !formScope.contains(gridRoot)) return;
  if (gridRoot === formScope) {
    applyTailwindClasses(gridRoot, T1_CLASSES.fieldGrid);
  } else {
    decorate(gridRoot, 't1-registration-grid', T1_CLASSES.fieldGrid);
  }

  const tables = new Set<HTMLElement>();
  const bodies = new Set<HTMLElement>();
  layoutRows.forEach((row): void => {
    const table = row.closest<HTMLElement>('table');
    const body = row.closest<HTMLElement>('tbody');
    if (table) tables.add(table);
    if (body) bodies.add(body);
  });
  tables.forEach((table): void => {
    applyTailwindClasses(
      table,
      table === gridRoot || table.contains(gridRoot)
        ? T1_CLASSES.formTable
        : T1_CLASSES.structuralContents,
    );
  });
  bodies.forEach((body): void => {
    if (body !== gridRoot) applyTailwindClasses(body, T1_CLASSES.structuralContents);
  });
  layoutRows.forEach((row): void => {
    let ancestor = row.parentElement;
    while (ancestor && ancestor !== gridRoot) {
      if (!tables.has(ancestor) && !bodies.has(ancestor)) {
        applyTailwindClasses(ancestor, T1_CLASSES.structuralContents);
      }
      ancestor = ancestor.parentElement;
    }
  });

  headings.forEach((heading): void => {
    const previous = normalizedText(heading) !== 'dados do cadastro';
    const row = heading.closest<HTMLElement>('tr');
    if (row) applyTailwindClasses(row, T1_CLASSES.headingRow);
    decorate(
      heading,
      previous ? 't1-previous-data-heading' : 't1-registration-heading',
      [
        ...T1_CLASSES.headingCell,
        ...(previous ? T1_CLASSES.previousHeadingCell : []),
      ],
    );
  });
}

function t1FieldLabel(
  row: HTMLElement | null,
  shell: HTMLElement,
): HTMLElement | null {
  if (row) {
    const previous = shell.previousElementSibling;
    return row.querySelector<HTMLElement>('td.col0, th.col0, label') ??
      (previous instanceof HTMLElement ? previous : null);
  }
  return shell.querySelector<HTMLElement>('label');
}

function enhanceT1Field(
  shell: HTMLElement,
  name: ZeevFieldName,
  previous: boolean,
): void {
  const row = shell.closest<HTMLElement>('tr');
  if (row) {
    const rowClasses = previous
      ? T1_CLASSES.previousRow
      : name === 'cepEndereco' || name === 'numeroEndereco'
        ? T1_CLASSES.row6
        : T1_CLASSES.row12;
    decorate(
      row,
      previous ? 't1-previous-field-row' : 't1-registration-field-row',
      rowClasses,
      {
        'data-zeev-fieb-field': name,
        'data-zeev-fieb-grid-span': previous
          ? '4'
          : name === 'cepEndereco' || name === 'numeroEndereco'
            ? '6'
            : '12',
      },
    );
  }
  applyTailwindClasses(shell, T1_CLASSES.shell);
  const label = t1FieldLabel(row, shell);
  if (label && label !== shell) {
    decorate(
      label,
      previous ? 't1-previous-field-label' : 't1-registration-field-label',
      T1_CLASSES.label,
      { 'data-zeev-fieb-field': name },
    );
  }
  shell
    .querySelectorAll<HTMLElement>(
      'input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]):not([type="file"]), select, textarea',
    )
    .forEach((control): void => {
      applyTailwindClasses(
        control,
        previous ? T1_CLASSES.previousInput : T1_CLASSES.input,
      );
    });
  shell
    .querySelectorAll<HTMLElement>('[data-zeev-fieb-role="readonly-scalar-renderer"]')
    .forEach((renderer): void => {
      applyTailwindClasses(renderer, T1_CLASSES.readonlyValue);
    });
  if (!previous || (name !== 'estadoCivil' && name !== 'tipoDocumento')) return;
  const choices = Array.from(shell.querySelectorAll<HTMLElement>('.form-check'));
  const group = commonAncestor(choices);
  if (group && shell.contains(group)) {
    applyTailwindClasses(group, START_CLASSES.radioGroup);
  }
  choices.forEach((choice): void => {
    applyTailwindClasses(choice, START_CLASSES.radioChoice);
  });
}

function enhanceT1Upload(shell: HTMLElement): void {
  const row = shell.closest<HTMLElement>('tr');
  if (row) {
    decorate(row, 't1-upload-row', T1_CLASSES.uploadRow, {
      'data-zeev-fieb-field': 'documentoCadastroPdf',
      'data-zeev-fieb-grid-span': '12',
    });
  }
  applyTailwindClasses(shell, T1_CLASSES.uploadShell);
  shell
    .querySelectorAll<HTMLInputElement>('input[type="file"]')
    .forEach((input): void => applyTailwindClasses(input, T1_CLASSES.uploadInput));
  shell
    .querySelectorAll<HTMLElement>('[data-zeev-fieb-role="file-upload"]')
    .forEach((button): void => applyTailwindClasses(button, T1_CLASSES.uploadButton));
  shell
    .querySelectorAll<HTMLElement>(
      '[data-zeev-fieb-role="file-viewer"], [data-zeev-fieb-role="file-download"]',
    )
    .forEach((element): void => applyTailwindClasses(element, T1_CLASSES.fileViewer));
  shell
    .querySelectorAll<HTMLElement>('button, a[href], [role="button"]')
    .forEach((action): void => {
      const text = normalizedText(action);
      if (text.includes('remover') || text.includes('excluir')) {
        applyTailwindClasses(action, T1_CLASSES.fileAction);
      }
    });
}

function enhanceT1Experience(
  fieldShells: readonly HTMLElement[],
  actionRegion: HTMLElement | null,
  actions: readonly HTMLElement[],
): T1ExperienceSummary {
  const formScope = document.querySelector<HTMLElement>(ZEEV_SELECTORS.containerForm);
  const registrationFields = fieldShells.filter((shell): boolean =>
    REGISTRATION_FIELD_NAMES.includes(
      shell.getAttribute('data-zeev-fieb-field') as typeof REGISTRATION_FIELD_NAMES[number],
    ),
  );
  const previousDataFields = fieldShells.filter((shell): boolean =>
    PERSONAL_FIELD_NAMES.includes(
      shell.getAttribute('data-zeev-fieb-field') as typeof PERSONAL_FIELD_NAMES[number],
    ),
  );
  if (formScope) {
    normalizeT1FormStructure(
      formScope,
      [...registrationFields, ...previousDataFields],
    );
  }
  registrationFields.forEach((shell): void => {
    const name = shell.getAttribute('data-zeev-fieb-field') as ZeevFieldName;
    if (name === 'documentoCadastroPdf') {
      enhanceT1Upload(shell);
    } else {
      enhanceT1Field(shell, name, false);
    }
  });
  previousDataFields.forEach((shell): void => {
    enhanceT1Field(
      shell,
      shell.getAttribute('data-zeev-fieb-field') as ZeevFieldName,
      true,
    );
  });

  const finishAction = actions.find((action): boolean => action.id === 'btnFinish') ?? null;
  const controllers = actionRegion?.closest<HTMLElement>('#controllers');
  if (controllers) decorate(controllers, 't1-action-area', T1_CLASSES.actionArea);
  if (actionRegion) applyTailwindClasses(actionRegion, T1_CLASSES.actionRegion);
  if (finishAction) applyTailwindClasses(finishAction, T1_CLASSES.finishAction);

  return {
    t1FormScope: formScope,
    t1RegistrationFields: registrationFields,
    t1UploadShell:
      registrationFields.find(
        (shell): boolean =>
          shell.getAttribute('data-zeev-fieb-field') === 'documentoCadastroPdf',
      ) ?? null,
    t1PreviousDataFields: previousDataFields,
    t1FinishAction: finishAction,
  };
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
      ...EMPTY_SHARED_HUMAN_TASK,
      ...EMPTY_T1_EXPERIENCE,
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
  const sharedHumanTask = stageCode === 'START'
    ? EMPTY_SHARED_HUMAN_TASK
    : enhanceSharedHumanTaskChrome(root);

  return {
    root,
    ...fieldSummary,
    actionRegion,
    actions,
    ...startHost,
    ...sharedHumanTask,
    ...EMPTY_T1_EXPERIENCE,
  };
}
