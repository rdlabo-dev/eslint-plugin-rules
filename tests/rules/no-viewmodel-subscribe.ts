import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/no-viewmodel-subscribe';
import plugin from '../../src';

const ruleTester = new RuleTester();

ruleTester.run('no-viewmodel-subscribe', rule, {
  valid: [
    'class ViewModel { readonly value$ = source.pipe(map(transform)); }',
    'class Page { start() { source.subscribe(); } }',
    'class OtherViewModel { start() { source.subscribe(); } }',
    'const ViewModel = class { start() { source.subscribe(); } };',
    'const Model = class ViewModel { start() { source.subscribe(); } };',
    'class ViewModel { start() { subscribe(); } }',
    'class ViewModel { start() { source["subscribe"](); } }',
  ],
  invalid: [
    {
      code: 'class ViewModel { start() { source.subscribe(); } }',
      errors: [{ messageId: 'viewModelSubscribe' }],
    },
    {
      code: 'export class ViewModel { readonly subscription = source.subscribe(); }',
      errors: [{ messageId: 'viewModelSubscribe' }],
    },
    {
      code: 'class ViewModel { start() { source?.subscribe?.(); } }',
      errors: [{ messageId: 'viewModelSubscribe' }],
    },
    {
      code: 'class ViewModel { start() { source[subscribe](); } }',
      errors: [{ messageId: 'viewModelSubscribe' }],
    },
    {
      code: 'class ViewModel { start() { return () => source.subscribe(); } }',
      errors: [{ messageId: 'viewModelSubscribe' }],
    },
    {
      code: 'class ViewModel { start() { class Nested { start() { source.subscribe(); } } } }',
      errors: [{ messageId: 'viewModelSubscribe' }],
    },
  ],
});

it('exports the rule without changing the recommended preset', () => {
  expect(plugin.rules['no-viewmodel-subscribe']).toBe(rule);
  for (const config of plugin.configs.recommended) {
    expect(config.rules).not.toHaveProperty('@rdlabo/rules/no-viewmodel-subscribe');
  }
});
