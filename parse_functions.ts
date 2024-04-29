import ts from "npm:typescript";
import { AstValues, FunctionDef, TypeDef } from "./types.ts";
import { ParamDef } from "./types.ts";

const getJSDocTags = (
  parameter:
    | ts.ParameterDeclaration
    | ts.FunctionDeclaration
    | ts.ExportAssignment
    | ts.VariableStatement
    | ts.FunctionExpression
): Record<string, string | undefined> => {
  const tags = ts.getAllJSDocTags(
    parameter,
    (_tag): _tag is ts.JSDocTag => true
  );
  const tagValues: Record<string, string | undefined> = {};
  tags.forEach((tag) => {
    const key = tag.tagName.text;
    const value = tag.comment ? tag.comment : undefined;
    if (typeof value === "string") {
      tagValues[key] = value;
    }
  });
  return tagValues;
};

const getTypeFromNode = (node?: ts.TypeNode): TypeDef["type"] => {
  if (node && ts.isTypeLiteralNode(node)) {
    const properties: { [key: string]: TypeDef } = {};
    node.members.forEach((member) => {
      if (ts.isPropertySignature(member) && ts.isIdentifier(member.name)) {
        const propertyName = member.name.text;
        const propertyType = member.type
          ? getTypeFromNode(member.type)
          : undefined;
        const required = !member.questionToken?.getText();
        properties[propertyName] = { type: propertyType, required };
      }
    });
    return properties;
  }
  return node?.getText() || undefined;
};

const handleParameter = (parameter: ts.ParameterDeclaration): ParamDef => {
  const tags = getJSDocTags(parameter);
  const ignoreName = ts.isObjectBindingPattern(parameter.name);
  const type = getTypeFromNode(parameter.type);
  const name = ignoreName ? undefined : parameter.name?.getText() || undefined;
  const hasDefault = !!parameter.initializer;
  const required = hasDefault ? false : !parameter.questionToken?.getText();
  const maybeTags = Object.keys(tags).length ? { tags } : {};
  return {
    ...(name ? { name } : {}),
    type,
    required,
    ...maybeTags,
  };
};

export function parseFunctions(ast: AstValues) {
  const { sourceFile } = ast;
  if (!sourceFile) return [];

  const results: FunctionDef[] = [];

  function visit(node: ts.Node) {
    const jsDocs = ts.getJSDocTags(node);
    const isPrivate = jsDocs.some((doc) => doc.tagName.text === "private");

    if (isPrivate) {
      return;
    }

    if (ts.isExportAssignment(node) && ts.isArrowFunction(node.expression)) {
      const tags = getJSDocTags(node);
      const isDefault = true;
      const name = undefined;
      const parameters = node.expression.parameters.map(handleParameter);
      results.push({
        ...(Object.keys(tags).length ? { tags } : {}),
        ...(name ? { name } : {}),
        isDefault,
        parameters,
      });
    }

    if (
      ts.isVariableStatement(node) &&
      node.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      )
    ) {
      node.declarationList.declarations.forEach((declaration) => {
        if (
          ts.isVariableDeclaration(declaration) &&
          declaration.initializer &&
          ts.isArrowFunction(declaration.initializer)
        ) {
          const name = declaration.name.getText();
          const tags = getJSDocTags(node);
          results.push({
            ...(Object.keys(tags).length ? { tags } : {}),
            ...(name ? { name } : {}),
            isDefault: false,
            parameters: declaration.initializer.parameters.map(handleParameter),
          });
        }
      });
    }

    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) {
      const isExported = node.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      );

      if (!isExported) return;

      const isDefault = node.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword
      );
      const parameters = node.parameters.map(handleParameter);
      const name = node.name?.getText() || undefined;
      const tags = getJSDocTags(node);

      results.push({
        ...(Object.keys(tags).length ? { tags } : {}),
        ...(name ? { name } : {}),
        isDefault: !!isDefault,
        parameters,
      });
    }

    ts.forEachChild(node, visit);
  }

  ts.forEachChild(sourceFile, visit);
  return results;
}
