import { JsxEmit, ModuleKind, ScriptTarget } from 'typescript';

import type { CompilerOptions } from 'typescript';

/** Default {@link CompilerOptions} to use when none are provided. */
const defaultCompilerOptions: CompilerOptions = {
  jsx: JsxEmit.React,
  module: ModuleKind.ESNext,
  target: ScriptTarget.Latest,
};

export { defaultCompilerOptions };
