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
      const name = node.name && ts.isIdentifier(node.name) ? node.name.text : undefined;
      const parameters = node.parameters.map((parameter) => {
        const typeNode = parameter.type;
        let type;
        if (typeNode) {
          type = getTypeFromTypeNode(typeNode);
        } else {
          type = "any";
        }
        if (ts.isObjectBindingPattern(parameter.name) || ts.isArrayBindingPattern(parameter.name)) {
          return {
            name: 'pattern', // Use 'pattern' as a placeholder name for binding patterns
            required: !parameter.questionToken,
            type: type === "any" ? "object" : type, // If type is any, it's likely an object pattern
          };
        } else {
          return {
            name: parameter.name.getText(),
            required: !parameter.questionToken,
            type,
          };
        }
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
      let parameters: FunctionDef['parameters'] = [];
      if (
        ts.isArrowFunction(expression) ||
        ts.isFunctionExpression(expression)
      ) {
        parameters = expression.parameters.map((parameter) =>
          ts.isObjectBindingPattern(parameter.name) || ts.isArrayBindingPattern(parameter.name)
            ? {
                name: 'pattern', // Use 'pattern' as a placeholder name for binding patterns
                required: !parameter.questionToken,
                type: "object", // Assume object type for binding patterns
              }
            : {
                name: parameter.name.getText(),
                required: !parameter.questionToken,
                type: getTypeFromTypeNode(parameter.type || ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)),
              }
        );
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
  interface MemberShape {
    [key: string]: {
      required: boolean;
      type: any;
    };
  }

  if (ts.isTypeLiteralNode(typeNode)) {
    const members: MemberShape = {};
    typeNode.members.forEach(member => {
      if (ts.isPropertySignature(member) && member.type) {
        const memberName = member.name.getText();
        members[memberName] = {
          required: !member.questionToken,
          type: getTypeFromTypeNode(member.type),
        };
      }
    });
    return members;
  } else if (ts.isTypeReferenceNode(typeNode)) {
    return { name: typeNode.typeName.getText() };
function getTypeFromTypeNode(typeNode: ts.TypeNode): any {
  // ... existing code ...
  } else if (ts.isKeywordTypeNode(typeNode) && typeNode.kind === ts.SyntaxKind.AnyKeyword) {
    return 'any';
  } else {
    return typeNode.getText();
  }
}

