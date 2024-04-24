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
      const parameters = node.parameters.map((parameter) => {
        let type: string | { [key: string]: TypeDef } = "any";
        if (parameter.type) {
          const extractedType = extractType(parameter.type, typeChecker);
          type = extractedType;
        }
        const paramName =
          parameter.name && ts.isIdentifier(parameter.name)
            ? parameter.name.text
            : "";
        if (!ts.isIdentifier(parameter.name)) {
          throw new Error(
            "Parameter name is not an identifier: " +
              ts.SyntaxKind[parameter.name.kind]
          );
        }
        const paramType = type;
        return {
          name: paramName,
          required: !parameter.questionToken,
          type: paramType,
        };
      });

      // Push the function definition to the functionDefs array
      // Correct the structure of the object being pushed to blissfile
      // Push the function definition to the blissfile array
      functionDefs.push({
        default: isDefault,
        name: functionName,
        parameters,
      });
    } else if (ts.isExportAssignment(node)) {
      // Handle default export of an arrow function
      const defaultExport = true;
      const exportName = undefined;
      const expression = node.expression;
      let parameters: { name: string; required: boolean; type: string }[] = [];
      if (
        ts.isArrowFunction(expression) ||
        ts.isFunctionExpression(expression)
      ) {
        parameters = expression.parameters.map((parameter): { name: string; required: boolean; type: string } => {
          const type = parameter.type
            ? extractType(parameter.type, typeChecker) as string
            : "any";
          if (!ts.isIdentifier(parameter.name)) {
            throw new Error("Parameter name is not an identifier.");
          }
          return {
            name: parameter.name.text,
            required: !parameter.questionToken,
            type,
          };
        });
      }
      // Push the function definition to the blissfile array
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
function extractType(
  typeNode: ts.TypeNode,
  typeChecker: ts.TypeChecker
): string | { [key: string]: TypeDef } {
  if (ts.isTypeReferenceNode(typeNode) || ts.isKeywordTypeNode(typeNode) && typeNode.kind === ts.SyntaxKind.StringKeyword) {
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
        const optional = member.questionToken ? false : true;
        properties[memberName] = { required: optional, type: type };
      }
    });
    return properties;
  }
  return "any";
}
