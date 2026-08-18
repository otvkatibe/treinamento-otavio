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
  FormSection,
  FormSectionField,
  ProcessStepContext,
  ZeevFieldElement,
  ZeevFieldName,
} from './types';

export interface ZeevAdapterContract {
  getRoot(): HTMLElement | null;
  getForm(): HTMLElement | null;
  getForms(): readonly HTMLElement[];
  getSections(): readonly FormSection[];
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

function discoverSectionFields(
  table: HTMLTableElement,
  groupId: string,
): readonly FormSectionField[] {
  const functionalRows = Array.from(
    table.querySelectorAll<HTMLTableRowElement>(`tr[codgroup="${groupId}"]`),
  );

  return functionalRows
    .map((row: HTMLTableRowElement): FormSectionField | null => {
      const inputElement = row.querySelector<HTMLElement>(
        'td.col1 input[data-name], td.col1 [data-name]',
      );
      const name = inputElement?.getAttribute('data-name')?.trim();
      if (!name) {
        return null;
      }

      const labelCell = row.querySelector<HTMLElement>('td.col0');
      const rawLabel = labelCell?.textContent?.trim() ?? '';
      const label = rawLabel.replace(/\s+/g, ' ').trim();

      if (
        name === 'numeroContrato' ||
        name === 'dataContrato' ||
        name === 'valorContrato'
      ) {
        const isTextInput =
          inputElement instanceof HTMLInputElement &&
          inputElement.type.toLowerCase() === 'text';
        const editable = isTextInput;

        return {
          name,
          label,
          editable,
        };
      }

      const cellCol1 = row.querySelector<HTMLElement>('td.col1');
      if (cellCol1 !== null) {
        const hasUploadAction =
          cellCol1.querySelector(
            'input[type="file"], button[id*="Upload"], button[id*="upload"], [data-role="file-upload"], [class*="upload" i]',
          ) !== null;

        if (hasUploadAction) {
          return {
            name,
            label,
            editable: true,
          };
        }

        const hasSpecificFileViewAction =
          cellCol1.querySelector(
            'a[download], button[id*="Download"], button[id*="download"], [data-role="file-download"], [data-role="file-viewer"], [class*="download" i], [class*="viewer" i], [data-fieldformat="FILE_VIEW"]',
          ) !== null;

        if (hasSpecificFileViewAction) {
          return {
            name,
            label,
            editable: false,
          };
        }
      }

      return {
        name,
        label,
      };
    })
    .filter((field: FormSectionField | null): field is FormSectionField => field !== null);
}

function getSections(): readonly FormSection[] {
  const scope = getFunctionalFieldScope();
  if (!scope) {
    return [];
  }

  const sectionTables = Array.from(
    scope.querySelectorAll<HTMLTableElement>(ZEEV_SELECTORS.formSections),
  );

  return sectionTables
    .map((table: HTMLTableElement): FormSection | null => {
      const id = table.getAttribute('data-groupid')?.trim();
      if (!id) {
        return null;
      }

      const matchingKeyElement =
        Array.from(table.querySelectorAll<HTMLElement>('b[data-key]')).find(
          (element: HTMLElement): boolean =>
            element.getAttribute('data-key')?.trim() === id,
        ) ?? null;

      const groupRow = table.querySelector<HTMLElement>('tr.group');
      const fallbackKeyElement =
        groupRow?.querySelector<HTMLElement>('b[data-key]') ??
        table.querySelector<HTMLElement>('b[data-key]') ??
        null;
      const groupBoldElement =
        groupRow?.querySelector<HTMLElement>('b') ??
        table.querySelector<HTMLElement>('b') ??
        null;

      const labelElement =
        matchingKeyElement ??
        fallbackKeyElement ??
        groupBoldElement ??
        groupRow ??
        null;

      const rawLabel =
        labelElement?.textContent?.trim() || table.id?.trim() || id;
      const label = rawLabel.replace(/\s+/g, ' ').trim();
      const fields = discoverSectionFields(table, id);

      return {
        id,
        label,
        fields,
      };
    })
    .filter((section: FormSection | null): section is FormSection => section !== null);
}

export const zeevAdapter: ZeevAdapterContract = Object.freeze({
  getRoot,
  getForm,
  getForms,
  getSections,
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
