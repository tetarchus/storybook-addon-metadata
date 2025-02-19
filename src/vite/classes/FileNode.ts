import { basename, dirname } from 'node:path';

import { nanoid } from 'nanoid';

import { REGEX } from '@/constants';
import { logger } from '@/utils';

import type { Tree } from './Tree';
import type { Typescript } from './Typescript';
import type {
  FileNodeOptions,
  Logger,
  ParsedStoryFile,
  SerializedFileNode,
  SimpleObject,
} from '@/types';

/**
 * Representation of a file in the filesystem.
 * Contains references to the data contained within the file.
 */
class FileNode<Metadata extends SimpleObject> {
  //===================================
  //== Private Static Properties
  //===================================
  /** Regular expression to match file extensions. */
  static #extensionsRegExp = String.raw`\.(j|t)sx?$`;

  //===================================
  //== Private Readonly Properties
  //===================================
  /** The logger instance. */
  readonly #log: Logger;

  //===================================
  //== Public Readonly Properties
  //===================================
  /** The absolute path to the file. */
  public readonly filePath: string;
  /** The name of the file including extension. */
  public readonly fileName: string;
  /** The ID of the instance. */
  public readonly id: string;
  /** The original import path encountered the first time this file was created. */
  public readonly importPath: string;
  /** The ID of the instance. */
  public readonly isStoryFile: boolean;
  /** The name of the file excluding extension. */
  public readonly name: string;
  /** Whether this is the root node of a Tree. */
  public readonly root: boolean;
  /** The linked story file. */
  public readonly storyFile: ParsedStoryFile | null;
  /** The tree instance that this file belongs to. */
  public readonly tree: Tree<Metadata>;
  /** Whether this is a virtual root (doesn't relate to an actual file, but used as a start point for multiple roots.) */
  public readonly virtualRoot: boolean;

  //===================================
  //== Private Properties
  //===================================
  #error: Error | null;

  //===================================
  //== Public Properties
  //===================================
  /** FileNodes imported by this file. */
  public children: FileNode<Metadata>[];
  /** Whether the file has been parsed by the AstParser. */
  public parsed: boolean;
  /** Whether the file uses React Router. */
  public reactRouter: boolean;
  /** Whether the file uses Redux Connect. */
  public reduxConnect: boolean;
  /** Whether the file is a third-party node module. */
  public thirdParty: boolean;

  //===================================
  //== Constructor
  //===================================
  public constructor({
    children = [],
    filePath,
    name,
    parent = null,
    reactRouter = false,
    reduxConnect = false,
    root = false,
    thirdParty = false,
    tree,
    virtualRoot = false,
  }: FileNodeOptions<Metadata>) {
    this.tree = tree;
    this.#log = logger(this.tree.debug, 'file-node');

    this.id = nanoid();
    this.children = children;
    this.importPath = filePath;

    // Resolve the file path and name
    const { error, filePath: path } = FileNode.validateFilePath(
      filePath,
      parent?.filePath ?? this.tree.basePath,
      this.tree.typescript,
    );

    this.#error = error;
    this.filePath = path;
    this.fileName = basename(this.filePath);
    this.name = name ?? this.#getNameFromFile();

    // File meta
    // TODO: May eventually need to cover others story file naming conventions
    // when custom indexers become stable.
    this.isStoryFile = this.fileName.includes('.stories.');
    this.parsed = false;
    this.reactRouter = reactRouter;
    this.reduxConnect = reduxConnect;
    this.thirdParty = thirdParty;
    this.root = root || virtualRoot;
    this.virtualRoot = virtualRoot;

    this.storyFile = this.isStoryFile
      ? this.tree.findStoryFileData(this.filePath)
      : this.tree.findStoryFileForComponent(this.filePath);

    this.tree.addFileNode(this);
    this.#log.verbose('File Node created:', this.filePath);
  }

  //===================================
  //== Public Getters
  //===================================
  /** An error encountered during parsing. */
  public get error(): Error | null {
    return this.#error;
  }
  //===================================
  //== Public Static Methods
  //===================================
  /**
   * Checks whether a definition for a FileNode exists, otherwise creates it.
   * @param options The {@link FileNodeOptions} to create the FileNode from.
   * @returns The created or existing FileNode.
   */
  public static create<Metadata extends SimpleObject>(
    options: FileNodeOptions<Metadata>,
  ): FileNode<Metadata> {
    return options.tree.findFileNode(options) ?? new FileNode(options);
  }

  /**
   * Checks whether an import path is a third-party module.
   * @param path The path to check.
   * @returns A boolean indicating whether the path relates to a third-party module.
   */
  public static isThirdParty(path: string): boolean {
    return !path.startsWith('/') && !path.startsWith('\\') && !path.startsWith('.');
  }

  /**
   * Validates and resolves the file path into an absolute path.
   * @param importPath The path used to import the file when created as a child,
   * or the full path to the file.
   * @param basePath The path from which a relative `importPath` is resolved from.
   * @param typescript The {@link Typescript} instance to use for resolution.
   * @returns An object containing any errors encountered, and the resolved path.
   */
  public static validateFilePath(
    importPath: string,
    basePath: string,
    typescript: Typescript,
  ): { error: Error | null; filePath: string } {
    let filePath = importPath;
    let error: Error | null = null;

    // If it's a third-party module, just return as we won't be parsing it.
    if (FileNode.isThirdParty(importPath)) {
      return { error, filePath };
    }

    try {
      filePath = typescript.resolvePath(importPath, basePath);
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
    }

    return { error, filePath };
  }

  //===================================
  //== Private Methods
  //===================================
  /**
   * Extracts the name of the file from its filename/path.
   * @returns The name extracted from the filename/path.
   */
  #getNameFromFile(): string {
    const path = this.filePath;
    const [name] = this.fileName.split('.');
    const filename = name === 'index' ? basename(dirname(path)) : name;

    // Sanitize the filename
    const identifier = filename
      ?.replace(REGEX.NON_ALPHA_START, REGEX.REPLACEMENTS.EMPTY)
      .replace(REGEX.NON_ALPHA, REGEX.REPLACEMENTS.EMPTY)
      .trim();

    return (
      identifier ||
      name ||
      basename(this.fileName).replace(new RegExp(FileNode.#extensionsRegExp), '')
    );
  }

  //===================================
  //== Public Methods
  //===================================
  /**
   * Converts the instance into a serializable node for saving to the cache file.
   * @returns The {@link SerializedFileNode} representation of the file.
   */
  public serialize(): SerializedFileNode {
    return {
      filePath: this.filePath,
    };
  }

  /**
   * Traverses the file and its children, running a callback on each node.
   * @param callback The callback to run on each FileNode.
   */
  public traverse(callback: (node: FileNode<Metadata>) => void): void {
    callback(this);

    for (const child of this.children) {
      child.traverse(callback);
    }
  }
}

export { FileNode };
