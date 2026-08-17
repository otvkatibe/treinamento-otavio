import {
  canonicalizeNativeActionLabel,
  observeNativeAction,
  zeevAdapter,
} from './adapter';
import { STAGE_CONTRACTS } from './domain-contracts';
import { ZEEV_FIELDS } from './fields';
import { resolveFieldObservation } from './field-resolver';
import { resolveNativeStageControls } from './native-controls';
import { ZEEV_SELECTORS } from './selectors';
import type {
  DiagnosticCheck,
  DiagnosticStatus,
  FieldDiagnostic,
  FormSection,
  NativeActionDiagnostic,
  NativeControlDiagnostic,
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

function fieldDiagnostic(
  name: ZeevFieldName,
  access: 'hidden' | 'read' | 'edit' = 'edit',
): FieldDiagnostic {
  const observation = resolveFieldObservation(name, access);
  const element = observation.primaryControl;
  const styles = element ? window.getComputedStyle(element) : null;
  const functionalCandidateCount = observation.candidates.filter(
    ({ visible }): boolean => visible,
  ).length;

  return {
    name,
    access,
    present: observation.presence === 'functional',
    presence: observation.presence,
    elementCount: observation.logicalElementCount,
    candidateCount: observation.candidates.length,
    functionalCandidateCount,
    technicalCandidateCount:
      observation.candidates.length - functionalCandidateCount,
    uploadButtonPresent:
      observation.uploadButton !== null &&
      observation.candidates.some(
        ({ role, visible }): boolean => role === 'upload-button' && visible,
      ),
    downloadButtonCount: observation.downloadButtons.length,
    viewerCount: observation.viewerElements.length,
    readonlyRendererCount: observation.readonlyRenderers.length,
    editable: observation.editable,
    readable: observation.readable,
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
  const sections = runtime?.sections ?? zeevAdapter.getSections();
  const fields = (Object.keys(ZEEV_FIELDS) as ZeevFieldName[]).map(
    (name: ZeevFieldName): FieldDiagnostic =>
      fieldDiagnostic(name, stepContract?.fields[name].access ?? 'hidden'),
  );
  const radioGroups = RADIO_GROUP_NAMES.map(radioGroupDiagnostic);
  const sendButton = zeevAdapter.getSendButton();
  const resolvedNativeControls = stepContract
    ? resolveNativeStageControls(stepContract, root ?? document)
    : null;
  const primaryControl = resolvedNativeControls?.primaryControl ?? null;
  const primaryObservation = primaryControl
    ? observeNativeAction(primaryControl)
    : null;
  const primaryContract = resolvedNativeControls?.contract.primaryControl ?? null;
  const nativeControl: NativeControlDiagnostic = {
    context: resolvedNativeControls?.contract.context ?? null,
    expectedId: primaryContract?.id ?? null,
    expectedLabel: primaryContract?.label ?? null,
    present: primaryControl !== null,
    tagName: primaryControl?.tagName ?? null,
    id: primaryControl?.id ?? null,
    rawLabel: primaryObservation?.rawLabel ?? null,
    canonicalLabel: primaryObservation?.label ?? null,
    visible: primaryObservation?.visible ?? false,
    disabled: primaryObservation?.disabled ?? null,
  };
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
  const visualRoleCount = (role: string): number =>
    document.querySelectorAll(`[data-zeev-fieb-role="${role}"]`).length;
  const visualExperience = {
    experienceShellCount: visualRoleCount('process-page'),
    stepperCount: visualRoleCount('process-stepper'),
    mainColumnCount:
      visualRoleCount('main-column') || visualRoleCount('task-card'),
    asideCount: visualRoleCount('aside-column'),
    taskCardCount: visualRoleCount('task-card'),
    nativeActionRegionCount:
      visualRoleCount('native-action-region') +
      visualRoleCount('decision-panel'),
    fieldSectionCount:
      visualRoleCount('field-section') +
      visualRoleCount('field-shell') +
      visualRoleCount('file-shell'),
    readonlyScalarRendererCount: visualRoleCount('readonly-scalar-renderer'),
    fileShellCount: visualRoleCount('file-shell'),
    decisionPanelCount: visualRoleCount('decision-panel'),
    hostSidebarCount: visualRoleCount('host-sidebar'),
    testEnvironmentBarCount: visualRoleCount('test-environment-bar'),
    messageRegionCount: visualRoleCount('start-messages'),
    attachmentRegionCount: visualRoleCount('start-attachments'),
    uploadModalCount: visualRoleCount('start-upload-modal'),
  };
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
    conditionalCheck(
      observedTask?.code != null,
      'visual.experienceShell',
      'Shell visual da experiÃªncia presente',
      visualExperience.experienceShellCount === 1,
      1,
      visualExperience.experienceShellCount,
    ),
    conditionalCheck(
      observedTask?.code != null,
      'visual.stepper',
      'Stepper visual presente',
      visualExperience.stepperCount === 1,
      1,
      visualExperience.stepperCount,
    ),
    conditionalCheck(
      observedTask?.code != null,
      'visual.mainColumn',
      'Coluna principal presente',
      visualExperience.mainColumnCount === 1,
      1,
      visualExperience.mainColumnCount,
    ),
    conditionalCheck(
      observedTask?.code != null,
      'visual.aside',
      'Resumo lateral presente',
      visualExperience.asideCount === 1,
      1,
      visualExperience.asideCount,
    ),
    conditionalCheck(
      observedTask?.code != null,
      'visual.taskCard',
      'Card da tarefa presente',
      visualExperience.taskCardCount === 1,
      1,
      visualExperience.taskCardCount,
    ),
    conditionalCheck(
      resolvedNativeControls?.region != null,
      'visual.nativeActionRegion',
      'RegiÃ£o de aÃ§Ãµes nativas integrada',
      visualExperience.nativeActionRegionCount === 1,
      1,
      visualExperience.nativeActionRegionCount,
    ),
  ];

  for (const field of fields) {
    const fieldRule = stepContract?.fields[field.name];
    const required = fieldRule?.presence === 'required';
    const optional = fieldRule?.presence === 'optional';
    const countIsValid = field.elementCount === 1 && field.present;
    checks.push(
      conditionalCheck(
        required || (optional && field.present),
        `field.${field.name}.present`,
        `Campo ${field.name} presente`,
        countIsValid,
        'functional',
        field.presence,
      ),
    );
  }

  const hiddenReadonlyScalars = fields.filter(
    (field): boolean =>
      field.access === 'read' &&
      field.inputType === 'hidden' &&
      ZEEV_FIELDS[field.name].structure === 'control',
  );
  checks.push(
    conditionalCheck(
      hiddenReadonlyScalars.length > 0,
      'visual.readonlyScalarRenderer',
      'Scalars readonly possuem renderer visual associado',
      hiddenReadonlyScalars.every(
        ({ readonlyRendererCount }): boolean => readonlyRendererCount > 0,
      ),
      hiddenReadonlyScalars.length,
      hiddenReadonlyScalars.filter(
        ({ readonlyRendererCount }): boolean => readonlyRendererCount > 0,
      ).length,
    ),
    conditionalCheck(
      visualExperience.fieldSectionCount > 0,
      'visual.fieldSections',
      'SeÃ§Ãµes de campo nativas observadas',
      true,
      '>= 1',
      visualExperience.fieldSectionCount,
    ),
    conditionalCheck(
      visualExperience.fileShellCount > 0,
      'visual.fileShell',
      'Shell de arquivo observado',
      true,
      '>= 1',
      visualExperience.fileShellCount,
    ),
    conditionalCheck(
      (stepContract?.decisions.length ?? 0) > 0,
      'visual.decisionPanel',
      'Painel de decisÃ£o integrado',
      visualExperience.decisionPanelCount === 1,
      1,
      visualExperience.decisionPanelCount,
    ),
    conditionalCheck(
      observedTask?.code === 'START' && visualExperience.hostSidebarCount > 0,
      'visual.start.hostSidebar',
      'Navegação lateral do START integrada',
      visualExperience.hostSidebarCount === 1,
      1,
      visualExperience.hostSidebarCount,
    ),
    conditionalCheck(
      observedTask?.code === 'START' && visualExperience.testEnvironmentBarCount > 0,
      'visual.start.testEnvironmentBar',
      'Faixa de ambiente de teste integrada',
      visualExperience.testEnvironmentBarCount === 1,
      1,
      visualExperience.testEnvironmentBarCount,
    ),
    conditionalCheck(
      observedTask?.code === 'START' && visualExperience.messageRegionCount > 0,
      'visual.start.messages',
      'Mensagens do START integradas',
      visualExperience.messageRegionCount === 1,
      1,
      visualExperience.messageRegionCount,
    ),
    conditionalCheck(
      observedTask?.code === 'START' && visualExperience.attachmentRegionCount > 0,
      'visual.start.attachments',
      'Anexos do START integrados',
      visualExperience.attachmentRegionCount === 1,
      1,
      visualExperience.attachmentRegionCount,
    ),
    conditionalCheck(
      observedTask?.code === 'START' && visualExperience.uploadModalCount > 0,
      'visual.start.uploadModal',
      'Modal Enviar arquivos integrado',
      visualExperience.uploadModalCount === 1,
      1,
      visualExperience.uploadModalCount,
    ),
  );

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

  if (primaryContract) {
    const canonicalExpectedLabel = canonicalizeNativeActionLabel(
      primaryContract.label,
    );
    checks.push(
      check(
        primaryContract.id === 'BtnSend'
          ? 'sendButton.native'
          : 'completionButton.native',
        `Controle nativo ${primaryContract.label} preservado`,
        primaryControl !== null &&
          primaryControl.id === primaryContract.id &&
          primaryObservation?.label === canonicalExpectedLabel &&
          primaryObservation.visible,
        `${primaryContract.id}:${canonicalExpectedLabel}`,
        primaryControl
          ? `${primaryControl.id}:${primaryObservation?.label ?? ''}`
          : null,
      ),
    );
  }

  const directActionObservations =
    resolvedNativeControls?.directActions.map(observeNativeAction) ?? [];
  const actions: NativeActionDiagnostic[] = (stepContract?.decisions ?? []).map(
    ({ zeevLabel }): NativeActionDiagnostic => {
      const canonicalLabel = canonicalizeNativeActionLabel(zeevLabel);
      const observation = directActionObservations
        .find(({ label }): boolean => label === canonicalLabel);
      const element = observation?.element ?? null;

      return {
        label: canonicalLabel,
        canonicalLabel,
        rawLabel: observation?.rawLabel ?? null,
        present: element !== null,
        tagName: element?.tagName ?? null,
        id: element?.id || null,
        visible: observation?.visible ?? false,
        disabled: observation?.disabled ?? null,
      };
    },
  );

  actions.forEach((action: NativeActionDiagnostic): void => {
    checks.push(
      check(
        `action.${action.label}`,
        `Ação nativa ${action.label} disponível`,
        action.present && action.visible,
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
    bootstrapStatus: runtime?.bootstrapStatus ?? null,
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
    sections,
    fields,
    radioGroups,
    nativeControl,
    visualExperience,
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
