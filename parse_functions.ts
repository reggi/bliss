import ts from "npm:typescript";
import { AstValues, FunctionDef } from "./types.ts";

export function parseFunctions(ast: AstValues): FunctionDef[] {
  const { sourceFile, typeChecker } = ast;
  if (!sourceFile) return [];
  const functionDefs: FunctionDef[] = [];
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) {
      const isDefault =
        node.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword
        ) ?? false;
      const name =
        node.name && ts.isIdentifier(node.name) ? node.name.text : undefined;
      const parameters = node.parameters.map((parameter) => {
        const typeNode = parameter.type;
        const type = typeNode
          ? typeChecker.typeToString(typeChecker.getTypeFromTypeNode(typeNode))
          : "any";
        return {
          name: ts.isIdentifier(parameter.name)
            ? parameter.name.text
            : undefined,
          required: !parameter.questionToken,
          type,
        };
      });

      // Correct the structure of the object being pushed to blissfile
      // Push the function definition to the blissfile array
      functionDefs.push({
        default: isDefault,
        name: name,
        parameters,
      });
    } else if (ts.isExportAssignment(node)) {
      // Handle default export of an arrow function
      const defaultExport = true;
      const name = undefined;
      const expression = node.expression;
      let parameters: FunctionDef["parameters"] = [];
      if (
        ts.isArrowFunction(expression) ||
        ts.isFunctionExpression(expression)
      ) {
        parameters = expression.parameters.map((parameter) => {
          const type = parameter.type
            ? typeChecker.typeToString(
                typeChecker.getTypeFromTypeNode(parameter.type)
              )
            : "any";
          return {
            name: ts.isIdentifier(parameter.name)
              ? parameter.name.text
              : undefined,
            required: !parameter.questionToken,
            type,
          };
        });
      }
      // Push the function definition to the blissfile array
      functionDefs.push({
        default: defaultExport,
        name: name,
        parameters,
      });
    }
  });

  return functionDefs;
}
