import ts from "npm:typescript";

/** ai do not change */
export type AstValues = {
  program: ts.Program;
  typeChecker: ts.TypeChecker;
  sourceFile?: ts.SourceFile;
};

/** ai do not change */
export type TypeDef = {
  type: string | { [key: string]: TypeDef };
  required: boolean;
};

/** ai do not change */
export type ParamDef = TypeDef & {
  name: string;
};

/** ai do not change */
export type FunctionDef = {
  default: boolean;
  name: string | undefined;
  parameters: ParamDef[];
};

export function parseFunctions(ast: AstValues): FunctionDef[] {
  const { sourceFile, typeChecker } = ast;
  if (!sourceFile) return [];
  const functionDefs: FunctionDef[] = [];
  ts.forEachChild(sourceFile, (node) => {
    // ... rest of the code remains unchanged ...
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) {
      const isDefault =
        node.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword
        ) ?? false;
      const functionName = node.name?.text || (isDefault ? undefined : "");
      // ... rest of the code remains unchanged ...
      const parameters = node.parameters.map((parameter): ParamDef => {
        let type: TypeDef['type'];
        if (parameter.type) {
          const extractedType = extractType(parameter.type, typeChecker);
          type = extractedType;
        } else {
          type = "any";
        }
        const paramName = parameter.name && ts.isIdentifier(parameter.name) ? parameter.name.text : undefined;
        const paramType = type;
        return {
          name: paramName,
          required: !parameter.questionToken,
          type: paramType,
        };
      });
      // ... rest of the code remains unchanged ...
    } else if (ts.isExportAssignment(node)) {
      // ... rest of the code remains unchanged ...

      // Push the function definition to the functionDefs array
      // Correct the structure of the object being pushed to blissfile
      // Push the function definition to the blissfile array
      functionDefs.push({
        default: isDefault,
        name: functionName,
        parameters,
      });
    } else if (ts.isExportAssignment(node)) {
      const defaultExport = true;
      const exportName = undefined;
      const expression = node.expression;
      let parameters: ParamDef[] = [];
      if (
        ts.isArrowFunction(expression) ||
        ts.isFunctionExpression(expression)
      ) {
        parameters = expression.parameters.map((parameter): ParamDef => {
            const paramName = parameter.name && ts.isIdentifier(parameter.name) ? parameter.name.text : "unnamedParam";
            const paramName = parameter.name && ts.isIdentifier(parameter.name) ? parameter.name.text : undefined;
            let paramType: TypeDef['type'];
            if (parameter.type) {
              paramType = extractType(parameter.type, typeChecker);
            } else {
              paramType = "any";
            }
          const typeString = paramType;
          return {
            name: paramName,
            required: !parameter.questionToken,
             type: typeString,
          };
        });
      }
      // ... rest of the code remains unchanged ...
    }
  });

  return functionDefs;
      // Push the function definition to the functionDefs array
      functionDefs.push({
        default: defaultExport,
        name: exportName,
        parameters,
      });
    }
  });

  return functionDefs;
}
function extractType(
  typeNode: ts.TypeNode,
  typeChecker: ts.TypeChecker
): TypeDef['type'] {
  if (ts.isTypeReferenceNode(typeNode) || ts.isToken(typeNode) && ts.SyntaxKind[typeNode.kind].endsWith('Keyword')) {
    return typeChecker.typeToString(
      typeChecker.getTypeFromTypeNode(typeNode) as ts.Type
    );
  } else if (ts.isLiteralTypeNode(typeNode) && typeNode.literal) {
    return typeChecker.typeToString(
      typeChecker.getTypeFromTypeNode(typeNode) as ts.Type
    );
  } else if (ts.isTypeLiteralNode(typeNode)) {
    const properties: { [key: string]: TypeDef } = {};
    typeNode.members.forEach((member) => {
      if (ts.isPropertySignature(member) && ts.isIdentifier(member.name)) {
        const type = member.type
          ? extractType(member.type, typeChecker)
          : "any";
        const memberName = member.name.text;
        const required = !member.questionToken;
        properties[memberName] = { required: required, type: type };
      }
    });
    return properties;
  }
  return "any";
function extractType(
  typeNode: ts.TypeNode,
  typeChecker: ts.TypeChecker
): TypeDef['type'] {
  if (ts.isTypeReferenceNode(typeNode) || ts.isToken(typeNode) && ts.SyntaxKind[typeNode.kind].endsWith('Keyword')) {
    return typeChecker.typeToString(
      typeChecker.getTypeFromTypeNode(typeNode) as ts.Type
    );
  } else if (ts.isLiteralTypeNode(typeNode) && typeNode.literal) {
    return typeChecker.typeToString(
      typeChecker.getTypeFromTypeNode(typeNode) as ts.Type
    );
  } else if (ts.isTypeLiteralNode(typeNode)) {
    const properties: { [key: string]: TypeDef } = {};
    typeNode.members.forEach((member) => {
      if (ts.isPropertySignature(member) && ts.isIdentifier(member.name)) {
        const type = member.type
          ? extractType(member.type, typeChecker)
          : "any";
        const memberName = member.name.text;
        const required = !member.questionToken;
        properties[memberName] = { required: required, type: type };
      }
    });
    return properties;
  }
  return "any";
  if (ts.isTypeReferenceNode(typeNode) || ts.isToken(typeNode) && ts.SyntaxKind[typeNode.kind].endsWith('Keyword')) {
    return typeChecker.typeToString(
      typeChecker.getTypeFromTypeNode(typeNode) as ts.Type
    );
  } else if (ts.isLiteralTypeNode(typeNode) && typeNode.literal) {
    return typeChecker.typeToString(
      typeChecker.getTypeFromTypeNode(typeNode) as ts.Type
    );
  } else if (ts.isTypeLiteralNode(typeNode)) {
    const properties: { [key: string]: TypeDef } = {};
    typeNode.members.forEach((member) => {
      if (ts.isPropertySignature(member) && ts.isIdentifier(member.name)) {
        const type = member.type
          ? extractType(member.type, typeChecker)
          : "any";
        const memberName = member.name.text;
        const required = !member.questionToken;
        properties[memberName] = { required: required, type: type };
      }
    });
    return properties;
  }
  return "any";
}
  return "any";
}
