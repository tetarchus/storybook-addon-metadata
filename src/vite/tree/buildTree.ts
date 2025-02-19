import { extname } from 'node:path';
import { performance } from 'node:perf_hooks';

import { filterNull } from '@tetarchus/utils';

import { logger } from '@/utils';

import { Tree, Typescript } from '../classes';
import { getStorybookConfig, parseStoryFile } from '../storybook';
import { getElapsedTime } from '../utils';

import type { ParsedStoryFile, ResolvedAddonConfig, SimpleObject, Uids } from '@/types';
import type { ResolvedConfig } from 'vite';

const buildTree = async <Metadata extends SimpleObject>(
  addonConfig: ResolvedAddonConfig<Metadata>,
  viteConfig: ResolvedConfig | null,
) => {
  // Record Build Start Time.
  const startTime = performance.now();
  const jobs = new Set<'Usage Tree' | 'UIDs'>();

  // Setup Logging
  const {
    debug,
    entryFiles: passedEntryFiles,
    generateTree,
    generateUids,
    metadataKey,
    rootDir,
    tsconfig: tsconfigPath,
    uidGenerator,
  } = addonConfig;
  const log = logger(debug, 'vite-plugin-build');

  generateTree && jobs.add('Usage Tree');
  generateUids && jobs.add('UIDs');

  // Return Value Storage
  const viteRoot = viteConfig?.root ?? rootDir;
  const basePath = rootDir;
  let tree = null;
  let uids: Uids = {};

  // Determine what jobs to run

  if (!generateTree && !generateUids) {
    log.verbose('Skipping component tree and UID generation.');
    return { basePath, tree, uids };
  }

  // We're generating something - fetch the common storybook configuration data.
  log.verbose('Fetching storybook configuration...');
  // TODO: Add exclude/globs option?
  const typescript = new Typescript({ baseUrl: basePath, debug, tsconfigPath });
  const storybookConfig = await getStorybookConfig(basePath);
  const stories: ParsedStoryFile[] = [];
  const storyFiles = (
    viteConfig?.optimizeDeps.entries ? [viteConfig?.optimizeDeps.entries] : []
  ).flat();

  // Fetch the components with stories and extract the relevant data
  log.verbose('Searching for components with stories...');
  for (const story of storyFiles.filter(file => file.includes('stories'))) {
    // TODO: Can we get this to work?
    // Currently unable to parse .mdx files.
    if (extname(story) === '.mdx' || extname(story) === '.md') continue;

    const storyData = await parseStoryFile(story, storybookConfig, viteRoot, typescript);
    stories.push(storyData);
  }
  log.verbose(`Found ${stories.length} components with stories.`);

  // Create the Tree instance to use
  const entryFiles = ((): string[] => {
    if (passedEntryFiles.length > 0) {
      log.verbose('Using custom entry files.');
      return passedEntryFiles;
    } else if (generateTree) {
      log.verbose('Building tree from stories.');
      return Object.values(stories)
        .map(story => story.componentPath)
        .filter(filterNull);
    } else {
      log.verbose('Building UIDs from stories.');
      return Object.values(stories).map(story => story.storyFilePath);
    }
  })();

  tree = new Tree({
    basePath,
    entryFiles,
    debug,
    metadataKey,
    stories,
    typescript,
    uidGenerator,
  });

  if (generateTree) {
    // Build the tree data
    tree.buildTree(generateUids);
  } else if (generateUids) {
    // Generate the UIDs
    uids = tree.buildUids();
  }

  const endTime = performance.now();
  const elapsedTime = getElapsedTime(startTime, endTime);
  log.verbose(`${[...jobs].join(' and ')} generation completed in ${elapsedTime}`);

  return { basePath, tree, uids };
};

export { buildTree };
