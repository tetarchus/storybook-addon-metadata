import { createReadStream, existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';

import findCacheDir from 'find-cache-dir';
import prettier from 'prettier';

import { ADDON_ID, DEFAULTS, FALLBACK, REGEX } from '@/constants';
import { logger } from '@/utils';

import type { Tree } from '../classes';
import type { ResolvedAddonConfig, SimpleObject, Uids } from '@/types';

/**
 * Appends content to the cache index file.
 * @param cacheDir The path to the cache directory.
 * @param id The ID of the project file that has been added.
 */
const writeIndexFile = async (cacheDir: string, id: string): Promise<void> => {
  const cacheIndexPath = join(cacheDir, 'index.js');

  // Check whether the index file exists
  const exists = existsSync(cacheIndexPath);
  const importLines: string[] = [];
  const moduleNames: string[] = [];

  if (exists) {
    const readStream = createReadStream(cacheIndexPath, { encoding: 'utf-8' });
    const rl = createInterface({ input: readStream });

    rl.on('line', line => {
      const extracted = /import \* as (?<moduleName>.*) from/iu.exec(line);
      if (extracted) {
        const moduleName = extracted.groups?.['moduleName'];
        if (moduleName) {
          moduleNames.push(moduleName);
          importLines.push(line);
        }
      }
    });
  }

  if (!moduleNames.includes(id)) {
    importLines.push(`import * as ${id} from './${id}';`);
    moduleNames.push(id);
  }

  const content = await prettier.format(
    `
    ${importLines.join(REGEX.REPLACEMENTS.NEWLINE)}

    export default {
      ${moduleNames.join(', ')}
    }
    `,
    { parser: 'babel' },
  );

  await writeFile(cacheIndexPath, content);
};

/**
 * Generates and saves the generated tree to a cache file.
 * @param tree The generated {@link Tree} to save.
 * @param basePath The basePath for relative file paths.
 * @param options Options object for the function.
 * @param options.debug Whether to display debugging messages.
 */
const saveCacheFile = async <Metadata extends SimpleObject>(
  tree: Tree<Metadata> | null,
  uids: Uids,
  options: ResolvedAddonConfig<Metadata>,
): Promise<void> => {
  const { debug, id = FALLBACK.STORYBOOK_ID, rootDir } = options;
  const log = logger(debug, 'cache');
  const cacheDir = findCacheDir({ create: true, name: ADDON_ID });

  if (!cacheDir) {
    log.warn('Cannot find/create the cache directory');
    return;
  }

  const serializedTree = tree?.serialize();
  const unusedStories = tree?.unusedStories ?? [];

  const content = await prettier.format(
    `const basePath = "${rootDir}";
    
    const tree = ${JSON.stringify(serializedTree, null, DEFAULTS.INDENT_SIZE)};

    const uids = ${JSON.stringify(uids, null, DEFAULTS.INDENT_SIZE)};
    
    const unusedStories = ${JSON.stringify(unusedStories, null, DEFAULTS.INDENT_SIZE)};
    
    export { basePath, tree, uids, unusedStories }`,
    { parser: 'babel' },
  );

  const filePath = join(cacheDir, `${id}.js`);
  await writeFile(filePath, content);
  await writeIndexFile(cacheDir, id);

  log.verbose('Cache file written.');
};

export { saveCacheFile };
