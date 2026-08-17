import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  enhanceNativeExperience,
  resetNativeEnhancements,
} from '../native-enhancements';
import {
  REAL_SHARED_ANCESTOR_MAP,
  sharedHumanTaskMarkup,
  type NativeAncestorRecord,
} from './fixtures/shared-human-task.fixture';

type ObservableAncestorRecord = Omit<NativeAncestorRecord, 'layoutRole'>;

function renderSharedTask(): void {
  document.body.innerHTML = sharedHumanTaskMarkup();
}

function ancestorChain(
  selector: string,
  cardSelector: string,
): ObservableAncestorRecord[] {
  const start = document.querySelector<HTMLElement>(selector);
  const card = document.querySelector<HTMLElement>(cardSelector);
  if (!start || !card) throw new Error(`Cadeia ausente: ${selector} → ${cardSelector}`);
  const chain: ObservableAncestorRecord[] = [];
  let current: HTMLElement | null = start;
  while (current) {
    chain.push({
      tag: current.tagName,
      id: current.id,
      classes: current.className,
      display: current.style.display,
      width: current.style.width,
      parentId: current.parentElement?.id ?? '',
    });
    if (current === card) break;
    current = current.parentElement;
  }
  return chain;
}

function observableMap(
  records: readonly NativeAncestorRecord[],
): ObservableAncestorRecord[] {
  return records.map(({ layoutRole: _layoutRole, ...record }) => record);
}

