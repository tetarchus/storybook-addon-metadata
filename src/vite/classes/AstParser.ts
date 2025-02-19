import ts from 'typescript';

import { DEVELOPMENT_MODE } from '@/config';
import { DEFAULTS, EXPORTS, FALLBACK } from '@/constants';
import { logger } from '@/utils';

import type { FileNode } from './FileNode';
import type { Tree } from './Tree';
import type { Typescript } from './Typescript';
import type {
  AstParserOptions,
  ImportKind,
  ImportName,
  Logger,
  ParsedStoryFile,
  SimpleObject,
  StoryWithArgs,
} from '@/types';

/** Logger for displaying uncovered nodes while running development. */
const uncovered = logger(DEVELOPMENT_MODE, 'ast-uncovered');

/**
 * Typescript AST parser for extracting data from a file.
 */
class AstParser<Metadata extends SimpleObject> {
  //===================================
  //== Private Readonly Properties
  //===================================
  /** Instance of the typescript {@link ts.TypeChecker|TypeChecker} to use. */
  readonly #checker: ts.TypeChecker;
  /** The {@link FileNode} to parse. */
  readonly #file: FileNode<Metadata>;
  /** Logger instance for displaying messages. */
  readonly #log: Logger;
  /** Instance of the typescript {@link ts.Program|Program} to use. */
  readonly #program: ts.Program;
  /** The parsed {@link ts.SourceFile|SourceFile}. */
  readonly #sourceFile: ts.SourceFile;
  /** The linked story file data. */
  readonly #storyFile: ParsedStoryFile | null;
  /** {@link Typescript} instance to use. */
  readonly #typescript: Typescript;
  /** The {@link Tree} that this belongs to. */
  readonly #tree: Tree<Metadata>;

  //===================================
  //== Constructor
  //===================================
  public constructor({ file, tree }: AstParserOptions<Metadata>) {
    this.#tree = tree;
    this.#log = logger(this.#tree.debug, 'ast-parser');

    this.#file = file;
    this.#typescript = this.#tree.typescript;
    this.#program = this.#typescript.program;
    this.#checker = this.#program.getTypeChecker();
    this.#sourceFile = this.#createSourceFile(this.#file.filePath);
    this.#storyFile = this.#file.storyFile;
  }

