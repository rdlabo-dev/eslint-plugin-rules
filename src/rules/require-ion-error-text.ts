import { TSESLint } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { isRenderedElement, type TemplateAstNode, visitTemplateChildren } from './template-ast-utils';

type Options = [{ formFieldProvidesErrorText?: boolean; checkAll?: boolean; ignoreReadonly?: boolean }];
type MessageIds = 'requireIonErrorText';

const SUPPORTED = new Set(['ion-input', 'ion-textarea', 'ion-select', 'ion-checkbox', 'ion-radio-group', 'ion-toggle']);
const READONLY_SUPPORTED = new Set(['ion-input', 'ion-textarea']);

interface Attribute {
  name?: string;
  value?: unknown;
  keySpan?: { toString(): string };
}
type Element = TemplateAstNode & { attributes?: Attribute[]; inputs?: Attribute[] };

const hasInput = (element: Element, name: string) =>
  (element.inputs as Attribute[] | undefined)?.some((input) => input.name === name && input.keySpan?.toString() !== `attr.${name}`) ?? false;
const attribute = (element: Element, name: string) => element.attributes?.find((item) => item.name === name);
const hasExplicitErrorTextSyntax = (element: Element) => hasInput(element, 'errorText') || attribute(element, 'errorText') !== undefined;
const hasErrorText = (element: Element) => {
  const staticError = attribute(element, 'errorText');
  return hasInput(element, 'errorText') || (typeof staticError?.value === 'string' && staticError.value.trim().length > 0);
};

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{ formFieldProvidesErrorText: false, checkAll: false, ignoreReadonly: false }],
  meta: {
    docs: {
      description: 'Require Ionic validation controls to provide an errorText source.',
      url: '',
    },
    messages: {
      requireIonErrorText: 'Provide errorText or [errorText] for this Ionic validation control.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          formFieldProvidesErrorText: { type: 'boolean' },
          checkAll: { type: 'boolean' },
          ignoreReadonly: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem',
  },
  create(context) {
    const [options] = context.options;
    const config = { formFieldProvidesErrorText: false, checkAll: false, ignoreReadonly: false, ...options };

    const visit = (nodes: TemplateAstNode[] | undefined): void => {
      for (const node of nodes ?? []) {
        if (isRenderedElement(node) && SUPPORTED.has(node.name ?? '')) {
          const element = node as Element;
          const hasFormField = hasInput(element, 'formField');
          const ignoredReadonly =
            config.checkAll && config.ignoreReadonly && READONLY_SUPPORTED.has(node.name ?? '') && attribute(element, 'readonly') !== undefined;
          const inScope = !ignoredReadonly && (config.checkAll || hasFormField);
          const providedByAdapter = hasFormField && config.formFieldProvidesErrorText && !hasExplicitErrorTextSyntax(element);
          if (inScope && !providedByAdapter && !hasErrorText(element)) {
            context.report({ node: node as unknown as TSESTree.Node, loc: node.loc, messageId: 'requireIonErrorText' });
          }
        }
        visitTemplateChildren(node, visit);
      }
    };

    return {
      Program(node) {
        if (!context.filename.includes('.html') || context.filename.includes('.spec')) return;
        visit((node as unknown as { templateNodes?: TemplateAstNode[] }).templateNodes);
      },
    };
  },
};

export = rule;
