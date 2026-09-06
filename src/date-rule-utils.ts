import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { ParserServicesWithTypeInformation } from '@typescript-eslint/utils';
import type { Type } from 'typescript';

export function typedServices(context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>): ParserServicesWithTypeInformation {
  return ESLintUtils.getParserServices(context);
}

export function staticMemberName(node: TSESTree.MemberExpression): string | null {
  if (!node.computed && node.property.type === 'Identifier') return node.property.name;
  if (node.computed && node.property.type === 'Literal' && typeof node.property.value === 'string') {
    return node.property.value;
  }
  if (node.computed && node.property.type === 'TemplateLiteral' && node.property.expressions.length === 0) {
    return node.property.quasis[0]?.value.cooked ?? null;
  }
  return null;
}

function isTypeOnlyDefinition(definition: TSESLint.Scope.Definition): boolean {
  if (definition.type === TSESLint.Scope.DefinitionType.Type) return true;
  return (
    definition.type === TSESLint.Scope.DefinitionType.ImportBinding &&
    ((definition.node.type === 'ImportSpecifier' && definition.node.importKind === 'type') ||
      (definition.parent.type === 'ImportDeclaration' && definition.parent.importKind === 'type'))
  );
}

export function isUnshadowedGlobal(sourceCode: TSESLint.SourceCode, node: TSESTree.Identifier): boolean {
  let scope: TSESLint.Scope.Scope | null = sourceCode.getScope(node);
  while (scope) {
    const variable = scope.set.get(node.name);
    if (variable?.defs.some((definition) => !isTypeOnlyDefinition(definition))) return false;
    scope = scope.upper;
  }
  return true;
}

export function isGlobalObject(sourceCode: TSESLint.SourceCode, node: TSESTree.Expression, name: string): boolean {
  if (node.type === 'Identifier') return node.name === name && isUnshadowedGlobal(sourceCode, node);
  return (
    node.type === 'MemberExpression' &&
    staticMemberName(node) === name &&
    node.object.type === 'Identifier' &&
    node.object.name === 'globalThis' &&
    isUnshadowedGlobal(sourceCode, node.object)
  );
}

function isLibDateType(type: Type): boolean {
  // Prefer the resolved symbol so aliases such as `type Instant = Date` still match lib Date.
  // Custom `Date` classes keep a non-lib declaration and remain excluded.
  const symbol = type.getSymbol();
  if (symbol?.getName() !== 'Date') return false;
  return Boolean(symbol.declarations?.some((declaration) => /[/\\]lib(?:\.[^/\\]+)?\.d\.ts$/u.test(declaration.getSourceFile().fileName)));
}

export function isGlobalDateType(
  type: Type,
  checker: ParserServicesWithTypeInformation['program']['getTypeChecker'] extends () => infer T ? T : never,
): boolean {
  const parts = type.isUnionOrIntersection() ? type.types : [type];
  const meaningful = parts.filter((part) => {
    const rendered = checker.typeToString(part);
    return rendered !== 'null' && rendered !== 'undefined';
  });
  return meaningful.length > 0 && meaningful.every(isLibDateType);
}

export function isTypedDateExpression(node: TSESTree.Expression, services: ParserServicesWithTypeInformation): boolean {
  return isGlobalDateType(services.getTypeAtLocation(node), services.program.getTypeChecker());
}
