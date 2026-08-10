import { zeevAdapter } from './adapter';
import { ZEEV_FIELDS } from './fields';
import { ZEEV_SELECTORS } from './selectors';
import type {
  DiagnosticCheck,
  DiagnosticStatus,
  FieldDiagnostic,
  RadioGroupDiagnostic,
  TaskContext,
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

function status(passed: boolean): DiagnosticStatus {
  return passed ? 'PASS' : 'FAIL';
}

function check(
  id: string,
  label: string,
  passed: boolean,
  expected: DiagnosticCheck['expected'],
  observed: DiagnosticCheck['observed'],
): DiagnosticCheck {
  return {
    id,
    label,
    status: status(passed),
    expected,
    observed,
  };
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

function taskMatches(
  runtimeTask: TaskContext | null,
  observedTask: TaskContext | null,
): boolean {
  return (
    runtimeTask?.code === observedTask?.code &&
    runtimeTask?.title === observedTask?.title
  );
}

export function runDiagnostics(): ZeevFiebDiagnostics {
  const runtime = window.__ZEEV_FIEB__;
  const observedTask = zeevAdapter.getCurrentTask();
  const mounts = Array.from(
    document.querySelectorAll<HTMLElement>('#zeev-fieb-root'),
  );
  const mount = mounts[0] ?? null;
  const containerForm = zeevAdapter
    .getRoot()
    ?.querySelector<HTMLElement>(ZEEV_SELECTORS.containerForm) ?? null;
  const fields = (Object.keys(ZEEV_FIELDS) as ZeevFieldName[]).map(
    fieldDiagnostic,
  );
  const radioGroups = RADIO_GROUP_NAMES.map(radioGroupDiagnostic);
  const sendButton = zeevAdapter.getSendButton();
  const mountIsBeforeForm =
    mount !== null && mount.nextElementSibling === containerForm;
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
      'Tarefa reconhecida',
      observedTask?.code !== null && observedTask?.code !== undefined,
      'T0-T5',
      observedTask?.code ?? null,
    ),
    check(
      'task.synchronized',
      'Contexto do lifecycle sincronizado com o DOM',
      taskMatches(runtime?.currentTask ?? null, observedTask),
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
      'mount.position',
      'Mount imediatamente antes de #ContainerForm',
      mountIsBeforeForm,
      'ContainerForm',
      mount?.nextElementSibling?.id ?? null,
    ),
  ];

  for (const field of fields) {
    const isRadioGroup = ZEEV_FIELDS[field.name].structure === 'radio-group';
    const expectedCount = isRadioGroup ? 'uma ou mais opções' : 1;
    const countIsValid = isRadioGroup
      ? field.elementCount > 0
      : field.elementCount === 1;
    checks.push(
      check(
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
    checks.push(
      check(
        `field.${name}.type`,
        `Campo ${name} usa input text`,
        field?.tagName === 'INPUT' && field.inputType === 'text',
        'INPUT[type=text]',
        field ? `${field.tagName ?? 'null'}[type=${field.inputType ?? 'null'}]` : null,
      ),
      check(
        `field.${name}.boxSizing`,
        `Campo ${name} usa border-box`,
        field?.boxSizing === 'border-box',
        'border-box',
        field?.boxSizing ?? null,
      ),
      check(
        `field.${name}.height`,
        `Campo ${name} possui altura compacta`,
        field?.height === '40px',
        '40px',
        field?.height ?? null,
      ),
      check(
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
      check(
        `radio.${group.name}.single`,
        `Grupo ${group.name} possui no máximo uma seleção`,
        group.optionCount > 0 && group.checkedCount <= 1,
        '0 ou 1',
        group.checkedCount,
      ),
    );
  }

  checks.push(
    check(
      'sendButton.native',
      'Botão nativo #BtnSend preservado',
      sendButton instanceof HTMLButtonElement && sendButton.id === 'BtnSend',
      'BUTTON#BtnSend',
      sendButton ? `${sendButton.tagName}#${sendButton.id}` : null,
    ),
  );

  const overallStatus = status(
    checks.every((diagnosticCheck) => diagnosticCheck.status === 'PASS'),
  );

  return {
    status: overallStatus,
    generatedAt: new Date().toISOString(),
    version: runtime?.version ?? null,
    initialized: runtime?.initialized ?? false,
    task: {
      code: observedTask?.code ?? null,
      title: observedTask?.title ?? null,
      known: observedTask?.code !== null && observedTask?.code !== undefined,
    },
    rootCount: mounts.length,
    mountBefore: mount?.nextElementSibling?.id ?? null,
    fields,
    radioGroups,
    sendButton: {
      present: sendButton !== null,
      tagName: sendButton?.tagName ?? null,
      id: sendButton?.id ?? null,
      disabled: sendButton?.disabled ?? null,
    },
    checks,
  };
}
