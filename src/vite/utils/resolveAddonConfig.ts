import { cwd } from 'node:process';

import { FALLBACK } from '@/constants';

import { defaultUidGenerator } from './generateUids';

import type { AddonConfigOptions, ResolvedAddonConfig, SimpleObject } from '@/types';
import type { ResolvedConfig } from 'vite';

/**
 * Calculates the final options for the plugin, and adds defaults.
 * @param addonOptions The addon options passed in by the user.
 * @param viteConfig The resolved vite configuration file.
 * @param existingValue The current resolved value in case of re-evaluating.
 * @returns The addon configuration with values resolved and defaults set.
 */
const resolveAddonConfig = <Metadata extends SimpleObject>(
  addonOptions: AddonConfigOptions<Metadata>,
  viteConfig: ResolvedConfig | null,
  existingValue?: ResolvedAddonConfig<Metadata>,
): ResolvedAddonConfig<Metadata> => {
  const {
    debug = existingValue?.debug ?? false,
    entryFiles = existingValue?.entryFiles ?? [],
    generateTree = existingValue?.generateTree ?? true,
    generateUids = existingValue?.generateUids ?? true,
    id = existingValue?.id ?? FALLBACK.STORYBOOK_ID,
    metadataKey = existingValue?.metadataKey ?? 'metadata',
    rootDir = existingValue?.rootDir ?? cwd(),
    tsconfig = existingValue?.tsconfig ?? undefined,
    uidGenerator = existingValue?.uidGenerator ?? defaultUidGenerator,
  } = addonOptions;

  const mode = viteConfig?.mode ?? 'development';
  const command = viteConfig?.command ?? 'serve';
  const ci = process.env['CI'] != null;

  const shouldGenerateTree =
    typeof generateTree === 'boolean' ? generateTree : generateTree(mode, command, ci);
  const shouldGenerateUids =
    typeof generateUids === 'boolean' ? generateUids : generateUids(mode, command, ci);

  return {
    debug,
    entryFiles,
    generateTree: shouldGenerateTree,
    generateUids: shouldGenerateUids,
    id,
    metadataKey,
    rootDir,
    tsconfig,
    uidGenerator,
  };
};

export { resolveAddonConfig };
