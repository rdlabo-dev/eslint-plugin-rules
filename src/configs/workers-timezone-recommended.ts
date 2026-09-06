import type { Linter } from 'eslint';

const workersTimezoneRecommended: Linter.Config[] = [
  {
    name: '@rdlabo/rules/workers-timezone/recommended',
    files: ['**/*.ts'],
    rules: {
      '@rdlabo/rules/no-implicit-timezone': 'error',
      '@rdlabo/rules/initialize-timezone-at-module-scope': 'error',
    },
  },
];

export = workersTimezoneRecommended;
