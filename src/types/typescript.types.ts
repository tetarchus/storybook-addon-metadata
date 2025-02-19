import type { CompilerOptions, Diagnostic } from 'typescript';

/** Function for determining whether to exclude a file from `fdir`s crawl. */
type ExcludeFunction = (dirName: string) => boolean;

/** Returned value from `#getCompilerOptions` */
type GetCompilerOptionsReturn = {
  /** The resolved {@link CompilerOptions}. */
  compilerOptions: CompilerOptions;
  /** Errors encountered during generation. */
  errors: Diagnostic[];
  /** The path to the `tsconfig.json` file. */
  tsconfigPath: string;
};

/** Options accepted by the Typescript constructor. */
type TypescriptOptions = {
  /** The `baseUrl` value for typescript options. */
  baseUrl: string;
  /** Whether to display debugging messages. */
  debug: boolean;
  /** RegExp array, or function for determining whether to exclude a path. */
  exclude?: RegExp[] | ExcludeFunction;
  /** Globs of files to match for the `fdir` crawler. */
  globs?: string[];
  /** The provided path to the `tsconfig.json` file. */
  tsconfigPath?: string | undefined;
};

export type { ExcludeFunction, GetCompilerOptionsReturn, TypescriptOptions };
