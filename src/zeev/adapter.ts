import { ZEEV_FIELDS } from './fields';
import { ZEEV_SELECTORS } from './selectors';
import { getStepByTitle, normalizeStepTitle } from './steps';
import type {
  ProcessStepContext,
  ZeevFieldElement,
  ZeevFieldName,
} from './types';

export interface ZeevAdapterContract {
  getRoot(): HTMLElement | null;
  getForm(): HTMLElement | null;
  getCurrentTaskTitle(): string | null;
  getCurrentTask(): ProcessStepContext | null;
  getField(name: ZeevFieldName): ZeevFieldElement | null;
  getFields(name: ZeevFieldName): readonly ZeevFieldElement[];
  getSelectedField(name: ZeevFieldName): ZeevFieldElement | null;
  getNativeActions(): readonly HTMLElement[];
  getNativeAction(label: string): HTMLElement | null;
  getSendButton(): HTMLButtonElement | null;
}

function getRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>(ZEEV_SELECTORS.root);
}

function getForm(): HTMLElement | null {
  return getRoot()?.querySelector<HTMLElement>(ZEEV_SELECTORS.form) ?? null;
}

function getCurrentTaskTitle(): string | null {
  const title = document.querySelector<HTMLElement>(ZEEV_SELECTORS.taskTitle)?.textContent;

  if (!title || !title.trim()) {
    return null;
  }

  return normalizeStepTitle(title);
}

function getCurrentTask(): ProcessStepContext | null {
  const title = getCurrentTaskTitle();

  if (!title) {
    return null;
  }

  const metadata = getStepByTitle(title);

  return {
    code: metadata?.code ?? null,
    title,
    stepIndex: metadata?.stepIndex ?? null,
    metadata,
  };
}

function getFields(name: ZeevFieldName): readonly ZeevFieldElement[] {
  const form = getForm();

  if (!form) {
    return [];
  }

  return Array.from(
    form.querySelectorAll<ZeevFieldElement>(ZEEV_FIELDS[name].selector),
  );
}

function getField(name: ZeevFieldName): ZeevFieldElement | null {
  return getFields(name)[0] ?? null;
}

function getSelectedField(name: ZeevFieldName): ZeevFieldElement | null {
  const fields = getFields(name);

  if (ZEEV_FIELDS[name].structure !== 'radio-group') {
    return fields[0] ?? null;
  }

  return (
    fields.find(
      (field) =>
        field instanceof HTMLInputElement &&
        field.type === 'radio' &&
        field.checked,
    ) ?? null
  );
}

function getSendButton(): HTMLButtonElement | null {
  return getRoot()?.querySelector<HTMLButtonElement>(ZEEV_SELECTORS.sendButton) ?? null;
}

function nativeActionLabel(element: HTMLElement): string {
  const value =
    element instanceof HTMLInputElement || element instanceof HTMLButtonElement
      ? element.value.trim()
      : '';
  const textContent = element.textContent?.trim() ?? '';
  const ariaLabel = element.getAttribute('aria-label')?.trim() ?? '';
  const rawLabel = value || textContent || ariaLabel;

  return normalizeStepTitle(rawLabel);
}

function getNativeActions(): readonly HTMLElement[] {
  const root = getRoot();
  if (!root) {
    return [];
  }

  return Array.from(
    root.querySelectorAll<HTMLElement>(
      '#controllers button, #controllers input[type="button"], #controllers input[type="submit"], #controllers a, #buttons button, #buttons input[type="button"], #buttons input[type="submit"], #buttons a, #commands button, #commands input[type="button"], #commands input[type="submit"], #commands a',
    ),
  );
}

function getNativeAction(label: string): HTMLElement | null {
  const normalizedLabel = normalizeStepTitle(label);
  return (
    getNativeActions().find(
      (element: HTMLElement): boolean =>
        nativeActionLabel(element) === normalizedLabel,
    ) ?? null
  );
}

export const zeevAdapter: ZeevAdapterContract = Object.freeze({
  getRoot,
  getForm,
  getCurrentTaskTitle,
  getCurrentTask,
  getField,
  getFields,
  getSelectedField,
  getNativeActions,
  getNativeAction,
  getSendButton,
});
