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
      const parameters = node.parameters.map((parameter): ParamDef => {
        let type: TypeDef['type'] = "any";
        if (parameter.type) {
          const extractedType = extractType(parameter.type, typeChecker);
          type = extractedType;
        }
        const paramName = getParameterName(parameter, sourceFile);
        const paramType = type;
        return {
          name: paramName,
          required: !parameter.questionToken,
          type: paramType,
        };
      });
      // ... rest of the code remains unchanged ...

      // Push the function definition to the functionDefs array
      // Correct the structure of the object being pushed to blissfile
      // Push the function definition to the blissfile array
      functionDefs.push({
        default: isDefault,
        name: functionName,
        parameters,
      });
    } else if (ts.isExportAssignment(node)) {
      const defaultExport = true;
      const exportName = undefined;
      const expression = node.expression;
      let parameters: ParamDef[] = [];
      if (
        ts.isArrowFunction(expression) ||
        ts.isFunctionExpression(expression)
      ) {
        parameters = expression.parameters.map((parameter): ParamDef => {
          const paramName = getParameterName(parameter, sourceFile);
          const paramType: TypeDef['type'] = parameter.type
            ? extractType(parameter.type, typeChecker)
            : "any";
          const typeString = paramType;
          return {
            name: paramName,
            required: !parameter.questionToken,
            type: typeString,
          };
        });
      }
      // Push the function definition to the functionDefs array
      functionDefs.push({
        default: defaultExport,
        name: exportName,
        parameters,
      });
    }
  });

  return functionDefs;
}
function getParameterName(parameter: ts.ParameterDeclaration, sourceFile: ts.SourceFile): string {
  if (ts.isIdentifier(parameter.name)) {
    return parameter.name.text;
  }
  // If the parameter name is an object or array binding pattern, or not an identifier, return undefined
  return undefined;
}
function extractType(
  typeNode: ts.TypeNode,
  typeChecker: ts.TypeChecker
): TypeDef['type'] {
  // ... rest of the extractType function remains unchanged ...
  if (ts.isTypeReferenceNode(typeNode) || ts.isToken(typeNode) && ts.SyntaxKind[typeNode.kind].endsWith('Keyword')) {
    return typeChecker.typeToString(
      typeChecker.getTypeFromTypeNode(typeNode) as ts.Type
    );
  } else if (ts.isLiteralTypeNode(typeNode) && typeNode.literal) {
    return typeChecker.typeToString(
      typeChecker.getTypeFromTypeNode(typeNode) as ts.Type
    );
  } else if (ts.isTypeLiteralNode(typeNode)) {
    const properties: { [key: string]: TypeDef } = {};
    typeNode.members.forEach((member) => {
      if (ts.isPropertySignature(member) && ts.isIdentifier(member.name)) {
        const type = member.type
          ? extractType(member.type, typeChecker)
          : "any";
        const memberName = member.name.text;
        const required = !member.questionToken;
        properties[memberName] = { required: required, type: type };
      }
    });
    return properties;
  }
  return "any";
}
