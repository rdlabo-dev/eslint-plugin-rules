import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isRenderedText, type TemplateAstNode, visitTemplateChildren } from './template-ast-utils';

type MessageIds = 'standaloneNote' | 'listHeaderAfterItems';

const rule: TSESLint.RuleModule<MessageIds, []> = {
  defaultOptions: [],
  meta: {
    type: 'problem',
    docs: { description: 'Prevent note-only Ionic rows and list headers placed after list items.', url: '' },
    schema: [],
    messages: {
      standaloneNote:
        'ion-item contains only ion-note, creating an unnecessary row background and spacing for explanatory text. Move ion-note outside ion-item and its item group.',
      listHeaderAfterItems:
        'ion-list-header follows ion-item or ion-item-group in the same ion-list, so separate sections share one list container. Close the previous ion-list and start a new ion-list for this header.',
    },
  },
  create(context) {
    function visit(nodes: TemplateAstNode[] | undefined, list?: { hasItems: boolean }): void {
      for (const node of nodes ?? []) {
        const currentList = node.type === 'Element' && node.name === 'ion-list' ? { hasItems: false } : list;
        if (node.type === 'Element' && node.name === 'ion-item') {
          const content = (node.children ?? []).filter((child) => child.type !== 'Text' || isRenderedText(child));
          if (content.length === 1 && content[0].type === 'Element' && content[0].name === 'ion-note') {
            context.report({ node: node as unknown as TSESTree.Node, loc: node.loc, messageId: 'standaloneNote' });
          }
        }
        if (node.type === 'Element' && node.name === 'ion-list-header' && currentList?.hasItems) {
          context.report({ node: node as unknown as TSESTree.Node, loc: node.loc, messageId: 'listHeaderAfterItems' });
        }
        if (node.type === 'Element' && (node.name === 'ion-item' || node.name === 'ion-item-group') && currentList) {
          currentList.hasItems = true;
        }
        visitTemplateChildren(node, (children) => visit(children, currentList));
      }
    }
    return {
      Program(node) {
        visit((node as unknown as { templateNodes?: TemplateAstNode[] }).templateNodes);
      },
    };
  },
};

export = rule;
