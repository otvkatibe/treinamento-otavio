import { observeNativeAction } from './adapter';
import { STAGE_CONTRACTS } from './domain-contracts';
import { resolveFieldObservation } from './field-resolver';
import { resolveNativeStageControls } from './native-controls';
import { ZEEV_SELECTORS } from './selectors';
import type { StageCode, StageContract, ZeevFieldName } from './types';

const ENHANCED_ATTRIBUTE = 'data-zeev-fieb-enhanced';
const ENHANCED_VALUE = 'native';

export interface NativeEnhancementSummary {
  root: HTMLElement | null;
  fieldShells: readonly HTMLElement[];
  readonlyRenderers: readonly HTMLElement[];
  fileShells: readonly HTMLElement[];
  actionRegion: HTMLElement | null;
  actions: readonly HTMLElement[];
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

/** Removes only attributes owned by this module; native nodes and handlers stay intact. */
export function resetNativeEnhancements(scope: ParentNode = document): void {
  scope
    .querySelectorAll<HTMLElement>(`[${ENHANCED_ATTRIBUTE}="${ENHANCED_VALUE}"]`)
    .forEach((element: HTMLElement): void => {
      element.removeAttribute(ENHANCED_ATTRIBUTE);
      element.removeAttribute('data-zeev-fieb-role');
      element.removeAttribute('data-zeev-fieb-field');
      element.removeAttribute('data-zeev-fieb-access');
      element.removeAttribute('data-zeev-fieb-action');
      element.removeAttribute('data-zeev-fieb-action-label');
    });
  const roots = scope instanceof HTMLElement && scope.matches(ZEEV_SELECTORS.root)
    ? [scope]
    : Array.from(scope.querySelectorAll<HTMLElement>(ZEEV_SELECTORS.root));
  roots.forEach((root: HTMLElement): void => {
    root.removeAttribute('data-zeev-fieb-ui');
    root.removeAttribute('data-zeev-fieb-stage');
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
    resetNativeEnhancements(root ?? document);
    return {
      root,
      fieldShells: [],
      readonlyRenderers: [],
      fileShells: [],
      actionRegion: null,
      actions: [],
    };
  }

  resetNativeEnhancements(root);
  root.setAttribute('data-zeev-fieb-ui', 'true');
  root.setAttribute('data-zeev-fieb-stage', stageCode);

  const stage = STAGE_CONTRACTS[stageCode];
  const fieldSummary = enhanceFields(stage);
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

  return {
    root,
    ...fieldSummary,
    actionRegion,
    actions,
  };
}
