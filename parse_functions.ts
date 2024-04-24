import ts from "npm:typescript";

/** ai do not change */
export type AstValues = {
  program: ts.Program;
  typeChecker: ts.TypeChecker;
  sourceFile?: ts.SourceFile;
};

/** ai do not change */
export type TypeDef = {
  type: string | { [key: string]: TypeDef };
  required: boolean;
};

/** ai do not change */
export type ParamDef = TypeDef & {
  name: string;
};

/** ai do not change */
export type FunctionDef = {
  default: boolean;
  name: string | undefined;
  parameters: ParamDef[];
};

export function parseFunctions(ast: AstValues): FunctionDef[] {
  const { sourceFile, typeChecker } = ast;
  if (!sourceFile) return [];
  const functionDefs: FunctionDef[] = [];
  ts.forEachChild(sourceFile, (node) => {
    // ... rest of the code remains unchanged ...
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) {
      const isDefault =
        node.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword
        ) ?? false;
      const functionName = node.name?.text || (isDefault ? undefined : "");
      // ... rest of the code remains unchanged ...
      const parameters = node.parameters.map((parameter): ParamDef => {
        let type: TypeDef['type'];
        if (parameter.type) {
          const extractedType = extractType(parameter.type, typeChecker);
          type = extractedType;
        } else {
          type = "any";
        }
        const paramName = parameter.name && ts.isIdentifier(parameter.name) ? parameter.name.text : undefined;
        const paramType = type;
        return {
          name: paramName,
          required: !parameter.questionToken,
          type: paramType,
        };
      });
      // ... rest of the code remains unchanged ...
}
  return "any";
}