afterEach((): void => {
  resetNativeEnhancements(document);
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('regressão estrutural das regiões compartilhadas no host real', () => {
  it('registra as cadeias nativas e os primeiros ancestrais restritivos observados', () => {
    renderSharedTask();

    expect(ancestorChain('#fileOrder', '#containerFiles')).toEqual(
      observableMap(REAL_SHARED_ANCESTOR_MAP.fileOrder),
    );
    expect(ancestorChain('#select-files', '#containerFiles')).toEqual(
      observableMap(REAL_SHARED_ANCESTOR_MAP.filePicker),
    );
    expect(ancestorChain('#history-event-1', '#containerHistory')).toEqual(
      observableMap(REAL_SHARED_ANCESTOR_MAP.historyItem),
    );
    expect(
      REAL_SHARED_ANCESTOR_MAP.fileOrder.find(
        ({ layoutRole }) => layoutRole === 'first-horizontal-composition',
      )?.id,
    ).toBe('native-file-layout');
    expect(
      REAL_SHARED_ANCESTOR_MAP.historyEventLayout.find(
        ({ layoutRole }) => layoutRole === 'first-horizontal-composition',
      )?.id,
    ).toBe('history-event-1');
  });

  it('verticaliza a row nativa de anexos e preserva controles, options e listeners', () => {
    renderSharedTask();
    const picker = document.querySelector<HTMLInputElement>('#shared-file-input');
    const fileAction = document.querySelector<HTMLButtonElement>('#select-files');
    const sort = document.querySelector<HTMLSelectElement>('#fileOrder');
    const viewAll = document.querySelector<HTMLAnchorElement>('#view-all-files');
    const onFileAction = vi.fn();
    const onSort = vi.fn();
    const onViewAll = vi.fn((event: Event): void => event.preventDefault());
    fileAction?.addEventListener('click', onFileAction);
    sort?.addEventListener('change', onSort);
    viewAll?.addEventListener('click', onViewAll);

    const summary = enhanceNativeExperience('T1');

    expect(summary.sharedFileAction).toBe(fileAction);
    expect(summary.sharedSortSelect).toBe(sort);
    expect(summary.sharedViewAllAction).toBe(viewAll);
    expect(document.querySelector('#native-files-body')).toHaveClass(
      '!flex',
      '!flex-col',
      '!w-full',
      '!min-w-0',
    );
    expect(document.querySelector('#native-file-layout')).toHaveClass(
      '!m-0',
      '!flex',
      '!flex-col',
      '!w-full',
      '!min-w-0',
    );
    expect(document.querySelector('#native-file-picker-column')).toHaveClass(
      '!w-full',
      '!min-w-0',
      '!flex-none',
    );
    expect(document.querySelector('#native-file-order-column')).toHaveClass(
      '!w-full',
      '!min-w-0',
      '!flex-none',
    );
    expect(document.querySelector('#native-file-order-group')).toHaveClass(
      '!grid',
      '!w-full',
      '!min-w-0',
    );
    expect(sort).toHaveClass(
      'box-border',
      '!block',
      '!w-full',
      '!max-w-full',
      '!min-w-0',
    );
    expect(document.querySelector('#native-view-all-row')).toHaveClass(
      '!w-full',
      '!min-w-0',
    );
    expect(document.querySelector('#native-view-all-column')).toHaveClass(
      '!w-full',
      '!min-w-0',
    );

    fileAction?.click();
    if (sort) {
      sort.value = 'date-desc';
      sort.dispatchEvent(new Event('change'));
    }
    viewAll?.click();
    expect(onFileAction).toHaveBeenCalledOnce();
    expect(onSort).toHaveBeenCalledOnce();
    expect(onViewAll).toHaveBeenCalledOnce();
    expect(document.querySelector('#shared-file-input')).toBe(picker);
    expect(document.querySelector('#fileOrder')).toBe(sort);
    expect(Array.from(sort?.options ?? []).map(({ value }) => value)).toEqual([
      'date-asc',
      'date-desc',
    ]);
  });

  it('aplica grid no .row[data-id] do histórico, avatar de 40 px, 4 blocos na segunda coluna e badge inline-flex w-fit sem w-full', () => {
    renderSharedTask();

    const summary = enhanceNativeExperience('T1');

    expect(summary.sharedHistoryItems).toHaveLength(2);
    expect(document.querySelector('#containerHistoryRender')).toHaveClass(
      '!block',
      '!w-full',
      '!min-w-0',
    );
    summary.sharedHistoryItems.forEach((item, index): void => {
      const suffix = String(index + 1);
      expect(item).toBe(document.querySelector(`#history-event-${suffix}`));
      expect(item).toHaveClass(
        '!grid',
        '!m-0',
        '!w-full',
        '!max-w-full',
        '!min-w-0',
        'grid-cols-[2.5rem_minmax(0,1fr)]',
        'items-start',
        'gap-x-3',
        'gap-y-1',
      );

      // Coluna 1: Avatar com largura fixa de 2.5rem (40 px)
      const avatarCol = item.querySelector('.avatar');
      expect(avatarCol).toHaveClass(
        'col-start-1',
        '!block',
        '!w-10',
        '!min-w-10',
        '!max-w-10',
        '!flex-none',
        'self-start',
      );
      const userPhoto = item.querySelector('.user-photo');
      expect(userPhoto).toHaveClass('flex', 'h-10', 'w-10', 'shrink-0');

      // Coluna 2: 4 blocos informativos utilizando toda a largura útil com min-w-0
      const person = item.querySelector('.col-md-3');
      expect(person).toHaveClass(
        'col-start-2',
        '!block',
        '!w-full',
        '!max-w-full',
        '!min-w-0',
        'break-words',
      );

      const activity = item.querySelector('.col.small');
      expect(activity).toHaveClass(
        'col-start-2',
        '!block',
        '!w-full',
        '!max-w-full',
        '!min-w-0',
        'break-words',
      );

      const date = item.querySelector('.col-md-2.small');
      expect(date).toHaveClass(
        'col-start-2',
        '!flex',
        '!w-full',
        '!max-w-full',
        '!min-w-0',
      );

      const statusCol = item.querySelector('.col-2:not(.avatar)');
      expect(statusCol).toHaveClass(
        'col-start-2',
        '!flex',
        '!w-full',
        '!max-w-full',
        '!min-w-0',
      );

      // Badge: inline-flex w-fit sem w-full
      const badge = item.querySelector('span.badge.badge-light-secondary');
      expect(badge).toHaveClass(
        'inline-flex',
        'w-fit',
        'max-w-full',
        'shrink-0',
        'whitespace-nowrap',
      );
      expect(badge).not.toHaveClass('w-full');
      expect(badge).not.toHaveClass('!w-full');
    });
  });

  it('descobre eventos do histórico por prioridade (lista conhecida, estrutural, fallback data/hora)', () => {
    // 1. Cenário: Lista conhecida
    renderSharedTask();
    let summary = enhanceNativeExperience('T1');
    expect(summary.sharedHistoryItems).toHaveLength(2);

    // 2. Cenário: Sem lista conhecida, mas com itens estruturais conhecidos
    resetNativeEnhancements(document);
    document.body.innerHTML = `
      <main id="containerRequest">
        <header class="page-title"><h1>T02 - Validar o cadastro</h1></header>
        <section id="ContainerForm"><table id="FrmExecute"><tbody></tbody></table></section>
        <aside class="native-auxiliary-column">
          <section id="containerHistory" class="card">
            <h3>HISTÓRICO</h3>
            <div class="card-body">
              <div class="list-group-item" id="structural-item-1">
                <div class="row">
                  <div class="col-auto avatar"><div class="user-photo">OK</div></div>
                  <div class="col-md-3 person-name">User 1</div>
                  <div class="col small activity-name">Atividade 1</div>
                  <div class="col-md-2 small"><time>17/08/2026</time></div>
                  <div class="col-2"><span class="badge">Aprovado</span></div>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </main>
    `;
    summary = enhanceNativeExperience('T2');
    expect(summary.sharedHistoryItems).toHaveLength(1);
    expect(summary.sharedHistoryItems[0]?.id).toBe('structural-item-1');

    // 3. Cenário: Fallback por evidência de data/hora quando não há classes conhecidas
    resetNativeEnhancements(document);
    document.body.innerHTML = `
      <main id="containerRequest">
        <header class="page-title"><h1>T02 - Validar o cadastro</h1></header>
        <section id="ContainerForm"><table id="FrmExecute"><tbody></tbody></table></section>
        <aside class="native-auxiliary-column">
          <section id="containerHistory" class="card">
            <h3>HISTÓRICO</h3>
            <div class="card-body">
              <div id="fallback-item-1">
                <div class="avatar">OK</div>
                <div>Otávio Katibe</div>
                <div>17/08/2026 10:00</div>
              </div>
              <div id="fallback-item-2">
                <div class="avatar">OK</div>
                <div>Otávio Katibe</div>
                <div>14/08/2026 14:00</div>
              </div>
            </div>
          </section>
        </aside>
      </main>
    `;
    summary = enhanceNativeExperience('T2');
    expect(summary.sharedHistoryItems).toHaveLength(2);
    expect(summary.sharedHistoryItems.map((item): string => item.id)).toEqual([
      'fallback-item-1',
      'fallback-item-2',
    ]);
  });

  it('contrata a largura interna disponível na sidebar real de 300 px', () => {
    renderSharedTask();

    enhanceNativeExperience('T1');

    const fullWidthSelectors = [
      '#native-files-body',
      '#native-file-layout',
      '#native-file-picker-column',
      '#native-file-order-column',
      '#native-file-order-group',
      '#fileOrder',
      '#native-view-all-row',
      '#native-view-all-column',
      '#view-all-files',
      '#containerHistoryRender',
      '#history-event-1',
      '#history-event-1 .col-md-3',
      '#history-event-1 .col.small',
      '#history-event-1 .col-md-2.small',
      '#history-event-1 .col-2:not(.avatar)',
      '#history-event-2',
      '#history-event-2 .col-md-3',
      '#history-event-2 .col.small',
      '#history-event-2 .col-md-2.small',
      '#history-event-2 .col-2:not(.avatar)',
    ];
    fullWidthSelectors.forEach((selector): void => {
      expect(document.querySelector(selector), selector).toHaveClass(
        '!w-full',
        '!min-w-0',
      );
    });
    expect(document.querySelector('.native-auxiliary-column')).toHaveStyle({
      width: '300px',
      minWidth: '280px',
      maxWidth: '320px',
    });
    expect(document.querySelector('#containerFiles')).toContainElement(
      document.querySelector('#fileOrder'),
    );
    expect(document.querySelector('#containerHistory')).toContainElement(
      document.querySelector('span.badge.badge-light-secondary'),
    );
  });

  it('mantém o refinamento adicional existente sem interferir nas regiões-alvo', () => {
    renderSharedTask();
    const message = document.querySelector('#containerMessages');
    const action = document.querySelector<HTMLButtonElement>('#new-message');
    const onMessage = vi.fn();
    action?.addEventListener('click', onMessage);

    const summary = enhanceNativeExperience('T1');

    expect(summary.sharedAdditionalRegion).toBe(message);
    action?.click();
    expect(onMessage).toHaveBeenCalledOnce();
    expect(document.querySelector('#new-message')).toBe(action);
  });

  it('converge sem substituir nós e remove somente classes próprias ao voltar ao START', () => {
    renderSharedTask();
    const before = Array.from(document.querySelectorAll('*'));
    const targetNodes = Array.from(
      document.querySelectorAll<HTMLElement>(
        '#containerFiles, #containerFiles *, #containerHistory, #containerHistory *',
      ),
    );
    const nativeClasses = new Map(
      targetNodes.map((element): [Element, string | null] => [
        element,
        element.getAttribute('class'),
      ]),
    );

    enhanceNativeExperience('T1');
    const firstClasses = before.map(({ className }): string => className);
    enhanceNativeExperience('T1');
    expect(Array.from(document.querySelectorAll('*'))).toEqual(before);
    expect(before.map(({ className }): string => className)).toEqual(firstClasses);

    resetNativeEnhancements(document);
    expect(Array.from(document.querySelectorAll('*'))).toEqual(before);
    nativeClasses.forEach((className, element): void => {
      expect(element.getAttribute('class')).toBe(className);
      expect(element).not.toHaveAttribute('data-zeev-fieb-classes');
    });
    expect(document.querySelector('#fileOrder')).not.toHaveClass('!w-full');
    expect(document.querySelector('#history-event-1')).not.toHaveClass('!grid');

    const start = enhanceNativeExperience('START');
    expect(start.sharedAttachmentRegion).toBeNull();
    expect(start.sharedHistoryRegion).toBeNull();
    expect(document.querySelector('[data-zeev-fieb-role="human-history"]')).toBeNull();
    expect(document.querySelector('[data-zeev-fieb-role="human-attachments"]')).toBeNull();
  });
});
