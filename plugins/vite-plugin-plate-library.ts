import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { loadPlates } from './plate-loader';

const VIRTUAL_ID = 'virtual:plate-library';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

/**
 * Bundles the hand-authored plates.yaml into the app at build time.
 * Exposes `import { components } from 'virtual:plate-library'`.
 * Parsing/validation happen here (Node only) — js-yaml never ships to the client.
 * Mirrors plugins/vite-plugin-recipe-library.ts.
 */
export function plateLibrary(): Plugin {
  let yamlPath: string;

  return {
    name: 'plate-library',
    configResolved(config) {
      yamlPath = path.resolve(config.root, 'plates.yaml');
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id !== RESOLVED_ID) return;
      this.addWatchFile(yamlPath);
      const components = loadPlates(readFileSync(yamlPath, 'utf8'));
      return `export const components = ${JSON.stringify(components)};`;
    },
    handleHotUpdate({ file, server }) {
      if (file !== yamlPath) return;
      const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
      if (mod) server.moduleGraph.invalidateModule(mod);
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}
