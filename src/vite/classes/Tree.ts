import { platform } from 'node:os';
import { join, posix, resolve, win32 } from 'node:path';
import { performance } from 'node:perf_hooks';

import { nanoid } from 'nanoid';

import { REGEX } from '@/constants';
import { logger } from '@/utils';

import { getElapsedTime } from '../utils';
import { FileNode } from './FileNode';
import { Parser } from './Parser';

import type {
  DetailedUid,
  FileNodeOptions,
  Logger,
  ParsedStoryFile,
  PartiallyParsedComponent,
  SimpleObject,
  StoryWithArgs,
  TreeOptions,
  UidGeneratorFn,
  Uids,
} from '@/types';
import type { Typescript } from './Typescript';

/**
 * Main class for managing Component Tree and UID creation.
 */
class Tree<Metadata extends SimpleObject> {
  //===================================
  //== Private Readonly Properties
  //===================================
  /** The length of time it took to initialize the tree (in seconds). */
  readonly #createTime: string;
  /** The initial file paths to build the tree from. */
  readonly #entryFiles: string[];
  /** The component object's key containing metadata to  */
  readonly #metadataKey: string;
  /** Logger instance for displaying debug messages. */
  readonly #log: Logger;
  /** Parser instance for extracting information from files. */
  readonly #parser: Parser<Metadata>;
  /** The story files relating to components in the tree. */
  readonly #stories: ParsedStoryFile[];
  /** The tree data. */
  readonly #tree: FileNode<Metadata>;
  /** The custom metadata generator passed to the addon. */
  readonly #uidGenerator: UidGeneratorFn<Metadata>;

  //===================================
  //== Public Readonly Properties
  //===================================
  /** The common path section for relative paths. */
  public readonly basePath: string;
  /** Whether to output debugging logs. */
  public readonly debug: boolean;
  /** Typescript helper class instance. */
  public readonly typescript: Typescript;

  //===================================
  //== Private Properties
  //===================================
  /** The length of time it took to build out the tree (in seconds). */
  #buildTime: string | null;
  /** The files that make up the tree. */
  #files: FileNode<Metadata>[];
  /** Whether UIDs should be generated. */
  #shouldGenerateUids: boolean;
  /** The generated UIDs. */
  #uids: Uids;

  //===================================
  //== Constructor
  //===================================
  public constructor({
    basePath,
    debug,
    entryFiles,
    metadataKey,
    stories = [],
    typescript,
    uidGenerator,
  }: TreeOptions<Metadata>) {
    // Record how long tree generation takes.
    const startTime = performance.now();

    this.debug = debug;
    this.#log = logger(debug, 'component-tree');

    this.basePath = basePath;
    this.#buildTime = null;
    this.#entryFiles = entryFiles.map(filePath => Tree.#processFilePath(filePath));
    this.#files = [];
    this.#shouldGenerateUids = false;
    this.#metadataKey = metadataKey;
    this.#stories = stories;
    this.typescript = typescript;
    this.#uidGenerator = uidGenerator;
    this.#uids = {};

    this.#parser = new Parser({ tree: this });

    // Create the root file
    this.#tree = this.#createRoots();

    const endTime = performance.now();
    this.#createTime = getElapsedTime(startTime, endTime);
    this.#log.verbose(`Component tree initialized in ${this.#createTime}.`);
  }

  //===================================
  //== Public Getters
  //===================================
  /** Whether UIDs should be generated. */
  public get shouldGenerateUids(): boolean {
    return this.#shouldGenerateUids;
  }

  /** The key that contains Metadata. */
  public get metadataKey(): string {
    return this.#metadataKey;
  }

  /** An array of {@link ParsedStoryFile}s that have not been used during parsing. */
  public get unusedStories(): ParsedStoryFile[] {
    return this.#stories.filter(story => !story.used);
  }

  /** The generated UIDs. */
  public get uids(): Uids {
    return this.#uids;
  }

  //===================================
  //== Private Static Methods
  //===================================
  /**
   * Finds stories that contain all of the correct props values.
   * @param props The props values to find matching stories for.
   * @param stories The full array of stories to match against.
   * @returns An array of Story IDs that match the given props.
   */
  static #findStoryWithProps(props: SimpleObject, stories: StoryWithArgs[]): string[] {
    const matches: string[] = [];

    for (const story of stories) {
      const storyArgs = story.args;
      let match = false;

      if (Object.entries(props).length === 0) {
        matches.push(story.id);
      } else {
        for (const [prop, value] of Object.entries(props)) {
          const arg = storyArgs[prop];
          if (arg?.value !== value) {
            match = false;
          }
        }
        if (match) {
          matches.push(story.id);
        }
      }
    }

