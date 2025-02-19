import { logger } from '@/utils';

import { Tree } from '../classes';

import type { ResolvedAddonConfig, SimpleObject, Uids } from '@/types';
import type { HmrContext } from 'vite';

/**
 * Updates the {@link Tree} and {@link Uids} data after a hot module reload.
 * @param tree The existing {@link Tree}.
 * @param uids The existing {@link Uids} map.
 * @param context The {@link HmrContext} data from vite.
 * @param addonConfig The {@link ResolvedAddonConfig} to use.
 * @returns The updated {@link Tree} and {@link Uids}.
 */
const updateTree = async <Metadata extends SimpleObject>(
  tree: Tree<Metadata> | null,
  uids: Uids,
  context: HmrContext,
  addonConfig: ResolvedAddonConfig<Metadata>,
): Promise<{ tree: Tree<Metadata> | null; uids: Uids }> => {
  const { debug } = addonConfig;
  const log = logger(debug, 'vite-plugin-hmr');

  log.info('HMR update not yet implemented.', context.file);

  return { tree, uids };
};

export { updateTree };
