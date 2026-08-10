import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

import { installMatchMedia } from './match-media';

beforeEach(function configureMatchMedia(): void {
  installMatchMedia(1024);
});

afterEach(function cleanupReactTrees(): void {
  cleanup();
});
