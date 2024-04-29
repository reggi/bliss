import type ts from "npm:typescript";

export type AstValues = {
  program: ts.Program;
  typeChecker: ts.TypeChecker;
  sourceFile?: ts.SourceFile;
};

export type TypeDef = {
  type?: string | { [key: string]: TypeDef };
  required: boolean;
};

export type TagDef =
  | {
      tags: Record<string, string | undefined>;
    }
  | {
      tags?: undefined;
    };

export type ParamDef = TypeDef &
  TagDef & {
    name?: string;
  };

export type FunctionDef = TagDef & {
  isDefault: boolean;
  name?: string;
  parameters: ParamDef[];
};
