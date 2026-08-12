import { zeevAdapter } from './adapter';
import { STAGE_CONTRACTS } from './domain-contracts';
import { ZEEV_FIELDS } from './fields';
import { ZEEV_SELECTORS } from './selectors';
import type {
  DiagnosticCheck,
  DiagnosticStatus,
  FieldDiagnostic,
  NativeActionDiagnostic,
  RadioGroupDiagnostic,
  ProcessStepContext,
  ZeevFiebDiagnostics,
  ZeevFieldElement,
  ZeevFieldName,
} from './types';

const TEXT_FIELD_NAMES = [
  'nomeCompleto',
  'cpfCliente',
  'nacionalidade',
  'profissao',
  'numeroDocumento',
] as const satisfies readonly ZeevFieldName[];

const RADIO_GROUP_NAMES = [
  'estadoCivil',
  'tipoDocumento',
] as const satisfies readonly RadioGroupDiagnostic['name'][];

function status(passed: boolean): Exclude<DiagnosticStatus, 'SKIP/N/A'> {
  return passed ? 'PASS' : 'FAIL';
}

function check(
  id: string,
  label: string,
  passed: boolean,
  expected: DiagnosticCheck['expected'],
  observed: DiagnosticCheck['observed'],
): DiagnosticCheck {
  return { id, label, status: status(passed), expected, observed };
}

function skippedCheck(
  id: string,
  label: string,
  expected: DiagnosticCheck['expected'],
  observed: DiagnosticCheck['observed'],
): DiagnosticCheck {
  return { id, label, status: 'SKIP/N/A', expected, observed };
}

function conditionalCheck(
  applies: boolean,
  id: string,
  label: string,
  passed: boolean,
  expected: DiagnosticCheck['expected'],
  observed: DiagnosticCheck['observed'],
): DiagnosticCheck {
  return applies
    ? check(id, label, passed, expected, observed)
    : skippedCheck(id, label, 'N/A para a tarefa atual', observed);
}

function inputType(element: ZeevFieldElement | null): string | null {
  return element instanceof HTMLInputElement ? element.type : null;
}

function fieldDiagnostic(name: ZeevFieldName): FieldDiagnostic {
  const elements = zeevAdapter.getFields(name);
  const element = elements[0] ?? null;
  const styles = element ? window.getComputedStyle(element) : null;

  return {
    name,
    present: element !== null,
    elementCount: elements.length,
    tagName: element?.tagName ?? null,
    inputType: inputType(element),
    fieldFormat: element?.getAttribute('data-fieldformat') ?? null,
    height: styles?.height ?? null,
    boxSizing: styles?.boxSizing ?? null,
    maxWidth: styles?.maxWidth ?? null,
  };
}

function radioGroupDiagnostic(
  name: RadioGroupDiagnostic['name'],
): RadioGroupDiagnostic {
  const options = zeevAdapter.getFields(name).filter(
    (element): element is HTMLInputElement =>
      element instanceof HTMLInputElement && element.type === 'radio',
  );
  const checked = options.filter((option) => option.checked);

  return {
    name,
    optionCount: options.length,
    checkedCount: checked.length,
    selectedValue: checked[0]?.value ?? null,
  };
}

function stepContextsMatch(
  runtimeTask: ProcessStepContext | null,
  observedTask: ProcessStepContext | null,
): boolean {
  return (
    runtimeTask?.code === observedTask?.code &&
    runtimeTask?.title === observedTask?.title
  );
}

