import ts from "npm:typescript";
import { AstValues, Blissfile } from "./types.ts";
import { createAstFromSource } from "./test_source.ts";

interface ExportedFunctions {
  [functionName: string]: ts.FunctionDeclaration | ts.ArrowFunction;
}

export function parseFunctions(ast: AstValues): Blissfile {
  const { sourceFile, typeChecker } = ast;
  if (!sourceFile) return [];

  const exportedFunctions: ExportedFunctions = {};
  ts.forEachChild(sourceFile, node => {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const { name } = node.name;
      exportedFunctions[name.text] = node;
    } else if (ts.isVariableStatement(node)) {
      const [declaration] = node.declarationList.declarations;
      if (ts.isIdentifier(declaration.name)) {
        const { name } = declaration.name;
        const initializer = declaration.initializer;
        if (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) {
          exportedFunctions[name.text] = initializer;
        }
      }
    }
  });

  const blissfile: Blissfile = Object.keys(exportedFunctions).map(functionName => {
    const func = exportedFunctions[functionName];
    const isDefault = functionName === "default";
    const name = isDefault ? undefined : functionName;
    const parameters = func.parameters.map(param => {
      const paramName = param.name.getText(sourceFile);
      const type = typeChecker.getTypeAtLocation(param);
      const typeString = typeChecker.typeToString(type);
      return {
        name: paramName,
        required: !param.questionToken,
        type: typeString,
      };
    });
    return {
      isDefault,
      name,
      parameters,
    };
  });

  return blissfile;

  return exportedFunctions;
}

const source = `export default (name: string) => name;`;
const ast = createAstFromSource(source);
const blissfile = parseFunctions(ast);
console.log(blissfile);
