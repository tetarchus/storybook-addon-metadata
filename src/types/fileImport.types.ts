import type { Node } from 'typescript';

/** Function used to import a module. */
type ImportFn = 'import' | 'require';
/** The type of value imported. */
type ImportKind = 'type' | 'value';
/** Method of import. */
type ImportMethod = 'default' | 'named' | 'namespace' | 'side-effect';

/** Partial import data extracted from named import/export map. */
type ImportName = {
  /** The local name of the import/export. */
  alias: string | undefined;
  /** The kind of value being imported/exported. */
  kind: ImportKind;
  /** The method used to import/export. */
  method: ImportMethod;
  /** The original name of the import/export. */
  name: string;
  /** The {@link Node} containing the import/export identifier. */
  node?: Node;
};

export type { ImportFn, ImportKind, ImportMethod, ImportName };
