import { readFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

import { fdir } from 'fdir';
import {
  createCompilerHost,
  createProgram,
  parseJsonConfigFileContent,
  readConfigFile,
  resolveModuleName,
  sys,
} from 'typescript';

import { defaultCompilerOptions } from '@/config';
import { logger } from '@/utils';

import type { CompilerOptions, Diagnostic, ModuleResolutionHost, Program } from 'typescript';
import type { ExcludeFunction, GetCompilerOptionsReturn, Logger, TypescriptOptions } from '@/types';

/** Default globs for `fdir`. */
const DEFAULT_GLOBS = ['**/!(*.test|*.spec).@(js|ts)?(x)'];

/**
 * Utility class for dealing with the Typescript compiler.
 */
class Typescript {
  /** The directory path to use as root. */
  readonly #baseUrl: string;
  /** The resolved typescript {@link CompilerOptions}. */
  readonly #compilerOptions: CompilerOptions;
  /** Function to determine whether to exclude a file from crawling with fdir. */
  readonly #exclude: (dirname: string) => boolean;
  /** The fdir crawler instance. */
  readonly #fdir: fdir;
  /** An array of globs to match when crawling with fdir. */
  readonly #globs: string[];
  /** The typescript {@link ModuleResolutionHost} to use when resolving files. */
  readonly #host: ModuleResolutionHost;
  /** Logger instance for displaying debug messages. */
  readonly #log: Logger;
  /** The typescript {@link Program} to use when parsing. */
  readonly #program: Program;
  /** The path to the `tsconfig.json` file. */
  readonly #tsconfigPath: string;

  //===================================
  //== Constructor
  //===================================
  public constructor({
    baseUrl,
    debug,
    exclude = [],
    globs = DEFAULT_GLOBS,
    tsconfigPath,
  }: TypescriptOptions) {
    this.#log = logger(debug, 'typescript');

    this.#baseUrl = baseUrl;
    this.#exclude = this.#excludeFiles(exclude);
    this.#globs = globs;

    this.#fdir = new fdir()
      .glob(...this.#globs)
      .exclude(this.#exclude)
      .withFullPaths();

    const paths = this.#fdir.crawl(this.#baseUrl).sync();

    const {
      compilerOptions,
      errors,
      tsconfigPath: tsconfig,
    } = this.#getCompilerOptions(tsconfigPath);
    this.#compilerOptions = compilerOptions;
    this.#tsconfigPath = tsconfig;
    if (errors.length) {
      this.#log.error('Encountered errors parsing Typescript configuration:');
      for (const [i, err] of errors.entries()) {
        this.#log.error(`[${i}]: ${JSON.stringify(err, null, 2)}`);
      }
    }

    this.#program = createProgram({
      rootNames: paths,
      options: this.#compilerOptions,
    });

    this.#host = createCompilerHost(this.#compilerOptions);
  }

  //===================================
  //== Public Getters
  //===================================
  /** The typescript {@link CompilerOptions} to use. */
  public get compilerOptions(): CompilerOptions {
    return this.#compilerOptions;
  }

  /** The typescript {@link ModuleResolutionHost} to use when resolving files. */
  public get host(): ModuleResolutionHost {
    return this.#host;
  }

  /** The typescript {@link Program} to use when parsing. */
  public get program(): Program {
    return this.#program;
  }

  /** The path to the `tsconfig.json` file. */
  public get tsconfigPath(): string {
    return this.#tsconfigPath;
  }

  //===================================
  //== Public Static Methods
  //===================================
  /**
   * Extracts compiler options from a tsconfig file, or falls back to some defaults.
   * @param path The path to the `tsconfig.json` file provided in addon options.
   * @returns An object containing the {@link CompilerOptions}, resolved path to
   * the `tsconfig.json` file, and any errors encountered.
   */
  #getCompilerOptions(path: string | undefined): GetCompilerOptionsReturn {
    let compilerOptions: CompilerOptions = {
      ...defaultCompilerOptions,
      baseUrl: this.#baseUrl,
    };

    const filename = path ? basename(path) : 'tsconfig.json';
    const dir = path ? dirname(path) : this.#baseUrl;
    const tsconfigPath = resolve(dir, filename);
    const configErrors: Diagnostic[] = [];

    const tsconfigBase = dirname(tsconfigPath);
    const { config, error } = readConfigFile(tsconfigPath, filename =>
      readFileSync(filename, 'utf8'),
    );

    if (error != null) {
      configErrors.push(error);
    } else {
      const { options, errors } = parseJsonConfigFileContent(
        config,
        sys,
        tsconfigBase,
        {},
        tsconfigPath,
      );

      if (errors && errors.length) {
        configErrors.push(...errors);
      } else {
        compilerOptions = options;
      }
    }

    return { compilerOptions, errors: configErrors, tsconfigPath };
  }

  //===================================
  //== Private Methods
  //===================================
  /**
   * Generates the expected `exclude` function for `fdir` from user options.
   * @param exclude The `exclude`  array, or function from the addon options.
   * @returns An {@link ExcludeFunction} to pass to `fdir`.
   */
  #excludeFiles(exclude: TypescriptOptions['exclude']): ExcludeFunction {
    return (dirname: string): boolean => {
      if (typeof exclude === 'function') {
        return exclude(dirname);
      }
      if (Array.isArray(exclude)) {
        for (const re of exclude) {
          const result = re.test(dirname);
          if (result) return true;
        }
      }
      if (dirname.includes('node_modules')) return true;
      return false;
    };
  }

  /**
   * Resolves a relative path to an absolute path using the typescript resolver.
   * @param importPath The import path to resolve.
   * @param basePath The path that a relative path is relative to.
   * @returns The absolute path to a module.
   */
  public resolvePath(importPath: string, basePath: string): string {
    const resolvedModule = resolveModuleName(
      importPath,
      basePath,
      this.#compilerOptions,
      this.#host,
    );

    if (resolvedModule.resolvedModule) {
      return resolvedModule.resolvedModule.resolvedFileName;
    } else {
      throw new Error(`Could not resolve file path ${importPath} from ${basePath}.`);
    }
  }
}

export { Typescript };
