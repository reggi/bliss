import ts from "npm:typescript";
import { AstValues, Blissfile } from "./types.ts";
import { createAstFromSource } from "./test_source.ts";

export function parseFunctions(ast: AstValues): Blissfile {
  const { sourceFile } = ast;
  if (!sourceFile) return [];

  const blissfile: Blissfile = [];
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
          if (ts.isTypeLiteralNode(typeNode)) {
            type = typeNode.members
              .map((member) => {
                const memberName = member.name?.getText();
                const memberType = member.type?.getText() || "any";
                const memberRequired = !member.questionToken;
                return {
                  [memberName]: { required: memberRequired, type: memberType },
                };
              })
              .reduce((acc, curr) => ({ ...acc, ...curr }), {});
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

      blissfile.push({
        default: isDefault,
        name,
        parameters,
      });
    } else if (ts.isExportAssignment(node)) {
      // Handle default export of an arrow function
      const defaultExport = true;
      const name = undefined;
      const expression = node.expression;
      let parameters = [];
      if (
        ts.isArrowFunction(expression) ||
        ts.isFunctionExpression(expression)
      ) {
        parameters = expression.parameters.map((parameter) => {
          const typeNode = parameter.type;
          let type;
          if (typeNode) {
            if (ts.isTypeLiteralNode(typeNode)) {
              type = typeNode.members
                .map((member) => {
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
                .reduce((acc, curr) => ({ ...acc, ...curr }), {});
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
      blissfile.push({
        default: defaultExport,
        name,
        parameters,
      });
    }
  });

  return blissfile;
}
