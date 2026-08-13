import { ZEEV_SELECTORS } from './selectors';
import { isElementVisible } from './field-resolver';
import type { StageContract } from './types';

export type NativeControlContext = 'start' | 'human-task' | 'decision';

export interface NativePrimaryControlContract {
  selector: string;
  id: 'BtnSend' | 'btnFinish';
  label: 'Enviar solicitação' | 'Concluir';
}

export interface NativeStageControlContract {
  context: NativeControlContext;
  regionSelector: typeof ZEEV_SELECTORS.buttons;
  primaryControl: NativePrimaryControlContract | null;
  usesDirectActions: boolean;
}

export interface ResolvedNativeStageControls {
  contract: NativeStageControlContract;
  region: HTMLElement | null;
  primaryControl: HTMLButtonElement | null;
  directActions: readonly HTMLElement[];
}

const START_CONTROL = Object.freeze({
  context: 'start',
  regionSelector: ZEEV_SELECTORS.buttons,
  primaryControl: Object.freeze({
    selector: ZEEV_SELECTORS.sendButton,
    id: 'BtnSend',
    label: 'Enviar solicitação',
  }),
  usesDirectActions: false,
} as const satisfies NativeStageControlContract);

const HUMAN_TASK_CONTROL = Object.freeze({
  context: 'human-task',
  regionSelector: ZEEV_SELECTORS.buttons,
  primaryControl: Object.freeze({
    selector: ZEEV_SELECTORS.finishButton,
    id: 'btnFinish',
    label: 'Concluir',
  }),
  usesDirectActions: false,
} as const satisfies NativeStageControlContract);

const DECISION_CONTROL = Object.freeze({
  context: 'decision',
  regionSelector: ZEEV_SELECTORS.buttons,
  primaryControl: null,
  usesDirectActions: true,
} as const satisfies NativeStageControlContract);

/**
 * Maps the domain stage to the native Zeev control that is operational in that
 * context. Decision stages deliberately have no generic completion control:
 * their direct actions in #buttons are the operational contract.
 */
export function getNativeStageControlContract(
  stage: Pick<StageContract, 'code' | 'decisions'>,
): NativeStageControlContract {
  if (stage.code === 'START') {
    return START_CONTROL;
  }

  return stage.decisions.length > 0 ? DECISION_CONTROL : HUMAN_TASK_CONTROL;
}

function resolveRegion(
  scope: ParentNode,
  selector: string,
): HTMLElement | null {
  if (scope instanceof HTMLElement && scope.matches(selector)) {
    return scope;
  }

  return scope.querySelector<HTMLElement>(selector);
}

/** Resolves native controls without replacing, cloning or mutating Zeev DOM. */
export function resolveNativeStageControls(
  stage: Pick<StageContract, 'code' | 'decisions'>,
  scope: ParentNode = document,
): ResolvedNativeStageControls {
  const contract = getNativeStageControlContract(stage);
  const region = resolveRegion(scope, contract.regionSelector);
  const primaryCandidate = contract.primaryControl
    ? region?.querySelector<HTMLElement>(contract.primaryControl.selector) ?? null
    : null;
  const primaryControl =
    primaryCandidate instanceof HTMLButtonElement ? primaryCandidate : null;
  const directActions =
    contract.usesDirectActions && region
      ? Array.from(
          region.querySelectorAll<HTMLElement>(
            ZEEV_SELECTORS.directButtonActions,
          ),
        ).filter(isElementVisible)
      : [];

  return { contract, region, primaryControl, directActions };
}
