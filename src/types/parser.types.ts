import type { SimpleObject } from './base.types';
import type { FileNode, Tree } from '@/vite/classes';
import type { StoryWithArgs } from './storybook.types';

/** Options accepted by the AstParser constructor. */
type AstParserOptions<Metadata extends SimpleObject> = {
  /** The file to parse. */
  file: FileNode<Metadata>;
  /** The {@link Tree} that the instance belongs to. */
  tree: Tree<Metadata>;
};

/** Options accepted by the Parser constructor. */
type ParserOptions<Metadata extends SimpleObject> = {
  /** The {@link Tree} that the instance belongs to. */
  tree: Tree<Metadata>;
};

/** The result of parsing a file for UIDs. */
type PartiallyParsedComponent<Metadata extends SimpleObject> = {
  /** The name of the component. */
  componentName: string | undefined;
  /** The extracted Metadata. */
  metadata: Metadata | null;
  /** The story data for the component. */
  stories: StoryWithArgs[];
};

export type { AstParserOptions, ParserOptions, PartiallyParsedComponent };
