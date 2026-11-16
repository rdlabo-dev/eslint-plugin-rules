import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/ionic-list-structure';

const ruleTester = new RuleTester({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  languageOptions: { parser: require('@angular-eslint/template-parser') },
});

ruleTester.run('ionic-list-structure', rule, {
  valid: [
    '<ion-list><ion-list-header>Title</ion-list-header><ion-item-group><ion-item>Row</ion-item></ion-item-group><ion-note>Help</ion-note></ion-list>',
    '<ion-item><ion-label>Label</ion-label><ion-note slot="end">Value</ion-note></ion-item>',
    '<ion-item><ion-note>Help</ion-note><ion-button>Action</ion-button></ion-item>',
    '<ion-item>Text<ion-note>Help</ion-note></ion-item>',
    '<ion-item>{{ value }}<ion-note>Help</ion-note></ion-item>',
    '<ion-item><ng-container><ion-note>Help</ion-note></ng-container></ion-item>',
    '<ion-item><ion-note>First</ion-note><ion-note>Second</ion-note></ion-item>',
    '<ion-list><ion-note>Help</ion-note><ion-list-header>Title</ion-list-header><ion-item-group /></ion-list>',
    '<ion-list><ion-item-group /></ion-list><ion-list><ion-list-header>Next</ion-list-header><ion-item-group /></ion-list>',
    '@for (section of sections; track section.id) { <ion-list><ion-list-header>{{ section.title }}</ion-list-header><ion-item-group /></ion-list> }',
    '<ion-list><ion-item-group><ion-item><ion-list><ion-list-header>Nested</ion-list-header><ion-item-group /></ion-list></ion-item></ion-item-group></ion-list>',
    '<ion-list-header>Outside a list</ion-list-header>',
  ].map((code) => ({ code, filename: 'template.html' })),
  invalid: [
    ...[
      '<ion-item><ion-note>Help</ion-note></ion-item>',
      '<ion-item>\n  <ion-note>Help</ion-note>\n</ion-item>',
      '<ion-item><!-- explanation --><ion-note>Help</ion-note></ion-item>',
      '@if (visible) { <ion-item><ion-note>Help</ion-note></ion-item> }',
    ].map((code) => ({ code, filename: 'template.html', errors: [{ messageId: 'standaloneNote' as const }] })),
    ...[
      '<ion-list><ion-item /><ion-list-header>Late</ion-list-header></ion-list>',
      '<ion-list><ion-item-group /><ion-list-header>Late</ion-list-header></ion-list>',
      '<ion-list><ion-reorder-group><ion-item /></ion-reorder-group><ion-list-header>Late</ion-list-header></ion-list>',
      '<ion-list><ng-container><ion-item-group /></ng-container><ion-list-header>Late</ion-list-header></ion-list>',
      '<ion-list>@if (visible) { <ion-item-group /> }<ion-list-header>Late</ion-list-header></ion-list>',
      '<ion-list>@for (item of items; track item) { <ion-item /> }<ion-list-header>Late</ion-list-header></ion-list>',
      '<ion-list>@defer { <ion-item-group /> }<ion-list-header>Late</ion-list-header></ion-list>',
    ].map((code) => ({ code, filename: 'template.html', errors: [{ messageId: 'listHeaderAfterItems' as const }] })),
  ],
});
