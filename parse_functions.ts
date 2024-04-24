import ts from "npm:typescript";
import { AstValues, Blissfile } from "./types.ts";
import { createAstFromSource } from "./test_source.ts";

interface ExportedFunctions {
  [functionName: string]: ts.FunctionDeclaration | ts.ArrowFunction;
}

export function parseFunctions(ast: AstValues): Blissfile {
  const { sourceFile, typeChecker } = ast;
  if (!sourceFile) return [];

  const exportedFunctions: Blissfile = [];

  return exportedFunctions;
}

const source = `export default (name: string) => name;`;
const ast = createAstFromSource(source);
const functions = parseFunctions(ast);
console.log(functions);
