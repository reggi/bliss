import ts from "npm:typescript";
import { AstValues } from "./types.ts";

/** creates ast objects from source code for testing */
export function astSource(sourceCode: string): AstValues {
  const sourceFileName = "file.ts";
  const compilerHost = ts.createCompilerHost({});

  compilerHost.getSourceFile = (fileName) => {
    if (fileName === sourceFileName) {
      return ts.createSourceFile(
        fileName,
        sourceCode,
        ts.ScriptTarget.Latest,
        true
      );
    }
    return undefined;
  };

  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    strict: true,
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ESNext,
  };

  const program = ts.createProgram([sourceFileName], options, compilerHost);
  const sourceFile = program.getSourceFile(sourceFileName);
  const typeChecker = program.getTypeChecker();

  return { program, sourceFile, typeChecker };
}
