import { logger } from '@/utils';

import { FileNode } from './FileNode';
import { AstParser } from './AstParser';

import type { Tree } from './Tree';
import type { Logger, ParserOptions, SimpleObject } from '@/types';

/**
 * Central parser instance for managing AST parsing for the tree.
 */
class Parser<Metadata extends SimpleObject> {
  //===================================
  //== Private Readonly Properties
  //===================================
  /** Logger instance for displaying debug messages. */
  readonly #log: Logger;
  /** Parent Tree instance. */
  readonly #tree: Tree<Metadata>;

  //===================================
  //== Constructor
  //===================================
  public constructor({ tree }: ParserOptions<Metadata>) {
    this.#tree = tree;
    this.#log = logger(this.#tree.debug, 'parser');
  }

  //===================================
  //== Private Methods
  //===================================
  /**
   * Extracts data from the file, and generates a tree of imported children.
   * @param file The {@link FileNode} to build out the component tree for.
   * @returns The updated {@link FileNode} with extracted data added.
   */
  #buildTree(file: FileNode<Metadata>): FileNode<Metadata> {
    if (!this.#checkFile(file)) return file;

    const astParser = this.#createAstParser(file);
    astParser.getFileContents();

    return file;
  }

  /**
   * Extracts metadata from the file and builds out UIDs for the component.
   * @param file The {@link FileNode} to generate UIDs for.
   * @returns The original {@link FileNode}.
   */
  #buildUids(file: FileNode<Metadata>): FileNode<Metadata> {
    if (!this.#checkFile(file)) return file;

    const astParser = this.#createAstParser(file);
    astParser.getUids();

    return file;
  }

  /**
   * Checks whether the file requires parsing.
   * @param file The {@link FileNode} to check.
   * @returns A boolean indicating whether parsing should proceed.
   */
  #checkFile(file: FileNode<Metadata>): boolean {
    if (file.parsed) {
      this.#log.verbose(`File ${file.filePath} has already been parsed.`);
      return false;
    }

    if (file.virtualRoot) {
      this.#log.verbose(`Skipping virtual root file ${file.filePath}.`);
      file.parsed = true;
      return false;
    }

    // Check whether the file is a third-party module
    if (FileNode.isThirdParty(file.filePath)) {
      file.thirdParty = true;
      if (file.fileName === 'react-router' || file.fileName === 'react-router-dom') {
        file.reactRouter = true;
      }
      this.#log.verbose(`Skipping third-party module ${file.filePath}`);

      file.parsed = true;
      return false;
    }

    if (file.error) {
      this.#log.error(file.error);
      file.parsed = true;
      return false;
    }

    return true;
  }

  /**
   * Creates an {@link AstParser} instance for the file to allow data extraction.
   * @param file The {@link FileNode} to create an {@link AstParser} instance
   * for.
   * @returns The created {@link AstParser} instance.
   */
  #createAstParser(file: FileNode<Metadata>): AstParser<Metadata> {
    return new AstParser({ file, tree: this.#tree });
  }

  //===================================
  //== Public Methods
  //===================================
  /**
   * Starts the tree build process from the `root` {@link FileNode}.
   * @param root The root {@link FileNode} to start building the component tree
   * from.
   */
  public parseTree(root: FileNode<Metadata>): void {
    root.traverse(this.#buildTree.bind(this));
  }

  /**
   * Creates UIDs for the root {@link FileNode}.
   * @param root The root {@link FileNode} to build out the UIDs for.
   */
  public parseUids(root: FileNode<Metadata>): void {
    root.traverse(this.#buildUids.bind(this));
  }
}

export { Parser };
