import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { staticMemberName } from '../date-rule-utils';

type MessageIds = 'moduleScope' | 'multipleSites';

function allowedModuleSite(node: TSESTree.CallExpression): boolean {
  const parent = node.parent;
  if (parent.type === 'ExpressionStatement') return parent.expression === node && parent.parent.type === 'Program';
  if (parent.type !== 'VariableDeclarator' || parent.init !== node) return false;
  const declaration = parent.parent;
  if (declaration.type !== 'VariableDeclaration') return false;
  if (declaration.parent.type === 'Program') return true;
  return declaration.parent.type === 'ExportNamedDeclaration' && declaration.parent.parent.type === 'Program';
}

const rule: TSESLint.RuleModule<MessageIds, []> = {
  defaultOptions: [],
  meta: {
    docs: { description: 'Keep @rdlabo/workers-timezone initialization at one clear module-level site.', url: '' },
    messages: {
      moduleScope: '`initializeTimezone()` must be a direct module-level statement or top-level variable initializer, never request- or function-scoped.',
      multipleSites: 'Keep exactly one `initializeTimezone()` site in this module.',
    },
    schema: [],
    type: 'problem',
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const namedImports = new Set<string>();
    const namespaceImports = new Set<string>();
    const allowedCalls: TSESTree.CallExpression[] = [];

    for (const statement of sourceCode.ast.body) {
      if (statement.type !== 'ImportDeclaration' || statement.source.value !== '@rdlabo/workers-timezone') continue;
      for (const specifier of statement.specifiers) {
        if (specifier.type === 'ImportNamespaceSpecifier') namespaceImports.add(specifier.local.name);
        if (
          specifier.type === 'ImportSpecifier' &&
          (specifier.imported.type === 'Identifier' ? specifier.imported.name : specifier.imported.value) === 'initializeTimezone'
        )
          namedImports.add(specifier.local.name);
      }
    }

    function isInitializationCall(node: TSESTree.CallExpression): boolean {
      function resolvesToImport(identifier: TSESTree.Identifier): boolean {
        let scope: TSESLint.Scope.Scope | null = sourceCode.getScope(identifier);
        while (scope) {
          const variable = scope.set.get(identifier.name);
          if (variable) {
            return variable.defs.some((definition) => definition.type === TSESLint.Scope.DefinitionType.ImportBinding);
          }
          scope = scope.upper;
        }
        return false;
      }
      if (node.callee.type === 'Identifier') {
        if (!namedImports.has(node.callee.name)) return false;
        return resolvesToImport(node.callee);
      }
      return (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        namespaceImports.has(node.callee.object.name) &&
        resolvesToImport(node.callee.object) &&
        staticMemberName(node.callee) === 'initializeTimezone'
      );
    }

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (!isInitializationCall(node)) return;
        if (!allowedModuleSite(node)) context.report({ node, messageId: 'moduleScope' });
        else allowedCalls.push(node);
      },
      'Program:exit'() {
        if (allowedCalls.length > 1) {
          for (const node of allowedCalls) context.report({ node, messageId: 'multipleSites' });
        }
      },
    };
  },
};

export = rule;
