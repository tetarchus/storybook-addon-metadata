import { addonMetadataPlugin } from './plugin';

import type { SimpleObject, ViteFinalOptions } from '@/types';
import type { UserConfig } from 'vite';

/**
 * Adds the addon plugin to vite to build the metadata.
 * @param config The vite {@link UserConfig} from Storybook.
 * @param options Additional options passed in by Storybook, including the addon config.
 * @returns A modified config with the addon plugin.
 */
const viteFinal = async <Metadata extends SimpleObject>(
  config: UserConfig,
  options: ViteFinalOptions<Metadata>,
): Promise<UserConfig> => {
  const { addonMetadata, id } = options;
  const { debug = options.debug ?? false, ignored = [] } = addonMetadata;

  // Convert user's server.watch.ignored to an array to add to ours.
  const userWatchIgnores = config.server?.watch?.ignored;
  const watchIgnores = Array.isArray(userWatchIgnores)
    ? userWatchIgnores
    : userWatchIgnores
      ? [userWatchIgnores]
      : [];

  return {
    ...config,
    plugins: [...(config.plugins ?? []), addonMetadataPlugin({ ...addonMetadata, debug, id })],
    server: {
      ...config.server,
      watch: {
        ...config.server?.watch,
        ignored: [...ignored, ...watchIgnores],
      },
    },
  };
};

export { viteFinal };
