/** Standard object with unknown values. */
type SimpleObject = Record<string, unknown>;

/** Helper for the result of a `tsImport`. */
type ImportedModule<
  DefaultExport,
  NamedExports extends SimpleObject = SimpleObject,
> = NamedExports & {
  /** The default export of the imported module. */
  default?: DefaultExport;
};

export type { ImportedModule, SimpleObject };
