import ts from "npm:typescript";
import { AstValues, Blissfile } from "./types.ts";
import { createAstFromSource } from "./test_source.ts";

export function parseFunctions(ast: AstValues): Blissfile[] {
  const { sourceFile } = ast;
  if (!sourceFile) return [];

  const blissfile: Blissfile[] = [];
  const blissfile: Blissfile[] = [];
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
          if (ts.isTypeReferenceNode(typeNode)) {
            type = typeNode.typeName.getText()
            // Assuming the intent was to process members of a type literal or interface
            // This part of the code needs to be revised to correctly handle type nodes
            // For now, removing the incorrect map and reduce calls
            // .map((member) => {
                const memberName = member.name?.getText();
                const memberType = ts.isPropertySignature(member) && member.type ? member.type.getText() : "any";
                const memberRequired = !member.questionToken;
                if (typeof memberName === 'string') {
                  return {
                    [memberName]: { required: memberRequired, type: { type: memberType, required: memberRequired } },
                  };
                } else {
                  return {};
                }
              })
            // .reduce((acc, curr) => ({ ...acc, ...curr }), {});
          } else {
            type = typeNode.getText();
          }
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
      // Correct the structure of the object being pushed to blissfile
      blissfile.push({
        isDefault,
        name,
        parameters,
      });
    } else if (ts.isExportAssignment(node)) {
      // Handle default export of an arrow function
      const defaultExport = true;
      const name = undefined;
      const expression = node.expression;
      let parameters: { name: string; required: boolean; type: string | object; }[] = [];
      if (
        ts.isArrowFunction(expression) ||
        ts.isFunctionExpression(expression)
      ) {
        parameters = expression.parameters.map((parameter) => {
          const typeNode = parameter.type;
          let type;
          if (typeNode) {
            if (ts.isTypeReferenceNode(typeNode)) {
              type = typeNode.typeName.getText()
              // Assuming the intent was to process members of a type literal or interface
            // This part of the code needs to be revised to correctly handle type nodes
            // For now, removing the incorrect map and reduce calls
            // .map((member) => {
                  const memberName = member.name?.getText();
                  const memberType = member.type?.getText() || "any";
                  const memberRequired = !member.questionToken;
                  return {
                    [memberName]: {
                      required: memberRequired,
                      type: memberType,
                    },
                  };
                })
              // .reduce((acc, curr) => ({ ...acc, ...curr }), {});
            } else {
              type = typeNode.getText();
            }
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
      // Correct the structure of the object being pushed to blissfile
      blissfile.push({
        isDefault: defaultExport,
        name,
        parameters,
      });
    }
  });

  return blissfile;
}
