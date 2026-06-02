import '@testing-library/jest-dom';
import 'fake-indexeddb/auto'; // replaces global indexedDB with an in-memory implementation
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { resetDbForTests } from './db/client';

// Give every test a fresh in-memory database so state never leaks between tests.
beforeEach(async () => {
  await resetDbForTests();
});

afterEach(() => {
  cleanup();
});
