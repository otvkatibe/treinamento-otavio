import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  enhanceNativeExperience,
  resetNativeEnhancements,
} from '../native-enhancements';
import { beforeCompleteMarkup } from './fixtures/before-complete.fixture';

afterEach((): void => {
  resetNativeEnhancements(document);
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('card compartilhado Antes de concluir', () => {
  it('refina heading, checks e conteúdo sem alterar nós ou comportamento nativo', () => {
    document.body.innerHTML = beforeCompleteMarkup();
    const region = document.querySelector<HTMLElement>('.native-before-complete-card');
    const title = region?.querySelector<HTMLElement>('h3');
    const list = region?.querySelector<HTMLElement>('.native-check-list');
    const items = Array.from(
      region?.querySelectorAll<HTMLElement>('[data-before-complete-item]') ?? [],
    );
    const checkbox = document.querySelector<HTMLInputElement>('#confirm-review');
    const onChange = vi.fn();
    checkbox?.addEventListener('change', onChange);
    const nativeForm = document.querySelector<HTMLElement>('[data-name="parecer"]');
    const nativeFormClassName = nativeForm?.className;

    const summary = enhanceNativeExperience('T2');

    expect(summary.sharedBeforeCompleteRegion).toBe(region);
    expect(summary.sharedBeforeCompleteItems).toEqual(items);
    expect(region).toHaveClass('w-full', 'max-w-full', 'min-w-0', 'overflow-x-clip');
    expect(title).toHaveClass('whitespace-normal', 'break-words', 'leading-snug');
    expect(list).toHaveClass('grid', 'grid-cols-1', 'min-w-0', 'gap-3');
    items.forEach((item): void => {
      expect(item).toHaveClass(
        'grid',
        'grid-cols-[1.25rem_minmax(0,1fr)]',
        'items-start',
        'min-w-0',
      );
    });
    expect(checkbox).toHaveClass('h-5', 'w-5', 'shrink-0', 'self-start');
    expect(region?.querySelector('[data-check-content]')).toHaveClass(
      'min-w-0',
      'max-w-full',
      'break-words',
    );
    expect(region?.textContent).toContain('todos os dados pessoais');
    expect(document.querySelector('[data-name="parecer"]')).toBe(nativeForm);
    expect(nativeForm?.className).toBe(nativeFormClassName);

    checkbox?.click();
    expect(checkbox?.checked).toBe(true);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('é idempotente e não é aplicado no START', () => {
    document.body.innerHTML = beforeCompleteMarkup();
    const nodes = Array.from(document.querySelectorAll('*'));

    enhanceNativeExperience('T2');
    const classes = nodes.map((node): string => (node as HTMLElement).className);
    enhanceNativeExperience('T2');

    expect(Array.from(document.querySelectorAll('*'))).toEqual(nodes);
    expect(nodes.map((node): string => (node as HTMLElement).className)).toEqual(classes);

    enhanceNativeExperience('START');
    expect(document.querySelector('[data-zeev-fieb-role="human-before-complete"]')).toBeNull();
    expect(document.querySelector('.native-check-item')).not.toHaveClass(
      'grid-cols-[1.25rem_minmax(0,1fr)]',
    );
  });
});
