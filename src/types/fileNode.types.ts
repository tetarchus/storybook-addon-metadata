import type { FileNode, Tree } from '@/vite/classes';
import type { SimpleObject } from './base.types';

/** Options accepted by the FileNode constructor. */
type FileNodeOptions<Metadata extends SimpleObject> = {
  /** Files that this file imports. */
  children?: FileNode<Metadata>[];
  /** The path to the file. */
  filePath: string;
  /** File name override. */
  name?: string;
  /** Initial parent used when creating the file for the first time. */
  parent?: FileNode<Metadata> | null;
  /** This file is a root file. */
  root?: boolean;
  /** Whether this file is/uses React Router. */
  reactRouter?: boolean;
  /** Whether this file is/uses Redux Connect. */
  reduxConnect?: boolean;
  /** Whether this file is/uses a third party module. */
  thirdParty?: boolean;
  /** The {@link Tree} instance this file belongs to. */
  tree: Tree<Metadata>;
  /** Whether this file is a virtual root, and not a real file. */
  virtualRoot?: boolean;
};

/**
 * Serializable representation of a FileNode. Allows for writing to the cache file.
 */
type SerializedFileNode = {
  /** The full path to the file. */
  filePath: string;
};

export type { FileNodeOptions, SerializedFileNode };
