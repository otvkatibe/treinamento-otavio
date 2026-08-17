import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  enhanceNativeExperience,
  resetNativeEnhancements,
} from '../native-enhancements';
import { sharedHumanTaskMarkup } from './fixtures/shared-human-task.fixture';

function renderSharedTask(): void {
  document.body.innerHTML = sharedHumanTaskMarkup();
}

afterEach((): void => {
  resetNativeEnhancements(document);
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('refinamento compartilhado das tarefas humanas', () => {
  it('reconhece anexos e preserva picker, ordenação e ações nativas', () => {
    renderSharedTask();
    const picker = document.querySelector<HTMLInputElement>('#shared-file-input');
    const fileAction = document.querySelector<HTMLElement>('#select-files');
    const sort = document.querySelector<HTMLSelectElement>('#fileOrder');
    const viewAll = document.querySelector<HTMLAnchorElement>('#view-all-files');
    const onFileAction = vi.fn((event: Event): void => event.preventDefault());
    const onSort = vi.fn();
    const onViewAll = vi.fn((event: Event): void => event.preventDefault());
    fileAction?.addEventListener('click', onFileAction);
    sort?.addEventListener('change', onSort);
    viewAll?.addEventListener('click', onViewAll);

    const summary = enhanceNativeExperience('T1');

    expect(summary.sharedAttachmentRegion).toBe(
      document.querySelector('#containerFiles'),
    );
    expect(summary.sharedFileAction).toBe(fileAction);
    expect(summary.sharedSortSelect).toBe(sort);
    expect(summary.sharedViewAllAction).toBe(viewAll);
    expect(summary.sharedAttachmentRegion).toHaveClass(
      'w-full',
      'max-w-full',
      'min-w-0',
      'overflow-x-clip',
    );
    expect(document.querySelector('.attachment-controls')).toHaveClass(
      '!grid',
      'grid-cols-1',
      'min-w-0',
      'gap-4',
    );
    expect(fileAction).toHaveClass('box-border', '!w-full', '!min-w-0', '!whitespace-nowrap');
    expect(sort).toHaveClass('!w-full', '!max-w-full', '!min-w-0');
    expect(viewAll).toHaveClass('!w-full', '!whitespace-nowrap');

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

  it('transforma eventos do histórico em timeline legível e responsiva', () => {
    renderSharedTask();

    const summary = enhanceNativeExperience('T1');

    expect(summary.sharedHistoryRegion).toBe(
      document.querySelector('#containerHistory'),
    );
    expect(summary.sharedHistoryItems).toHaveLength(2);
    expect(document.querySelector('.history-list')).toHaveClass(
      'grid',
      'grid-cols-1',
      'min-w-0',
    );
    summary.sharedHistoryItems.forEach((item): void => {
      expect(item).toHaveClass(
        'grid',
        'grid-cols-[2.5rem_minmax(0,1fr)]',
        'min-w-0',
      );
    });
    expect(document.querySelector('.history-content')).toHaveClass(
      'col-start-2',
      'w-full',
      'min-w-0',
    );
    expect(document.querySelector('.person-name')).toHaveClass(
      'min-w-0',
      'break-words',
    );
    expect(document.querySelector('.history-meta')).toHaveClass(
      'flex',
      'flex-wrap',
      'w-full',
      'min-w-0',
      'gap-x-2',
    );
    expect(document.querySelector('.history-date')).toHaveClass('basis-full');
    expect(document.querySelector('.badge-light-secondary')).toHaveClass(
      'shrink-0',
      'whitespace-nowrap',
      'rounded-full',
    );
  });

  it('mantém select e badge dentro dos cards na fixture lateral de 280–320 px', () => {
    renderSharedTask();

    enhanceNativeExperience('T1');

    const sidebar = document.querySelector<HTMLElement>('.native-auxiliary-column');
    const attachments = document.querySelector<HTMLElement>('#containerFiles');
    const sortWrapper = document.querySelector<HTMLElement>('.sort-control');
    const fileOrder = document.querySelector<HTMLSelectElement>('#fileOrder');
    const history = document.querySelector<HTMLElement>('#containerHistory');
    const historyContent = document.querySelector<HTMLElement>('.history-content');
    const metadata = document.querySelector<HTMLElement>('.history-meta');
    const badge = document.querySelector<HTMLElement>(
      'span.badge.badge-light-secondary',
    );

    expect(sidebar?.style.width).toBe('300px');
    expect(sidebar?.style.minWidth).toBe('280px');
    expect(sidebar?.style.maxWidth).toBe('320px');
    expect(attachments).toContainElement(fileOrder);
    expect(history).toContainElement(badge);
    expect(sortWrapper).toHaveClass('!grid', 'w-full', 'min-w-0');
    expect(fileOrder).toHaveClass(
      '!block',
      '!w-full',
      '!max-w-full',
      '!min-w-0',
      'box-border',
    );
    expect(historyContent).toHaveClass('min-w-0', 'max-w-full');
    expect(metadata).toHaveClass('min-w-0', 'max-w-full', 'flex-wrap');
    expect(badge).toHaveClass('shrink-0', 'whitespace-nowrap');
    expect(sortWrapper).toHaveAttribute('data-zeev-fieb-classes');
    expect(fileOrder).toHaveAttribute('data-zeev-fieb-classes');
    expect(metadata).toHaveAttribute('data-zeev-fieb-classes');
    expect(badge).toHaveAttribute('data-zeev-fieb-classes');
  });

  it('classifica Mensagens como região compartilhada adicional', () => {
    renderSharedTask();
    const message = document.querySelector('#containerMessages');
    const action = document.querySelector<HTMLButtonElement>('#new-message');
    const onMessage = vi.fn();
    action?.addEventListener('click', onMessage);

    const summary = enhanceNativeExperience('T1');

    expect(summary.sharedAdditionalRegion).toBe(message);
    expect(message).toHaveAttribute(
      'data-zeev-fieb-role',
      'human-shared-messages',
    );
    expect(action).toHaveClass('!w-full', '!min-w-0');
    action?.click();
    expect(onMessage).toHaveBeenCalledOnce();
    expect(document.querySelector('#new-message')).toBe(action);
  });

  it('converge sem duplicar nós e limpa o chrome humano ao retornar ao START', () => {
    renderSharedTask();
    const before = Array.from(document.querySelectorAll('*'));

    enhanceNativeExperience('T1');
    const firstClasses = Array.from(document.querySelectorAll<HTMLElement>('*')).map(
      ({ className }): string => className,
    );
    enhanceNativeExperience('T1');

    expect(Array.from(document.querySelectorAll('*'))).toEqual(before);
    expect(
      Array.from(document.querySelectorAll<HTMLElement>('*')).map(
        ({ className }): string => className,
      ),
    ).toEqual(firstClasses);

    enhanceNativeExperience('START');

    expect(
      document.querySelector('[data-zeev-fieb-role="human-history"]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-zeev-fieb-role="human-attachments"]'),
    ).toBeNull();
    expect(document.querySelector('.history-item')).not.toHaveClass(
      'grid-cols-[2.5rem_minmax(0,1fr)]',
    );
    expect(document.querySelector('#fileOrder')).not.toHaveClass(
      '!w-full',
    );
  });
});
