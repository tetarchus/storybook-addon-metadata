import type { SimpleObject } from './base.types';
import type { UidGeneratorFn } from './uid.types';
import type { Options } from 'storybook/internal/types';
import type { AnymatchPattern } from 'vite';

/**
 * Function for determining whether to generate UIDs or the Usage Tree.
 * @param mode The `mode` string passed in by `vite`.
 * @param command The `command` that `vite` was run with.
 * @param ci A boolean indicating whether we're running in CI (uses `process.env.CI`).
 * @returns A boolean indicating whether to generate the UIDs or Usage Tree.
 */
type GenerateFunction = (mode: string, command: 'build' | 'serve', ci: boolean) => boolean;

/** Options that can be passed in to the addon in the `main.ts/js` file. */
type AddonConfigOptions<Metadata extends SimpleObject> = {
  /** Whether to display debugging messages. */
  debug?: boolean;
  /** Entrypoints to build the component tree from. */
  entryFiles?: string[];
  /**
   * Generate the usage tree.
   * Can either be a boolean (default `true`) or a function that takes information
   * about the build environment as its arguments and returns a boolean.
   */
  generateTree?: GenerateFunction | boolean;
  /** Generate the component UIDs.
   * Can either be a boolean (default `true`) or a function that takes information
   * about the build environment as its arguments and returns a boolean.
   */
  generateUids?: GenerateFunction | boolean;
  /** ID for the storybook when running multiple on a host. */
  id?: string | undefined;
  /** Ignore settings for the file watcher. */
  ignored?: AnymatchPattern[];
  /** Metadata key. */
  metadataKey?: string;
  /**
   * The directory in which to look for the `.storybook` configuration folder and files.
   * This can be used in case the default method of discovery does not work.
   * If relative, this should be relative to the directory in which the storybook
   * command is run.
   */
  rootDir?: string;
  /** The path to the tsconfig to use. */
  tsconfig?: string | undefined;
  /** Function for generating UIDs from the metadata. */
  uidGenerator?: UidGeneratorFn<Metadata>;
};

/** Options passed to the `viteFinal` function. */
type ViteFinalOptions<Metadata extends SimpleObject> = Options & {
  /** Whether to display debugging messages. */
  debug?: boolean;
  /** Options for the addon. */
  addonMetadata: AddonConfigOptions<Metadata>;
  /** ID for the storybook when running multiple on a host. */
  id?: string;
};

/** Addon configuration once the values have been confirmed, and defaults applied. */
type ResolvedAddonConfig<Metadata extends SimpleObject> = {
  /** Whether to display debugging messages. */
  debug: boolean;
  /** Entrypoints to build the component tree from. */
  entryFiles: string[];
  /** Generate the usage tree. */
  generateTree: boolean;
  /** Generate the component UIDs. */
  generateUids: boolean;
  /** ID of the storybook instance. */
  id: string;
  /** The key to look for UID metadata. */
  metadataKey: string;
  /** The directory to start looking for stories under. */
  rootDir: string;
  /** Path to the `tsconfig.json` file to use. */
  tsconfig: string | undefined;
  /** Custom UID generator function that takes custom metadata and returns UIDs. */
  uidGenerator: UidGeneratorFn<Metadata>;
};

export type { AddonConfigOptions, ResolvedAddonConfig, ViteFinalOptions };
