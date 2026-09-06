import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isGlobalObject, isTypedDateExpression, isUnshadowedGlobal, staticMemberName, typedServices } from '../date-rule-utils';

type MessageIds = 'dateCall' | 'localConstructor' | 'localMethod' | 'missingTimeZone' | 'invalidTimeZone' | 'offsetless';
type Certainty = 'valid' | 'invalid' | 'unknown';

const LOCAL_METHODS = new Set([
  'getFullYear',
  'getYear',
  'getMonth',
  'getDate',
  'getDay',
  'getHours',
  'getMinutes',
  'getSeconds',
  'getTimezoneOffset',
  'setFullYear',
  'setYear',
  'setMonth',
  'setDate',
  'setHours',
  'setMinutes',
  'setSeconds',
  'setMilliseconds',
  'toString',
  'toDateString',
  'toTimeString',
]);
const LOCALE_METHODS = new Set(['toLocaleString', 'toLocaleDateString', 'toLocaleTimeString']);
const OFFSETLESS_ISO_LIKE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/u;

function staticString(node: TSESTree.CallExpressionArgument): string | null {
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) return node.quasis[0]?.value.cooked ?? null;
  return null;
}

function propertyName(node: TSESTree.Property): string | null {
  if (!node.computed && node.key.type === 'Identifier') return node.key.name;
  if (node.key.type === 'Literal' && typeof node.key.value === 'string') return node.key.value;
  if (node.computed && node.key.type === 'TemplateLiteral' && node.key.expressions.length === 0) {
    return node.key.quasis[0]?.value.cooked ?? null;
  }
  return null;
}

function timeZoneValue(value: TSESTree.Node, sourceCode: TSESLint.SourceCode): Certainty {
  if (value.type === 'Literal') return typeof value.value === 'string' && value.value.length > 0 ? 'valid' : 'invalid';
  if (value.type === 'TemplateLiteral' && value.expressions.length === 0) {
    return (value.quasis[0]?.value.cooked?.length ?? 0) > 0 ? 'valid' : 'invalid';
  }
  if (value.type === 'Identifier' && value.name === 'undefined') {
    return isUnshadowedGlobal(sourceCode, value) ? 'invalid' : 'unknown';
  }
  return 'unknown';
}

function explicitTimeZone(options: TSESTree.CallExpressionArgument | undefined, sourceCode: TSESLint.SourceCode): Certainty {
  if (!options) return 'invalid';
  if (options.type === 'Literal' && options.value === null) return 'invalid';
  if (options.type === 'Identifier' && options.name === 'undefined') {
    return isUnshadowedGlobal(sourceCode, options) ? 'invalid' : 'unknown';
  }
  if (options.type !== 'ObjectExpression') return 'unknown';
  let lastSpread = -1;
  options.properties.forEach((property, index) => {
    // An unknown computed key can supply or overwrite timeZone, just like a spread.
    if (property.type === 'SpreadElement' || (property.computed && propertyName(property) === null)) lastSpread = index;
  });
  let result: Certainty | null = null;
  for (let index = lastSpread + 1; index < options.properties.length; index += 1) {
    const property = options.properties[index];
    if (property.type !== 'Property' || propertyName(property) !== 'timeZone') continue;
    result = property.value.type === 'AssignmentPattern' ? 'unknown' : timeZoneValue(property.value, sourceCode);
  }
  if (result) return result;
  return lastSpread >= 0 ? 'unknown' : 'invalid';
}

const rule: TSESLint.RuleModule<MessageIds, []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Prevent implicit host-timezone behavior across Date parsing, construction, access, and Intl formatting.',
      url: '',
    },
    messages: {
      dateCall: '`Date()` returns a string in the host timezone. Create an instant and format it with an explicit timezone.',
      localConstructor: '`new Date(year, month, ...)` uses the host timezone. Use Date.UTC() or a timezone-aware wall-clock conversion.',
      localMethod: '`Date#{{method}}()` uses the host timezone. Use an explicit timezone conversion or a UTC/instant API.',
      missingTimeZone: 'Provide an explicit `timeZone` option instead of using the host timezone.',
      invalidTimeZone: '`timeZone` must be a statically explicit, non-empty string.',
      offsetless: 'This ISO-like date-time has no `Z` or numeric offset. Add an offset or use a timezone-aware wall-clock conversion.',
    },
    schema: [],
    type: 'problem',
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const services = typedServices(context);

    function checkTimeZone(node: TSESTree.CallExpression | TSESTree.NewExpression) {
      // Options are arguments[1]. A SpreadElement in the first two slots makes that
      // position uncertain (e.g. `...['en-US', { timeZone: 'UTC' }]`), so skip.
      // A spread only after a fixed second argument still leaves options analyzable.
      const args = node.arguments;
      if (args.slice(0, 2).some((argument) => argument.type === 'SpreadElement')) return;
      const options = args[1];
      if (explicitTimeZone(options, sourceCode) === 'invalid') {
        context.report({
          node,
          messageId: options?.type === 'ObjectExpression' ? 'invalidTimeZone' : 'missingTimeZone',
        });
      }
    }

    function isIntlDateTimeFormat(callee: TSESTree.Expression): boolean {
      if (callee.type !== 'MemberExpression' || staticMemberName(callee) !== 'DateTimeFormat') return false;
      if (callee.object.type === 'Identifier') {
        return callee.object.name === 'Intl' && isUnshadowedGlobal(sourceCode, callee.object);
      }
      return isGlobalObject(sourceCode, callee.object, 'Intl');
    }

    function checkOffsetless(argument: TSESTree.CallExpressionArgument | undefined) {
      if (!argument || argument.type === 'SpreadElement') return;
      const value = staticString(argument);
      if (value !== null && OFFSETLESS_ISO_LIKE.test(value)) {
        context.report({ node: argument, messageId: 'offsetless' });
      }
    }

    return {
      NewExpression(node: TSESTree.NewExpression) {
        if (isIntlDateTimeFormat(node.callee)) {
          checkTimeZone(node);
          return;
        }
        if (!isGlobalObject(sourceCode, node.callee, 'Date')) return;
        if (node.arguments.some((argument) => argument.type === 'SpreadElement')) return;
        if (node.arguments.length >= 2) context.report({ node, messageId: 'localConstructor' });
        else if (node.arguments.length === 1) checkOffsetless(node.arguments[0]);
      },
      CallExpression(node: TSESTree.CallExpression) {
        if (isGlobalObject(sourceCode, node.callee, 'Date')) {
          context.report({ node, messageId: 'dateCall' });
          return;
        }
        if (isIntlDateTimeFormat(node.callee)) {
          checkTimeZone(node);
          return;
        }
        if (node.callee.type !== 'MemberExpression') return;
        const method = staticMemberName(node.callee);
        if (method === 'parse' && isGlobalObject(sourceCode, node.callee.object, 'Date')) {
          checkOffsetless(node.arguments[0]);
          return;
        }
        if (!method || !isTypedDateExpression(node.callee.object, services)) return;
        if (LOCAL_METHODS.has(method)) {
          context.report({ node: node.callee.property, messageId: 'localMethod', data: { method } });
        } else if (LOCALE_METHODS.has(method)) {
          checkTimeZone(node);
        }
      },
    };
  },
};

export = rule;
