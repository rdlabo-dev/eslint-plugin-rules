import { TSESLint, TSESTree } from '@typescript-eslint/utils';

const rule: TSESLint.RuleModule<'viewModelSubscribe', []> = {
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Keep subscription ownership on the Component instead of a ViewModel class declaration.',
      url: '',
    },
    schema: [],
    messages: {
      viewModelSubscribe: 'ViewModel must expose an Observable; the Component owns and tears down subscriptions.',
    },
  },
  create(context) {
    return {
      // Preserve the existing fleet selector exactly, including descendant calls.
      'ClassDeclaration[id.name="ViewModel"] CallExpression[callee.property.name="subscribe"]'(node: TSESTree.CallExpression) {
        context.report({ node, messageId: 'viewModelSubscribe' });
      },
    };
  },
};

export = rule;