export function runDiagnostics(): ZeevFiebDiagnostics {
  const runtime = window.__ZEEV_FIEB__;
  const observedTask = zeevAdapter.getCurrentTask();
  const stepContract = observedTask?.code
    ? STAGE_CONTRACTS[observedTask.code]
    : null;
  const mounts = Array.from(
    document.querySelectorAll<HTMLElement>('#zeev-fieb-root'),
  );
  const mount = mounts[0] ?? null;
  const root = zeevAdapter.getRoot();
  const containerForm = root?.querySelector<HTMLElement>(
    ZEEV_SELECTORS.containerForm,
  ) ?? null;
  const controllers = root?.querySelector<HTMLElement>(
    ZEEV_SELECTORS.controllers,
  ) ?? null;
  const fields = (Object.keys(ZEEV_FIELDS) as ZeevFieldName[]).map(
    fieldDiagnostic,
  );
  const radioGroups = RADIO_GROUP_NAMES.map(radioGroupDiagnostic);
  const sendButton = zeevAdapter.getSendButton();
  const mountIsBeforeForm =
    mount !== null && mount.nextElementSibling === containerForm;
  const islandElements = mount
    ? Array.from(
        mount.querySelectorAll<HTMLElement>('[data-zeev-fieb-island="true"]'),
      )
    : [];
  const islandIsIntact =
    runtime?.reactRoot != null &&
    runtime.reactMountElement === mount &&
    islandElements.length === 1 &&
    runtime.reactContentNodes.length > 0 &&
    runtime.reactContentNodes.every(
      (node: Node): boolean => node.isConnected && node.parentNode === mount,
    );
  const checks: DiagnosticCheck[] = [
    check(
      'runtime.initialized',
      'Runtime inicializado',
      runtime?.initialized === true,
      true,
      runtime?.initialized ?? false,
    ),
    check(
      'task.known',
      'Etapa reconhecida',
      observedTask?.code != null,
      'START ou T1-T5',
      observedTask?.code ?? null,
    ),
    check(
      'task.synchronized',
      'Contexto do lifecycle sincronizado com o DOM',
      stepContextsMatch(runtime?.currentTask ?? null, observedTask),
      observedTask?.code ?? null,
      runtime?.currentTask?.code ?? null,
    ),
    check(
      'mount.unique',
      'Mount point único',
      mounts.length === 1,
      1,
      mounts.length,
    ),
    check(
      'mount.connected',
      'Mount point conectado ao DOM',
      mount?.isConnected === true,
      true,
      mount?.isConnected ?? false,
    ),
    check(
      'mount.position',
      'Mount imediatamente antes de #ContainerForm',
      mountIsBeforeForm,
      'ContainerForm',
      mount?.nextElementSibling?.id ?? null,
    ),
    check(
      'island.integrity',
      'Integridade da React Island',
      islandIsIntact,
      'React root associado ao mount e island única conectada',
      islandElements.length,
    ),
  ];

  for (const field of fields) {
    const fieldRule = stepContract?.fields[field.name];
    const required = fieldRule?.presence === 'required';
    const optional = fieldRule?.presence === 'optional';
    const isRadioGroup = ZEEV_FIELDS[field.name].structure === 'radio-group';
    const expectedCount = isRadioGroup ? 'uma ou mais opções' : 1;
    const countIsValid = isRadioGroup
      ? field.elementCount > 0
      : field.elementCount === 1;
    checks.push(
      conditionalCheck(
        required || (optional && field.present),
        `field.${field.name}.present`,
        `Campo ${field.name} presente`,
        countIsValid,
        expectedCount,
        field.elementCount,
      ),
    );
  }

  for (const name of TEXT_FIELD_NAMES) {
    const field = fields.find((candidate) => candidate.name === name);
    const applies = field?.present === true;
    checks.push(
      conditionalCheck(
        applies,
        `field.${name}.type`,
        `Campo ${name} usa input text`,
        field?.tagName === 'INPUT' && field.inputType === 'text',
        'INPUT[type=text]',
        field ? `${field.tagName ?? 'null'}[type=${field.inputType ?? 'null'}]` : null,
      ),
      conditionalCheck(
        applies,
        `field.${name}.boxSizing`,
        `Campo ${name} usa border-box`,
        field?.boxSizing === 'border-box',
        'border-box',
        field?.boxSizing ?? null,
      ),
      conditionalCheck(
        applies,
        `field.${name}.height`,
        `Campo ${name} possui altura compacta`,
        field?.height === '40px',
        '40px',
        field?.height ?? null,
      ),
      conditionalCheck(
        applies,
        `field.${name}.maxWidth`,
        `Campo ${name} respeita a largura do container`,
        field?.maxWidth === '100%',
        '100%',
        field?.maxWidth ?? null,
      ),
    );
  }

  for (const group of radioGroups) {
    checks.push(
      conditionalCheck(
        group.optionCount > 0,
        `radio.${group.name}.single`,
        `Grupo ${group.name} possui no máximo uma seleção`,
        group.checkedCount <= 1,
        '0 ou 1',
        group.checkedCount,
      ),
    );
  }

  const sendButtonApplies =
    observedTask?.code === 'START' ||
    (observedTask?.code != null && controllers !== null);
  checks.push(
    conditionalCheck(
      sendButtonApplies,
      'sendButton.native',
      'Botão nativo #BtnSend preservado',
      sendButton instanceof HTMLButtonElement && sendButton.id === 'BtnSend',
      'BUTTON#BtnSend',
      sendButton ? `${sendButton.tagName}#${sendButton.id}` : null,
    ),
  );

  const actions: NativeActionDiagnostic[] = (stepContract?.decisions ?? []).map(
    ({ zeevLabel }): NativeActionDiagnostic => {
      const element = zeevAdapter.getNativeAction(zeevLabel);
      const disabled =
        element instanceof HTMLButtonElement || element instanceof HTMLInputElement
          ? element.disabled
          : element?.getAttribute('aria-disabled') === 'true';

      return {
        label: zeevLabel,
        present: element !== null,
        tagName: element?.tagName ?? null,
        disabled: element ? disabled : null,
      };
    },
  );

  actions.forEach((action: NativeActionDiagnostic): void => {
    checks.push(
      check(
        `action.${action.label}`,
        `Ação nativa ${action.label} disponível`,
        action.present,
        action.label,
        action.present ? action.label : null,
      ),
    );
  });

  const failedChecks = checks.filter(
    ({ status: checkStatus }) => checkStatus === 'FAIL',
  );
  const passed = failedChecks.length === 0;

  return {
    passed,
    status: status(passed),
    generatedAt: new Date().toISOString(),
    version: runtime?.version ?? null,
    initialized: runtime?.initialized ?? false,
    task: {
      code: observedTask?.code ?? null,
      title: observedTask?.title ?? null,
      known: observedTask?.code != null,
    },
    rootCount: mounts.length,
    mountBefore: mount?.nextElementSibling?.id ?? null,
    mount: {
      count: mounts.length,
      id: mount?.id ?? null,
      connected: mount?.isConnected ?? false,
      before: mount?.nextElementSibling?.id ?? null,
    },
    fields,
    radioGroups,
    sendButton: {
      present: sendButton !== null,
      tagName: sendButton?.tagName ?? null,
      id: sendButton?.id ?? null,
      disabled: sendButton?.disabled ?? null,
    },
    actions,
    checks,
    failedChecks,
  };
}
