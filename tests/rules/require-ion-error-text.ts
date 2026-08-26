import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/require-ion-error-text';

const tester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    parser: require('@angular-eslint/template-parser'),
  },
});

const html = (code: string, options?: [{ formFieldProvidesErrorText?: boolean; checkAll?: boolean; ignoreReadonly?: boolean }]) =>
  options ? { code, filename: 'template.html', options } : { code, filename: 'template.html' };

tester.run('require-ion-error-text', rule, {
  valid: [
    html('<ion-select></ion-select>'),
    html('<ion-input [formField]="field" errorText="Required"></ion-input>'),
    html('<ion-input [formField]="field" [errorText]="message"></ion-input>'),
    html('<ion-input [formField]="field"></ion-input>', [{ formFieldProvidesErrorText: true }]),
    html('<ion-toggle errorText="Required"></ion-toggle>', [{ checkAll: true }]),
    html('<ion-input readonly></ion-input>', [{ checkAll: true, ignoreReadonly: true }]),
    html('<ion-searchbar [formField]="field"></ion-searchbar>', [{ checkAll: true }]),
  ],
  invalid: [
    { ...html('<ion-input [formField]="field"></ion-input>'), errors: [{ messageId: 'requireIonErrorText' as const }] },
    { ...html('<ion-textarea [formField]="field" errorText="   "></ion-textarea>'), errors: [{ messageId: 'requireIonErrorText' as const }] },
    { ...html('<ion-select [formField]="field" [attr.errorText]="message"></ion-select>'), errors: [{ messageId: 'requireIonErrorText' as const }] },
    {
      ...html('<ion-input [readonly]="locked"></ion-input>', [{ checkAll: true, ignoreReadonly: true }]),
      errors: [{ messageId: 'requireIonErrorText' as const }],
    },
    {
      ...html('<ion-input [formField]="field"></ion-input>', [{ formFieldProvidesErrorText: false }]),
      errors: [{ messageId: 'requireIonErrorText' as const }],
    },
    {
      ...html('<ion-input [formField]="field" errorText="   "></ion-input>', [{ formFieldProvidesErrorText: true }]),
      errors: [{ messageId: 'requireIonErrorText' as const }],
    },
    ...['ion-input', 'ion-textarea', 'ion-select', 'ion-checkbox', 'ion-radio-group', 'ion-toggle'].map((tag) => ({
      ...html(`<${tag}></${tag}>`, [{ checkAll: true }]),
      errors: [{ messageId: 'requireIonErrorText' as const }],
    })),
  ],
});