  //===================================
  //== Private Static Methods
  //===================================
  /**
   * Assembles an object access path into a single string.
   * @param left The left-hand string.
   * @param right The right-hand string.
   * @param isOptional The access is optional.
   * @returns A string with the composed access name separated with `'.'`/`'?.'`/
   */
  static #composeAccessName(
    left: string | undefined,
    right: string | undefined,
    isOptional: boolean = false,
  ): string | undefined {
    if (!left && !right) return undefined;
    const leftText = left ?? '';
    const rightText = right ?? '';
    const connector =
      left && isOptional ? DEFAULTS.OPTIONAL_CONNECTOR : left ? DEFAULTS.CONNECTOR : '';

    return `${leftText}${connector}${rightText}`.trim() || undefined;
  }

  /**
   * Determines whether an import is for a `value` or `type` based on whether
   * it has a `type` keyword in the clause or specifier.
   * @param parentTypeOnly Whether the {@link ts.ImportClause|ImportClause} is
   * specified as "type only", e.g: `import type { Name } from 'mod';`.
   * @param childTypeOnly Whether the {@link ts.ImportSpecifier|ImportSpecifier}
   *  is specified as "type only", e.g: `import { type Name } from 'mod';`.
   * @returns The determined {@link ImportKind}.
   */
  static #extractImportExportKind(parentTypeOnly: boolean, childTypeOnly?: boolean): ImportKind {
    return parentTypeOnly || childTypeOnly ? 'type' : 'value';
  }

  /**
   * Extracts the canonical name and local alias of an import.
   * @param specifier The {@link ts.ImportSpecifier|ImportSpecifier} or
   * {@link ts.ExportSpecifier|ExportSpecifier} to extract the name of.
   * @returns An object containing the local alias of an import, and the
   * original name of the import.
   */
  static #extractImportExportName(
    specifier: ts.ExportSpecifier | ts.ImportSpecifier,
  ): Pick<ImportName, 'alias' | 'name'> {
    const alias = specifier.name.text;
    const name = specifier.propertyName?.text ?? alias;

    return {
      alias: alias === name ? undefined : alias,
      name,
    };
  }

  /**
   * Extracts a name string from a {@link ts.Node|Node}.
   * @param name The {@link ts.Node|Node} containing the name to extract.
   * @returns The extracted name string, or `undefined` if none can be extracted.
   */
  static #extractName(
    name:
      | ts.DeclarationName
      | ts.EntityName
      | ts.PropertyName
      | ts.JsxTagNameExpression
      | undefined,
  ): string | undefined {
    if (!name) return undefined;

    if (ts.isArrayBindingPattern(name) || ts.isObjectBindingPattern(name)) {
      // There's not a simple name, and we will likely be extracting the properties instead.
      return undefined;
    } else if (ts.isComputedPropertyName(name)) {
      const { expression } = name;
      return AstParser.#extractNameFromExpression(expression);
    } else if (ts.isElementAccessExpression(name)) {
      const { argumentExpression, expression, questionDotToken } = name;
      const right = AstParser.#extractNameFromExpression(argumentExpression);
      const left = AstParser.#extractNameFromExpression(expression);

      return AstParser.#composeAccessName(left, right, questionDotToken != null);
    } else if (ts.isPropertyAccessExpression(name)) {
      const { expression: left, name: right, questionDotToken } = name;
      const leftName = AstParser.#extractName(left);

      return AstParser.#composeAccessName(leftName, right.text, questionDotToken != null);
    } else if (ts.isJsxNamespacedName(name)) {
      const { name: jsxName, namespace } = name;
      return AstParser.#composeAccessName(namespace.text, jsxName.text);
    } else if (ts.isQualifiedName(name)) {
      const { left, right } = name;
      const leftName = AstParser.#extractName(left);
      return AstParser.#composeAccessName(leftName, right.text);
    } else if (name.kind === ts.SyntaxKind.ThisKeyword) {
      return FALLBACK.THIS;
    }

    return name.text;
  }

  /**
   * Extracts a name string from an {@link ts.Expression|Expression}.
   * @param expression The {@link ts.Expression|Expression} to extract the name from.
   * @returns The extracted name string, or `undefined` if none can be extracted.
   */
  static #extractNameFromExpression(expression: ts.Expression): string | undefined {
    if (ts.isPropertyAccessExpression(expression)) {
      // The primary case for this function.
      // The 'isPropertyAccessExpression' case in `#extractName` covers a specific
      // sub-type that is typed to only contain identifiers.
      const { expression: left, name: right, questionDotToken } = expression;
      const leftName = AstParser.#extractNameFromExpression(left);
      const rightName = AstParser.#extractName(right);

      return AstParser.#composeAccessName(leftName, rightName, questionDotToken != null);
    } else if (
      ts.isArrayBindingPattern(expression) ||
      ts.isElementAccessExpression(expression) ||
      ts.isEntityName(expression) ||
      ts.isJsxTagNameExpression(expression) ||
      ts.isPropertyName(expression) ||
      ts.isObjectBindingPattern(expression)
    ) {
      // The others covered by `#extractName`
      return AstParser.#extractName(expression);
    } else {
      uncovered.verbose('extractNameFromExpression', ts.SyntaxKind[expression.kind]);
    }

    return undefined;
  }

  /**
   * Filters the stories to either exclude any that match `excludeStories`, or
   * only include stories from `includeStories`. If both are empty arrays, no
   * filtering will occur and all stories will be returned.
   * @param stories The full array of stories.
   * @param includeStories An array of story IDs to include, or a RegExp to match
   * to story IDs. Can be an empty array to include all stories except those in
   * `excludeStories`.
   * @param excludeStories An array of story IDs to include or a RegExp to match
   * to story IDs. Can be an empty array to fall back to `includeStories`.
   * @returns
   */
  static #getStoriesToInclude(
    stories: StoryWithArgs[],
    includeStories: RegExp | string[],
    excludeStories: RegExp | string[],
  ): StoryWithArgs[] {
    // Only one of include/exclude should have values. Prioritize exclude.
    if (stories.length === 0) return stories;

    if (excludeStories instanceof RegExp || excludeStories.length > 0) {
      return stories.filter(story =>
        excludeStories instanceof RegExp
          ? !excludeStories.test(story.id)
          : !excludeStories.includes(story.id),
      );
    } else if (includeStories instanceof RegExp || excludeStories.length > 0) {
      return stories.filter(story =>
        includeStories instanceof RegExp
          ? includeStories.test(story.id)
          : includeStories.includes(story.id),
      );
    } else {
      // Neither have values - return all stories.
      return stories;
    }
  }

  //===================================
  //== Private Methods
  //===================================
  /**
   * Parses a file into a {@link ts.SourceFile|SourceFile} to allow extracting
   * data from the AST.
   * @param filePath The path to the file to create a SourceFile for.
   * @returns The parsed SourceFile.
   */
  #createSourceFile(filePath: string): ts.SourceFile {
    const sourceFile = filePath ? this.#program.getSourceFile(filePath) : null;

    if (!sourceFile) {
      throw new Error(`Could not create AST source for ${filePath}.`);
    }

    return sourceFile;
  }

  /**
   * Extracts the names of imports from an {@link ts.ImportClause|ImportClause}.
   * @param importClause The {@link ts.ImportClause|ImportClause} to extract
   * names from.
   * @returns An array of {@link ImportName}s containing the extracted names.
   */
  #extractImportNamesFromImportClause(importClause: ts.ImportClause | undefined): ImportName[] {
    const importNames: ImportName[] = [];
    if (!importClause) return importNames;

    const { isTypeOnly, name, namedBindings } = importClause;

    if (name) {
      // Default Import
      importNames.push({
        alias: name.text,
        kind: 'value',
        method: 'default',
        name: EXPORTS.DEFAULT,
        node: name,
      });
    } else if (namedBindings) {
      // Named / Namespace Imports
      if (ts.isNamedImports(namedBindings)) {
        // Named Import
        const { elements } = namedBindings;

        for (const element of elements) {
          const { isTypeOnly: typeOnly } = element;
          const { alias, name } = AstParser.#extractImportExportName(element);
          const kind = AstParser.#extractImportExportKind(isTypeOnly, typeOnly);

          importNames.push({ alias, kind, method: 'named', name, node: element });
        }
      } else {
        // Namespace Import
        const alias = namedBindings.name.text;

        importNames.push({
          alias,
          kind: AstParser.#extractImportExportKind(isTypeOnly),
          method: 'namespace',
          name: EXPORTS.NAMESPACE,
          node: namedBindings,
        });
      }
    }

    return importNames;
  }

  /**
   * Converts the metadata object node into the metadata object.
   * @param expression The {@link ts.Expression|Expression} containing the metadata.
   * This is expected to be a {@link ts.ObjectLiteralExpression|ObjectLiteralExpression}.
   * @returns The extracted Metadata, or null if no/unrecognized expression.
   */
  #extractMetadataFromExpression(expression: ts.Expression | undefined): Metadata | null {
    if (!expression) return null;

    if (ts.isObjectLiteralExpression(expression)) {
      // A bit of a hack to prevent having to fully parse the data
      // But its the user's own code that it impacts.
      const parsed = new Function(`return ${expression.getText()}`)();
      return parsed as Metadata;
    } else {
      this.#log.warn(
        `Expected metadata to be an ObjectLiteralExpression. Got ${ts.SyntaxKind[expression.kind]}.`,
      );
    }

    return null;
  }

  /**
   * Extracts the value of a given property. If an `objectName` is given, that must
   * also be matched in order to extract the value, otherwise the `propertyName`
   * will be extracted if it exists.
   * @param statement The {@link ts.ExpressionStatement|ExpressionStatement} that
   * to extract the property from.
   * @param propertyName The key of the property to extract.
   * @param objectName The optional name of the object to match.
   * @returns An object containing the object name, operator, and value of the property.
   */
  #extractPropertyFromExpressionStatement(
    statement: ts.ExpressionStatement,
    propertyName: string,
    objectName?: string,
  ): {
    objectName: string | undefined;
    operatorToken: ts.BinaryOperatorToken;
    value: ts.Expression;
  } | null {
    const { expression } = statement;

    if (ts.isBinaryExpression(expression)) {
      const { left, operatorToken, right } = expression;

      if (ts.isPropertyAccessExpression(left)) {
        const name = AstParser.#extractNameFromExpression(left);
        if (!name) return null;
        const [object, ...property] = name.split(DEFAULTS.CONNECTOR);
        // If `objectName` has been provided, check that it matches.
        if (objectName && objectName !== object) return null;
        // Otherwise we either don't care about the object name, or it's a match.
        // Now check that the propertyName lines up.
        const expectedProperties = propertyName.split(DEFAULTS.CONNECTOR);
        if (expectedProperties.length !== property.length) return null;
        for (const [index, prop] of expectedProperties.entries()) {
          const actual = property[index];
          if (actual !== prop) return null;
        }
        // If we're here - everything matched up! Extract the value.
        return { objectName: object, operatorToken, value: right };
      }
    }

    return null;
  }

  /**
   * Extracts the node containing the import for a specific component.
   * @param componentName The name of the imported component.
   * @param importPath The path to the component file.
   * @returns The extracted {@link ts.Node|Node} containing the import name.
   */
  #findComponentImportDeclaration(
    componentName: string | undefined,
    importPath: string | null,
  ): ts.Node | null {
    // If both don't exist, we can't locate the import.
    if (!componentName || !importPath) return null;

    for (const statement of this.#sourceFile.statements) {
      if (ts.isImportDeclaration(statement)) {
        const { importClause, moduleSpecifier } = statement;
        // This should always be the case - otherwise it's a grammar error.
        if (ts.isStringLiteral(moduleSpecifier)) {
          const path = moduleSpecifier.text;
          const resolvedModule = ts.resolveModuleName(
            path,
            this.#file.filePath,
            this.#typescript.compilerOptions,
            this.#typescript.host,
          );
          const resolvedComponentPath = resolvedModule.resolvedModule?.resolvedFileName;
          if (resolvedComponentPath === importPath) {
            // It's the correct declaration
            const importNames = this.#extractImportNamesFromImportClause(importClause);
            const importedComponent = importNames.find(name => name.name === componentName);
            if (importedComponent) {
              // We've found the import
              return importedComponent.node ?? null;
            }
          }
        }
      } else {
        // TODO: Just for testing to see if we need to cover any other types.
        uncovered.verbose('findComponentImportDeclaration', ts.SyntaxKind[statement.kind]);
      }
    }

    return null;
  }

  /**
   * Extracts the Metadata from the original definition of an import.
   * @param node The {@link ts.Node|Node} containing the import name for the component.
   * @param componentName The name of the component.
   * @param componentPath The path to the component file.
   * @returns The extracted Metadata, or null if none can be found.
   */
  #findComponentMetadata(
    node: ts.Node,
    componentName: string,
    componentPath: string | null,
  ): Metadata | null {
    const componentSourceFile =
      this.#findComponentSourceFile(node) ??
      (componentPath != null ? this.#createSourceFile(componentPath) : null);

    if (!componentSourceFile) return null;

    // Search for the ExpressionStatement that contains metadata
    for (const statement of componentSourceFile.statements) {
      if (ts.isExpressionStatement(statement)) {
        const { operatorToken, value } =
          this.#extractPropertyFromExpressionStatement(
            statement,
            this.#tree.metadataKey,
            componentName,
          ) ?? {};
        if (operatorToken?.kind !== ts.SyntaxKind.EqualsToken) {
          this.#log.warn(
            `Metadata assigned with ${operatorToken ? ts.SyntaxKind[operatorToken.kind] : 'undefined'}. Expected simple EqualsToken assignment.`,
          );
        }

        // Object name to extractPropertyFromExpressionStatement, or deal with extra
        // components we don't have story files for (or do, and we're not currently parsing it...)
        const metadata = this.#extractMetadataFromExpression(value);

        return metadata;
      }
    }

    return null;
  }

  /**
   * Finds the source file containing the component, following any import/export
   * chains.
   * @param node The {@link ts.Node|Node} containing the import name.
   * @returns The {@link ts.SourceFile|SourceFile} containing the original definition
   * of the imported component.
   */
  #findComponentSourceFile(node: ts.Node): ts.SourceFile | null {
    const type = this.#checker.getTypeAtLocation(node);
    const symbol = type.getSymbol() ?? type.aliasSymbol;
    const valueDeclaration = symbol?.valueDeclaration;
    const source = valueDeclaration?.getSourceFile();

    if (!source) {
      this.#log.verbose(`findComponentSourceFile - Missing source for import ${node.getText()}.`, {
        symbol,
        node,
      });
    }

    return source ?? null;
  }

  //===================================
  //== Public Methods
  //===================================
  /**
   * Extracts imports/exports and variables from the file.
   */
  public getFileContents() {
    // TODO:
  }

  /**
   * Generate all UIDs for the file by extracting the Metadata and building out
   * the UIDs from the Metadata.
   */
  public getUids(): void {
    // For now, we expect this to be story files, so if not, return.
    if (!this.#file.isStoryFile || !this.#storyFile) return;

    const {
      componentPath,
      componentName,
      excludeStories = [],
      includeStories = [],
      stories,
    } = this.#storyFile ?? {};
    const node = this.#findComponentImportDeclaration(componentName, componentPath);

    if (node && componentName) {
      // We have the import statement and the defined node. Now we need to locate
      // the file it's defined in, and extract the metadata.
      const metadata = this.#findComponentMetadata(node, componentName, componentPath);
      const componentStories = AstParser.#getStoriesToInclude(
        stories,
        includeStories,
        excludeStories,
      );

      this.#tree.generateUids(
        { componentName, metadata, stories: componentStories },
        this.#storyFile,
      );
    }
  }
}

export { AstParser };
