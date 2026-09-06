import type { Linter } from 'eslint';

const workersRecommended: Linter.Config[] = [
  {
    name: '@rdlabo/rules/workers/recommended',
    files: ['**/*.ts'],
    rules: {
      '@rdlabo/rules/restrict-try-block': [
        'error',
        {
          allowPromise: false,
          allowPromiseResolve: true,
          allowRxjs: false,
          allowInSignal: false,
          maxLines: 3,
        },
      ],
    },
  },
];

export = workersRecommended;
