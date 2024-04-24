import ts from "npm:typescript";
import { AstValues, Blissfile } from "./types.ts";
import { createAstFromSource } from "./test_source.ts";

export function parseFunctions(ast: AstValues): Blissfile {
  const { sourceFile, typeChecker } = ast;
  if (!sourceFile) return [];
  return [];
}

const source = `export default (name: string) => name;`;
const ast = createAstFromSource(source);
const blissfile = parseFunctions(ast);
console.log(blissfile);
