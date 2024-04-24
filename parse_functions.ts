import ts from "npm:typescript";
import { AstValues, FunctionDef } from "./types.ts";

export function parseFunctions(ast: AstValues): FunctionDef[] {
  const { sourceFile, typeChecker } = ast;
  if (!sourceFile) return [];
  const functionDefs: FunctionDef[] = [];
  ts.forEachChild(sourceFile, (node) => {
    // ... rest of the code remains unchanged ...
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) {
      const isDefault = node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword) ?? false;
      const functionName = node.name?.text || (isDefault ? undefined : "");
      const parameters = node.parameters.map((parameter) => {
        const type = parameter.type
          ? extractType(parameter.type, typeChecker)
          : "any";
        const paramName = ts.isIdentifier(parameter.name)
          ? parameter.name.text
          : "";
        if (!paramName) {
          throw new Error("Parameter name is not an identifier.");
        }
        const paramType = typeof type === 'string' ? type : type.map(t => ({ name: t.name, required: t.required, type: t.type }));
        return { name: paramName, required: !parameter.questionToken, type: paramType };
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
        parameters = expression.parameters.map((parameter) => {
          const type = parameter.type
            ? extractType(parameter.type, typeChecker)
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
): string {
  if (ts.isTypeReferenceNode(typeNode)) {
    return typeChecker.typeToString(
      typeChecker.getTypeFromTypeNode(typeNode) as ts.Type
    );
  } else if (ts.isLiteralTypeNode(typeNode) && typeNode.literal) {
    return typeChecker.typeToString(
      typeChecker.getTypeFromTypeNode(typeNode) as ts.Type
    );
  }
  else if (ts.isTypeLiteralNode(typeNode)) {
    const properties = typeNode.members.map((member) => {
      if (ts.isPropertySignature(member) && ts.isIdentifier(member.name)) {
        const type = member.type
          ? typeChecker.getTypeFromTypeNode(member.type)
          : "any";
        const typeName = typeChecker.typeToString(type as ts.Type);
        const memberName =
          member.name && ts.isIdentifier(member.name) ? member.name.text : "";
        if (!memberName) {
          throw new Error("Member name is not an identifier.");
        }
        return { name: memberName, required: !member.questionToken, type: typeName };
      }
      return null;
    }).filter(Boolean);
    return properties.length > 0 ? `{ ${properties.map(p => `${p.name}: ${p.type}`).join(", ")} }` : "any";
  }
  return "any";
}
