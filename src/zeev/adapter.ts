import { ZEEV_FIELDS } from './fields';
import { ZEEV_SELECTORS } from './selectors';
import { getTaskByTitle, normalizeTaskTitle } from './tasks';
import type {
  TaskContext,
  ZeevFieldElement,
  ZeevFieldName,
} from './types';

export interface ZeevAdapterContract {
  getRoot(): HTMLElement | null;
  getForm(): HTMLElement | null;
  getCurrentTaskTitle(): string | null;
  getCurrentTask(): TaskContext | null;
  getField(name: ZeevFieldName): ZeevFieldElement | null;
  getFields(name: ZeevFieldName): readonly ZeevFieldElement[];
  getSelectedField(name: ZeevFieldName): ZeevFieldElement | null;
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

  return normalizeTaskTitle(title);
}

function getCurrentTask(): TaskContext | null {
  const title = getCurrentTaskTitle();

  if (!title) {
    return null;
  }

  const metadata = getTaskByTitle(title);

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

export const zeevAdapter: ZeevAdapterContract = Object.freeze({
  getRoot,
  getForm,
  getCurrentTaskTitle,
  getCurrentTask,
  getField,
  getFields,
  getSelectedField,
  getSendButton,
});
