import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { loadRecipes } from './recipe-loader';

const VIRTUAL_ID = 'virtual:recipe-library';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

/**
 * Bundles the hand-authored recipes.yaml into the app at build time.
 * Exposes `import { recipes } from 'virtual:recipe-library'`.
 * Parsing/validation happen here (Node only) — js-yaml never ships to the client.
 */
export function recipeLibrary(): Plugin {
  let yamlPath: string;

  return {
    name: 'recipe-library',
    configResolved(config) {
      yamlPath = path.resolve(config.root, 'recipes.yaml');
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id !== RESOLVED_ID) return;
      this.addWatchFile(yamlPath);
      const recipes = loadRecipes(readFileSync(yamlPath, 'utf8'));
      return `export const recipes = ${JSON.stringify(recipes)};`;
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
