import ts from "npm:typescript";
import { AstValues, FunctionDef } from "./types.ts";

export function parseFunctions(ast: AstValues): FunctionDef[] {
  const { sourceFile } = ast;
  if (!sourceFile) return [];
  const functionDefs: FunctionDef[] = [];
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) {
      const isDefault =
        node.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword
        ) ?? false;
      const name = node.name?.text;
      const parameters = node.parameters.map((parameter) => {
        const typeNode = parameter.type;
        let type;
        if (typeNode) {
          type = getTypeFromTypeNode(typeNode);
        } else {
          type = "any";
        }
        return {
          name: parameter.name.getText(),
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
      let parameters: {
        name: string;
        required: boolean;
        type: string;
      }[] = [];
      if (
        ts.isArrowFunction(expression) ||
        ts.isFunctionExpression(expression)
      ) {
        parameters = expression.parameters.map((parameter) => {
          const typeNode = parameter.type;
          let type: string;
          if (typeNode) {
            type = getTypeFromTypeNode(typeNode);
          } else {
            type = "any";
          }
          return {
            name: parameter.name.getText(),
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
function getTypeFromTypeNode(typeNode: ts.TypeNode): any {
  if (ts.isTypeLiteralNode(typeNode)) {
    const members = typeNode.members.map(member => {
      if (ts.isPropertySignature(member) && member.type) {
        return {
          name: member.name.getText(),
          required: !member.questionToken,
          type: getTypeFromTypeNode(member.type),
        };
      }
    }).filter(Boolean);
    return members;
  } else if (ts.isTypeReferenceNode(typeNode)) {
    return { name: typeNode.typeName.getText() };
  } else {
    return typeNode.getText();
  }
}

