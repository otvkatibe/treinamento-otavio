import { ZEEV_FIELDS } from './fields';
import { ZEEV_SELECTORS } from './selectors';
import type {
  StageFieldAccess,
  ZeevFieldElement,
  ZeevFieldName,
} from './types';

export type FieldFunctionalPresence =
  | 'functional'
  | 'technical-only'
  | 'absent';

export type FieldCandidateRole =
  | 'semantic-control'
  | 'upload-button'
  | 'download-button'
  | 'viewer'
  | 'readonly-renderer';

export interface ResolvedFieldCandidate {
  element: HTMLElement;
  role: FieldCandidateRole;
  visible: boolean;
  interactive: boolean;
}

export interface ResolvedFieldObservation {
  name: ZeevFieldName;
  presence: FieldFunctionalPresence;
  logicalElementCount: number;
  candidates: readonly ResolvedFieldCandidate[];
  semanticControls: readonly ZeevFieldElement[];
  primaryControl: ZeevFieldElement | null;
  uploadButton: HTMLButtonElement | null;
  downloadButtons: readonly HTMLButtonElement[];
  viewerElements: readonly HTMLElement[];
  readonlyRenderers: readonly HTMLElement[];
  logicalWrapper: HTMLElement | null;
  editable: boolean;
  readable: boolean;
}

export function getFunctionalFieldScope(): HTMLElement | null {
  return (
    document
      .querySelector<HTMLElement>(ZEEV_SELECTORS.root)
      ?.querySelector<HTMLElement>(ZEEV_SELECTORS.containerForm) ?? null
  );
}

export function isElementVisible(element: HTMLElement): boolean {
  if (element instanceof HTMLInputElement && element.type === 'hidden') {
    return false;
  }

  const view = element.ownerDocument.defaultView;
  let current: HTMLElement | null = element;

  while (current) {
    if (current.hidden || current.getAttribute('aria-hidden') === 'true') {
      return false;
    }

    const inlineVisibility = current.style.visibility;
    if (
      current.style.display === 'none' ||
      inlineVisibility === 'hidden' ||
      inlineVisibility === 'collapse'
    ) {
      return false;
    }

    const styles = view?.getComputedStyle(current);
    if (
      styles?.display === 'none' ||
      styles?.visibility === 'hidden' ||
      styles?.visibility === 'collapse'
    ) {
      return false;
    }

    current = current.parentElement;
  }

  return true;
}

export function isElementInteractive(element: HTMLElement): boolean {
  if (!isElementVisible(element)) return false;
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLButtonElement
  ) {
    return !element.disabled && !('readOnly' in element && element.readOnly);
  }
  return element instanceof HTMLAnchorElement && element.hasAttribute('href');
}

export function getSemanticFieldCandidates(
  name: ZeevFieldName,
): readonly ZeevFieldElement[] {
  const scope = getFunctionalFieldScope();
  return scope
    ? Array.from(
        scope.querySelectorAll<ZeevFieldElement>(ZEEV_FIELDS[name].selector),
      )
    : [];
}

export function selectOperationalField(
  name: ZeevFieldName,
  candidates = getSemanticFieldCandidates(name),
): ZeevFieldElement | null {
  if (ZEEV_FIELDS[name].structure === 'radio-group') {
    return (
      candidates.find(isElementVisible) ??
      candidates[0] ??
      null
    );
  }

  return (
    candidates.find(
      (candidate): boolean =>
        isElementVisible(candidate) && isElementInteractive(candidate),
    ) ??
    candidates.find(isElementVisible) ??
    candidates[0] ??
    null
  );
}

interface FileCompositeElements {
  downloadButtons: HTMLButtonElement[];
  viewerElements: HTMLElement[];
}

const FIELD_WRAPPER_SELECTORS = [
  '[data-zeev-field-wrapper]',
  '[data-field-wrapper]',
  '.form-group',
  '.field-container',
  '.field-row',
  'td',
] as const;

const NON_RENDERER_SELECTOR = [
  'label',
  'button',
  'a',
  'input',
  'select',
  'textarea',
  'small',
  'script',
  'style',
  '[aria-hidden="true"]',
  '.help-block',
  '.form-text',
  '[role="alert"]',
  '[role="status"]',
].join(',');

/**
 * Resolves the smallest host-owned region that represents one logical field.
 * Generated ids are useful evidence, but are never assumed to be stable.
 */
export function getLogicalFieldWrapper(
  name: ZeevFieldName,
  controls = getSemanticFieldCandidates(name),
): HTMLElement | null {
  const scope = getFunctionalFieldScope();
  if (!scope) return null;

  const structuralCandidates = [
    scope.querySelector<HTMLElement>(`#td1${name}`),
    scope.querySelector<HTMLElement>(`#div${name}`),
  ].filter((element): element is HTMLElement => element !== null);
  if (controls.length === 0) return null;
  const containingStructuralCandidate = structuralCandidates.find(
    (element): boolean =>
      controls.some((control): boolean => element.contains(control)),
  );
  if (containingStructuralCandidate) return containingStructuralCandidate;

  const control = controls[0] ?? null;
  if (!control) return null;
  for (const selector of FIELD_WRAPPER_SELECTORS) {
    const wrapper = control.closest<HTMLElement>(selector);
    if (wrapper && scope.contains(wrapper)) return wrapper;
  }

  const parent = control.parentElement;
  return parent &&
    parent !== scope &&
    !parent.matches(ZEEV_SELECTORS.form) &&
    scope.contains(parent)
    ? parent
    : null;
}

