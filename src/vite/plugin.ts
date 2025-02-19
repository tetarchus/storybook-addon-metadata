import { ADDON_ID, ADDON_VERSION } from '@/constants';
import { logger } from '@/utils';

import { buildTree, updateTree } from './tree';
import { resolveAddonConfig, saveCacheFile } from './utils';

import type { Tree } from './classes';
import type { AddonConfigOptions, SimpleObject, Uids } from '@/types';
import type { ResolvedConfig, Plugin as VitePlugin } from 'vite';

/** Display name of the plugin in logs. */
const PLUGIN_NAME = `${ADDON_ID}-vite-plugin`;
/** The version of the plugin. */
const PLUGIN_VERSION = ADDON_VERSION;

/**
 * Vite plugin used to generate a component usage tree and UIDs for components.
 * @param addonOptions Options for the addon passed in to the plugin.
 * @returns A {@link VitePlugin|Plugin} for vite.
 */
const addonMetadataPlugin = <Metadata extends SimpleObject>(
  addonOptions: AddonConfigOptions<Metadata>,
): VitePlugin => {
  let componentTree: Tree<Metadata> | null = null;
  let componentUids: Uids = {};
  let resolvedViteConfig: ResolvedConfig | null = null;
  let addonConfig = resolveAddonConfig(addonOptions, resolvedViteConfig);

  const { debug = false } = addonOptions;
  const log = logger(debug, 'vite-plugin');

  return {
    name: PLUGIN_NAME,
    version: PLUGIN_VERSION,
    configResolved(config) {
      resolvedViteConfig = config;
      addonConfig = resolveAddonConfig(addonOptions, resolvedViteConfig, addonConfig);
    },
    async buildStart() {
      log.verbose(`Build Starting`);
      const { basePath, tree, uids } = await buildTree(addonConfig, resolvedViteConfig);

      componentTree = tree;
      componentUids = uids;
      addonConfig.rootDir = basePath;
      await saveCacheFile(componentTree, componentUids, addonConfig);
    },
    async buildEnd(error) {
      if (error) {
        this.error(error);
      } else {
        log.verbose(`Build complete`);
      }
    },
    async handleHotUpdate(ctx) {
      const { tree, uids } = await updateTree(componentTree, componentUids, ctx, addonConfig);
      componentTree = tree;
      componentUids = uids;
      await saveCacheFile(componentTree, componentUids, addonConfig);
    },
  };
};

export { addonMetadataPlugin };