    return [...new Set(matches)];
  }

  /**
   * Converts a standard file path into those used by WSL.
   * @param filePath The filePath to convert.
   * @returns A converted filePath.
   */
  static #processFilePath(filePath: string): string {
    let output = filePath;
    const first = filePath[0] ?? '';

    if (platform() === 'linux' && filePath.includes('wsl$')) {
      // Fix when selecting files in wsl file system
      output = resolve(filePath.split(win32.sep).join(posix.sep));
      output = `/${output.split('/').slice(3).join('/')}`;
    } else if (platform() === 'linux' && /[a-z]/iu.test(first)) {
      // Fix for when running wsl but selecting files held on windows file system
      const root = `/mnt/${first.toLowerCase()}`;
      output = join(root, filePath.split(win32.sep).slice(1).join(posix.sep));
    }

    return output.replace(REGEX.FILE_PATH, REGEX.REPLACEMENTS.EMPTY);
  }

  //===================================
  //== Private Methods
  //===================================
  /**
   * Adds a UID to the map.
   * @param key The key to add the UID under.
   * @param value The {@link DetailedUid} value.
   */
  #addUid(key: string, value: DetailedUid): void {
    const existing = this.#uids[key];
    if (existing) {
      this.#log.warn(`UID ${value.uid} already exists for ${value.componentId}.`);
    } else {
      this.#uids[key] = value;
    }
  }
  /**
   * Creates a single root file for the tree, including a virtual root if
   * multiple roots have been provided.
   * @returns The root {@link FileNode} for the tree.
   */
  #createRoots(): FileNode<Metadata> {
    let root: FileNode<Metadata>;
    const first = this.#entryFiles[0];

    if (this.#entryFiles.length === 1 && first) {
      // There's only 1 entry file - it can be used as the root.
      root = FileNode.create({ filePath: first, root: true, tree: this });
    } else {
      // There are multiple entry files, but we want only one as root.
      // Create a virtual root with the others as children.
      root = FileNode.create({ filePath: this.basePath, tree: this, virtualRoot: true });

      root.children = this.#entryFiles.map(entryFile => {
        this.#log.verbose(`Child File Path`, entryFile);
        return FileNode.create({ filePath: entryFile, root: true, tree: this });
      });
    }

    return root;
  }

  //===================================
  //== Public Methods
  //===================================
  /**
   * Adds a FileNode to the tree's list of files if not already present.
   * @param fileNode The {@link FileNode} instance to add.
   */
  public addFileNode(fileNode: FileNode<Metadata>, suppressWarning: boolean = false): void {
    const existing = this.findFileNode({ ...fileNode });

    if (existing && !suppressWarning) {
      this.#log.warn(`File ${fileNode.filePath} already exists.`);
    } else if (!existing) {
      this.#files.push(fileNode);
    }
  }

  /**
   * Builds out the component tree from the entry files, and optionally the UIDs.
   * @param generateUids Whether to generate UIDs as part of the tree generation.
   * @returns The root {@link FileNode} of the generated tree.
   */
  public buildTree(generateUids: boolean): FileNode<Metadata> {
    const startTime = performance.now();

    this.#shouldGenerateUids = generateUids;
    this.#parser.parseTree(this.#tree);

    const endTime = performance.now();
    this.#buildTime = getElapsedTime(startTime, endTime);
    this.#log.verbose(`Component tree built in ${this.#buildTime}.`);
    return this.#tree;
  }

  /**
   * Generates the UIDs for the entry files.
   * @returns The generated UIDs map.
   */
  public buildUids(): Uids {
    const startTime = performance.now();

    this.#shouldGenerateUids = true;
    this.#parser.parseUids(this.#tree);

    const endTime = performance.now();
    this.#buildTime = getElapsedTime(startTime, endTime);
    this.#log.verbose(`UIDs generated in ${this.#buildTime}.`);

    return this.#uids;
  }

  /**
   * Checks whether a FileNode is already present in the tree's files array.
   * @param options The {@link FileNodeOptions} that would be passed to a new {@link FileNode}.
   * @returns The found {@link FileNode}, or null if one cannot be found.
   */
  public findFileNode(options: FileNodeOptions<Metadata>): FileNode<Metadata> | null {
    // TODO: Deal with error response?
    const resolvedPath = FileNode.validateFilePath(
      options.filePath,
      options.parent?.filePath ?? this.basePath,
      this.typescript,
    );

    return this.#files.find(file => file.filePath === resolvedPath.filePath) ?? null;
  }

  /**
   * Finds the data for a specific story file.
   * @param path The path to the story file to get the data for.
   * @returns The {@link ParsedStoryFile} data for the given story file, or `null`
   * if none can be found.
   */
  public findStoryFileData(path: string): ParsedStoryFile | null {
    const found = this.#stories.find(storyFile => storyFile.storyFilePath === path) ?? null;
    // found && (found.used = true);
    return found;
  }

  /**
   * Finds the story file data for a specific component.
   * @param path The path to the component file that a story relates to.
   * @returns The {@link ParsedStoryFile} data for the given component, or `null`
   * if none can be found.
   */
  public findStoryFileForComponent(path: string): ParsedStoryFile | null {
    const found = this.#stories.find(storyFile => storyFile.componentPath === path) ?? null;
    found && (found.used = true);
    return found;
  }

  /**
   * Generates the UIDs for a specific component.
   * @param component The {@link PartiallyParsedComponent} data generated for a
   * file.
   * @param storyFile The linked {@link ParsedStoryFile}.
   * @returns A {@link Uid} map object containing the generated UIDs for the component.
   */
  public generateUids(
    component: PartiallyParsedComponent<Metadata>,
    storyFile: ParsedStoryFile | null,
  ): Uids {
    const { metadata, stories } = component;
    const uids: Uids = {};

    if (!metadata || Object.keys(metadata).length === 0) return uids;

    const componentId = nanoid();

    const result = this.#uidGenerator(metadata, componentId);

    for (const uid of result) {
      const uidKey = `${uid.componentId}-${uid.uid}`;
      const existing = this.#uids[uidKey];
      if (existing) {
        this.#log.warn(`UID ${uid.uid} already exists.`);
      } else {
        const value: DetailedUid = {
          componentId,
          isAlias: uid.isAlias ?? false,
          props: uid.props,
          storyFilePath: storyFile?.storyFilePath ?? null,
          storyIds: Tree.#findStoryWithProps(uid.props, stories),
          uid: uid.uid,
        };
        // Add to both the returned value and the Tree's map so we can return the
        // ones generated in this pass.
        this.#addUid(uidKey, value);
        uids[uidKey] = value;
      }
    }

    return uids;
  }

  /**
   * Converts the tree into a serializable version for storing in the cache file.
   * @returns The serialized tree.
   */
  public serialize() {
    return this.#tree.serialize();
  }
}

export { Tree };