function hasOwnReadableText(element: HTMLElement): boolean {
  return Array.from(element.childNodes).some(
    (node: Node): boolean =>
      node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()),
  );
}

function isReadonlyRendererCandidate(
  element: HTMLElement,
  controls: readonly ZeevFieldElement[],
): boolean {
  if (!isElementVisible(element) || element.matches(NON_RENDERER_SELECTOR)) {
    return false;
  }
  if (controls.some((control): boolean => element.contains(control))) {
    return false;
  }

  return hasOwnReadableText(element);
}

function readonlyScalarRenderers(
  wrapper: HTMLElement | null,
  controls: readonly ZeevFieldElement[],
): HTMLElement[] {
  if (!wrapper) return [];

  return Array.from(wrapper.querySelectorAll<HTMLElement>('*')).filter(
    (element): boolean => isReadonlyRendererCandidate(element, controls),
  );
}

function fileCompositeElements(
  scope: HTMLElement,
  name: ZeevFieldName,
): FileCompositeElements {
  const region = scope.querySelector<HTMLElement>(`#div${name}`);
  const cell = scope.querySelector<HTMLElement>(`#td1${name}`);
  const containers = Array.from(
    new Set([region, cell].filter(Boolean)),
  ) as HTMLElement[];
  const downloadButtons = Array.from(
    new Set(
      containers.flatMap((container) =>
        Array.from(
          container.querySelectorAll<HTMLButtonElement>(
            'button[id^="btnDownload_"]',
          ),
        ),
      ),
    ),
  ).filter(isElementVisible);
  const viewerElements = Array.from(
    new Set(
      containers.flatMap((container) =>
        Array.from(container.querySelectorAll<HTMLElement>('a[href]')),
      ),
    ),
  ).filter(isElementVisible);

  return { downloadButtons, viewerElements };
}

export function resolveFieldObservation(
  name: ZeevFieldName,
  access: StageFieldAccess = 'edit',
): ResolvedFieldObservation {
  const scope = getFunctionalFieldScope();
  const semanticControls = getSemanticFieldCandidates(name);
  const primaryControl = selectOperationalField(name, semanticControls);
  const logicalWrapper = scope
    ? getLogicalFieldWrapper(name, semanticControls)
    : null;
  const uploadButton =
    scope?.querySelector<HTMLButtonElement>(`#btnUpload${name}`) ?? null;
  const { downloadButtons, viewerElements } = scope
    ? fileCompositeElements(scope, name)
    : { downloadButtons: [], viewerElements: [] };
  const readonlyRenderers =
    ZEEV_FIELDS[name].structure === 'control'
      ? readonlyScalarRenderers(logicalWrapper, semanticControls)
      : [];
  const semanticCandidates = semanticControls.map(
    (element): ResolvedFieldCandidate => ({
      element,
      role: 'semantic-control',
      visible: isElementVisible(element),
      interactive: isElementInteractive(element),
    }),
  );
  const auxiliaryCandidates: ResolvedFieldCandidate[] = [];

  if (uploadButton) {
    auxiliaryCandidates.push({
      element: uploadButton,
      role: 'upload-button',
      visible: isElementVisible(uploadButton),
      interactive: isElementInteractive(uploadButton),
    });
  }
  downloadButtons.forEach((element: HTMLButtonElement): void => {
    auxiliaryCandidates.push({
      element,
      role: 'download-button',
      visible: isElementVisible(element),
      interactive: isElementInteractive(element),
    });
  });
  viewerElements.forEach((element: HTMLElement): void => {
    auxiliaryCandidates.push({
      element,
      role: 'viewer',
      visible: isElementVisible(element),
      interactive: isElementInteractive(element),
    });
  });
  readonlyRenderers.forEach((element: HTMLElement): void => {
    auxiliaryCandidates.push({
      element,
      role: 'readonly-renderer',
      visible: true,
      interactive: false,
    });
  });

  const candidates = [...semanticCandidates, ...auxiliaryCandidates];
  const isFile = ZEEV_FIELDS[name].structure === 'file-composite';
  const editable =
    access === 'edit' &&
    (auxiliaryCandidates.some(
      ({ role, visible, interactive }): boolean =>
        role === 'upload-button' && visible && interactive,
    ) ||
      semanticCandidates.some(
        ({ visible, interactive }): boolean => visible && interactive,
      ));
  const readable =
    viewerElements.some(isElementInteractive) ||
    downloadButtons.some(isElementInteractive) ||
    readonlyRenderers.length > 0 ||
    semanticCandidates.some(({ visible }): boolean => visible);
  const functional = isFile
    ? access === 'edit'
      ? editable
      : readable
    : access === 'edit'
      ? editable
      : readable;
  const presence: FieldFunctionalPresence = functional
    ? 'functional'
    : candidates.length > 0
      ? 'technical-only'
      : 'absent';

  return {
    name,
    presence,
    logicalElementCount: presence === 'absent' ? 0 : 1,
    candidates,
    semanticControls,
    primaryControl,
    uploadButton,
    downloadButtons,
    viewerElements,
    readonlyRenderers,
    logicalWrapper,
    editable,
    readable,
  };
}
