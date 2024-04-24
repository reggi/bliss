import ts from "npm:typescript";
import { AstValues, FunctionDef } from "./types.ts";

export function parseFunctions(ast: AstValues, push: (comment: string, source: string, expected: any) => void): FunctionDef[] {
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
      const name = node.name?.text || '';
      const parameters = node.parameters.map((parameter) => {
        const type = parameter.type 
          ? extractType(parameter.type, typeChecker)
          : "any";
        return {
          name: ts.isIdentifier(parameter.name)
            ? parameter.name.text : undefined,
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
            throw new Error('Parameter name is not an identifier.');
          }
          return { name: parameter.name.text, required: !parameter.questionToken, type };
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
function extractType(typeNode: ts.TypeNode, typeChecker: ts.TypeChecker): string {
  if (ts.isTypeLiteralNode(typeNode)) {
    const properties = typeNode.members.map((member) => {
      if (ts.isPropertySignature(member) && ts.isIdentifier(member.name)) {
        const type = member.type ? typeChecker.getTypeFromTypeNode(member.type) : "any";
        if (!ts.isIdentifier(member.name)) {
          throw new Error('Member name is not an identifier.');
        }
        const typeName = typeChecker.typeToString(type as ts.Type);
        return { name: member.name.text, required: !member.questionToken, type: typeName };
        return { name: member.name.text, required: !member.questionToken, type };
      }
    });
    const typeObject: Record<string, { required: boolean; type: any }> = {};
    properties.forEach((prop) => {
      if (prop) typeObject[prop.name] = { required: prop.required, type: prop.type };
    });
    return { name: typeObject, required: true };
  } else if (ts.isTypeReferenceNode(typeNode)) {
    return typeChecker.typeToString(typeChecker.getTypeFromTypeNode(typeNode) as ts.Type);
  }
  return 'any';
}
