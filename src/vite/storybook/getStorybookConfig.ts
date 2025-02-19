import { join } from 'node:path';

import { satisfies } from 'semver';
import { getConfigInfo, getStorybookInfo } from 'storybook/internal/common';
import { tsImport } from 'tsx/esm/api';

import { ADDON_ID, REGEX, STORYBOOK } from '@/constants';

import type { StorybookConfig as StorybookConfiguration } from '@storybook/types';
import type { ImportedModule, StorybookConfig } from '@/types';

/** Supported Semver for Storybook. */
const VERSION_CHECK = '> 8.0.0';
/** Supported framework package for Storybook. */
const PACKAGE_CHECK = '@storybook/react';

/**
 * Extracts the value of the Storybook CLI's `--config-dir`/`-c` flag to
 * determine the location of the storybook configuration directory.
 * @returns The value of the `--config-dir` CLI flag, or null if not present.
 */
const getConfigDirFlag = (): string | null => {
  const argv = process.argv;

  for (const [index, arg] of argv.entries()) {
    if (arg.startsWith(STORYBOOK.CONFIG_FLAG) || arg.startsWith(STORYBOOK.CONFIG_OPTION)) {
      if (arg.includes('=')) {
        // It's a combined flag (e.g: --config-dir=.storybook)
        const [, value] = arg.split('=');
        return value?.trim() || null;
      } else {
        // It's not combined, the next arg is the value we want.
        const value = argv.at(index + 1);
        return value?.trim() || null;
      }
    }
  }

  return null;
};

/**
 * Display a warning message if the Storybook version is not officially supported.
 * @param version The version of Storybook being used.
 */
const warnUnsupportedVersion = (version: string | undefined): void => {
  const warning = `${ADDON_ID} only officially supports Storybook versions ${VERSION_CHECK}. It may not work correctly with earlier versions.`;
  if (!version) {
    console.warn(`Unable to determine Storybook version. ${warning}`);
  } else if (!satisfies(version.replace(REGEX.SEMVER, REGEX.REPLACEMENTS.EMPTY), VERSION_CHECK)) {
    console.warn(warning);
  }
};

/**
 * Display a warning message if the framework package is not officially supported.
 * @param frameworkPackage The framework package being used with Storybook.
 */
const warnUnsupportedPackage = (frameworkPackage: string | undefined) => {
  const warning = `${ADDON_ID} only officially supports the ${PACKAGE_CHECK} framework. It may not work correctly with other frameworks.`;
  if (!frameworkPackage) {
    console.warn(`Unable to determine Storybook framework. ${warning}`);
  } else if (frameworkPackage !== PACKAGE_CHECK) {
    console.warn(warning);
  }
};

/**
 * Retrieve the Storybook configuration information required for the addon.
 * @param root The directory path to use as the root for relative paths.
 * @returns An object containing the Storybook configuration information required for the addon.
 */
const getStorybookConfig = async (root: string): Promise<StorybookConfig> => {
  const configDir = join(root, getConfigDirFlag() ?? STORYBOOK.DIR_NAME);
  const packageJson = (await tsImport(join(root, './package.json'), import.meta.url)) ?? {};

  const configInfo = getConfigInfo(packageJson, configDir);
  const storybookInfo = getStorybookInfo(packageJson, configDir);

  const storybookConfig = {
    ...storybookInfo,
    ...configInfo,
    configDir,
  };

  warnUnsupportedVersion(storybookConfig.version);
  warnUnsupportedPackage(storybookConfig.frameworkPackage);

  const mainConfig = storybookConfig.mainConfig
    ? ((await tsImport(
        storybookConfig.mainConfig,
        import.meta.url,
      )) as ImportedModule<StorybookConfiguration>)
    : null;
  const storiesArray = mainConfig?.default?.stories ?? [];

  const storyTitleOptions = {
    configDir,
    // TODO: Improve this to allow a function// TODO: Improve this to allow a function
    stories: typeof storiesArray === 'function' ? [] : storiesArray,
  };

  return {
    ...storybookConfig,
    root,
    storyTitleOptions,
  };
};

export { getStorybookConfig };
