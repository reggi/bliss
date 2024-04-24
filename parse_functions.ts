import ts from "npm:typescript";
import { AstValues, Blissfile } from "./types.ts";
import { createAstFromSource } from "./test_source.ts";

export function parseFunctions(ast: AstValues): Blissfile {
  const { sourceFile } = ast;
  if (!sourceFile) return [];

  const blissfile: Blissfile = [];
  ts.forEachChild(sourceFile, node => {
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) {
      const isDefault = node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword) ?? false;
      const name = node.name?.text;
      const parameters = node.parameters.map(parameter => ({
        name: parameter.name.getText(),
        required: !parameter.questionToken,
        type: parameter.type ? parameter.type.getText() : 'any'
      }));

      blissfile.push({
        default: isDefault,
        name,
        parameters
      });
    } else if (ts.isExportAssignment(node)) {
      // Handle default export of an arrow function
      const defaultExport = true;
      const name = undefined;
      const expression = node.expression;
      let parameters = [];
      if (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression)) {
        parameters = expression.parameters.map(parameter => ({
          name: parameter.name.getText(),
          required: !parameter.questionToken,
          type: parameter.type ? parameter.type.getText() : 'any'
        }));
      }
      blissfile.push({
        default: defaultExport,
        name,
        parameters
      });
    }
  });

  return blissfile;
}

const source = `export default (name: string) => name;`;
const ast = createAstFromSource(source);
const blissfile = parseFunctions(ast);
console.log(blissfile);
