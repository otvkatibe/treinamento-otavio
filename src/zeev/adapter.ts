import { ZEEV_FIELDS } from './fields';
import {
  getFunctionalFieldScope,
  getSemanticFieldCandidates,
  isElementVisible,
  selectOperationalField,
} from './field-resolver';
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
  getForms(): readonly HTMLElement[];
  getCurrentTaskTitle(): string | null;
  getCurrentTask(): ProcessStepContext | null;
  getField(name: ZeevFieldName): ZeevFieldElement | null;
  getFields(name: ZeevFieldName): readonly ZeevFieldElement[];
  getSelectedField(name: ZeevFieldName): ZeevFieldElement | null;
  getNativeActions(): readonly HTMLElement[];
  getNativeActionObservations(): readonly NativeActionObservation[];
  getNativeAction(label: string): HTMLElement | null;
  getSendButton(): HTMLButtonElement | null;
}

export interface NativeActionObservation {
  element: HTMLElement;
  rawLabel: string;
  label: string;
  visible: boolean;
  disabled: boolean;
}

function getRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>(ZEEV_SELECTORS.root);
}

function getForm(): HTMLElement | null {
  return getForms()[0] ?? null;
}

function getForms(): readonly HTMLElement[] {
  const scope = getFunctionalFieldScope();
  return scope
    ? Array.from(scope.querySelectorAll<HTMLElement>(ZEEV_SELECTORS.form))
    : [];
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
  return getSemanticFieldCandidates(name);
}

function getField(name: ZeevFieldName): ZeevFieldElement | null {
  return selectOperationalField(name, getFields(name));
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

function nativeActionRawLabel(element: HTMLElement): string {
  const value =
    element instanceof HTMLInputElement || element instanceof HTMLButtonElement
      ? element.value
      : '';
  const textContent = element.textContent ?? '';
  const ariaLabel = element.getAttribute('aria-label') ?? '';

  return value.trim() ? value : textContent.trim() ? textContent : ariaLabel;
}

export function canonicalizeNativeActionLabel(label: string): string {
  return label
    .replace(/\s+/g, ' ')
    .replace(/\s*(?:\.\.\.|…)\s*$/, '')
    .trim();
}

export function observeNativeAction(
  element: HTMLElement,
): NativeActionObservation {
  const rawLabel = nativeActionRawLabel(element);
  const nativelyDisabled =
    element instanceof HTMLButtonElement || element instanceof HTMLInputElement
      ? element.disabled
      : false;

  return {
    element,
    rawLabel,
    label: canonicalizeNativeActionLabel(rawLabel),
    visible: isElementVisible(element),
    disabled:
      nativelyDisabled || element.getAttribute('aria-disabled') === 'true',
  };
}

function getNativeActions(): readonly HTMLElement[] {
  const root = getRoot();
  if (!root) {
    return [];
  }

  const actionSelector =
    'button, input[type="button"], input[type="submit"], a';
  const primaryRegions = Array.from(
    root.querySelectorAll<HTMLElement>('#buttons'),
  );
  const fallbackRegions = Array.from(
    root.querySelectorAll<HTMLElement>('#controllers, #commands'),
  );
  const actions = new Set<HTMLElement>();

  [...primaryRegions, ...fallbackRegions].forEach((region: HTMLElement): void => {
    region
      .querySelectorAll<HTMLElement>(actionSelector)
      .forEach((element: HTMLElement): void => {
        if (isElementVisible(element)) actions.add(element);
      });
  });

  return Array.from(actions);
}

function getNativeActionObservations(): readonly NativeActionObservation[] {
  return getNativeActions().map(observeNativeAction);
}

function getNativeAction(label: string): HTMLElement | null {
  const normalizedLabel = canonicalizeNativeActionLabel(label);
  return (
    getNativeActionObservations().find(
      ({ label: observedLabel }): boolean => observedLabel === normalizedLabel,
    )?.element ?? null
  );
}

export const zeevAdapter: ZeevAdapterContract = Object.freeze({
  getRoot,
  getForm,
  getForms,
  getCurrentTaskTitle,
  getCurrentTask,
  getField,
  getFields,
  getSelectedField,
  getNativeActions,
  getNativeActionObservations,
  getNativeAction,
  getSendButton,
});
