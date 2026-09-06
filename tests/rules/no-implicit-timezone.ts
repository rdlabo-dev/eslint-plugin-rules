import { RuleTester } from '@angular-eslint/test-utils';
import { resolve } from 'path';
import rule from '../../src/rules/no-implicit-timezone';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: { allowDefaultProject: ['file.ts'] },
      tsconfigRootDir: resolve(__dirname, '../..'),
    },
  },
});

ruleTester.run('no-implicit-timezone', rule, {
  valid: [
    `
      declare const key: string;
      Intl.DateTimeFormat('en-US', { [key]: 'UTC' });
      Intl.DateTimeFormat('en-US', { timeZone: undefined, [key]: 'UTC' });
    `,
    `
      const date = new Date();
      date.getUTCFullYear();
      date.setUTCDate(2);
      date.getMilliseconds();
      date.toISOString();
      date.toJSON();
    `,
    `
      new Date(0);
      new Date('2026-01-02');
      new Date('2026-01-02T03:04:05Z');
      new Date('2026-01-02T03:04:05+09:00');
      Date.parse(dynamicValue);
      Date.UTC(2026, 0, 2);
    `,
    `
      const date = new Date();
      date.toLocaleString('en-US', { timeZone: 'UTC' });
      date.toLocaleDateString('ja-JP', { ...options, ['timeZone']: \`Asia/Tokyo\` });
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York' });
      Intl.DateTimeFormat('en-US', dynamicOptions);
      date.toLocaleString('en-US', { timeZone: dynamicZone });
    `,
    `
      const localeArgs = ['en-US', { timeZone: 'UTC' }] as const;
      const date = new Date();
      new Intl.DateTimeFormat(...localeArgs);
      Intl.DateTimeFormat(...localeArgs);
      date.toLocaleString(...localeArgs);
      date.toLocaleDateString(...localeArgs);
      date.toLocaleTimeString(...localeArgs);
      const optionsArgs = [{ timeZone: 'UTC' }] as const;
      new Intl.DateTimeFormat('en-US', ...optionsArgs);
      Intl.DateTimeFormat('en-US', ...optionsArgs);
      date.toLocaleString('en-US', ...optionsArgs);
      date.toLocaleString('en-US', { timeZone: 'UTC' }, ...[]);
      new Intl.DateTimeFormat('en-US', { timeZone: 'UTC' }, ...[]);
    `,
    `
      type Instant = Date;
      declare const instant: Instant;
      instant.getUTCFullYear();
      instant.toISOString();
    `,
    `
      const undefined = { timeZone: 'UTC' } as const;
      const date = new Date();
      date.toLocaleString('en-US', undefined);
      Intl.DateTimeFormat('en-US', undefined);
      date.toLocaleDateString('ja-JP', { timeZone: undefined });
    `,
    `
      class Date { constructor(..._args: unknown[]) {} }
      new Date(2026, 0);
      const value = { getDate: () => 2, toString: () => 'safe' };
      value.getDate();
      value.toString();
    `,
    `
      declare const value: any;
      declare const unknownValue: unknown;
      value.getDate();
      (unknownValue as { getDate(): number }).getDate();
      const tuple = [2026, 0] as const;
      new Date(...tuple);
    `,
  ],
  invalid: [
    {
      code: `declare const key: string; Intl.DateTimeFormat('en-US', { [key]: 'UTC', timeZone: undefined });`,
      errors: [{ messageId: 'invalidTimeZone' }],
    },
    {
      code: `new Date('2026-11-01T06:30:00.000Z').setMilliseconds(0);`,
      errors: [{ messageId: 'localMethod', data: { method: 'setMilliseconds' } }],
    },
    {
      code: `
        const date: Date | null = new Date();
        date?.getDate();
        date['setHours'](3);
        date.toDateString();
      `,
      errors: [
        { messageId: 'localMethod', data: { method: 'getDate' } },
        { messageId: 'localMethod', data: { method: 'setHours' } },
        { messageId: 'localMethod', data: { method: 'toDateString' } },
      ],
    },
    {
      code: `
        type Instant = Date;
        declare const instant: Instant;
        instant.getDate();
        instant.toLocaleString();
      `,
      errors: [{ messageId: 'localMethod', data: { method: 'getDate' } }, { messageId: 'missingTimeZone' }],
    },
    {
      code: `
        new Date(2026, 0, 2);
        Date();
        globalThis.Date('ignored');
      `,
      errors: [{ messageId: 'localConstructor' }, { messageId: 'dateCall' }, { messageId: 'dateCall' }],
    },
    {
      code: `
        new Date('2026-01-02T03:04');
        Date.parse(\`2026-01-02 03:04:05.123\`);
      `,
      errors: [{ messageId: 'offsetless' }, { messageId: 'offsetless' }],
    },
    {
      code: `
        const date = new Date();
        date.toLocaleString();
        date.toLocaleDateString('ja-JP', { timeZone: undefined });
        new Intl.DateTimeFormat('en-US');
        Intl.DateTimeFormat('ja-JP', { ['timeZone']: '' });
        date.toLocaleString('en-US', null);
        Intl.DateTimeFormat('en-US', undefined);
        date.toLocaleTimeString();
        date.toLocaleString('en-US', { timeZone: '' }, ...[]);
        new Intl.DateTimeFormat('en-US', { timeZone: undefined }, ...[]);
        Intl.DateTimeFormat('en-US', null, ...[]);
      `,
      errors: [
        { messageId: 'missingTimeZone' },
        { messageId: 'invalidTimeZone' },
        { messageId: 'missingTimeZone' },
        { messageId: 'invalidTimeZone' },
        { messageId: 'missingTimeZone' },
        { messageId: 'missingTimeZone' },
        { messageId: 'missingTimeZone' },
        { messageId: 'invalidTimeZone' },
        { messageId: 'invalidTimeZone' },
        { messageId: 'missingTimeZone' },
      ],
    },
  ],
});
