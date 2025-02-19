import type { SimpleObject } from './base.types';
import type { ParsedStoryFile } from './storybook.types';
import type { UidGeneratorFn } from './uid.types';
import type { Typescript } from '@/vite/classes';

/** Options accepted by the Tree constructor. */
type TreeOptions<Metadata extends SimpleObject> = {
  /** The common file path for relative paths. */
  basePath: string;
  /** Display debugging messages. */
  debug: boolean;
  /** The entry files for the tree. */
  entryFiles: string[];
  /** The key containing the metadata to build UIDs from. */
  metadataKey: string;
  /** The story files relating to components in the tree. */
  stories: ParsedStoryFile[];
  /** Path to the tsconfig file to use. */
  typescript: Typescript;
  /** The UID Generator function for the addon. */
  uidGenerator: UidGeneratorFn<Metadata>;
};

export type { TreeOptions };
