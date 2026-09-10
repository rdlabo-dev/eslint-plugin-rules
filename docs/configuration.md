# Configuration

Use the package root for Angular and Ionic, or `/typescript` for framework-independent code. Start with the setup for your project, then enable only the policies you need. See the [rule catalog](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules) for preset coverage and the [migration guide](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/migration) when upgrading.

## Angular and Ionic

Plugin 22 supports Angular and Angular ESLint 21–22 with Ionic Framework 9. When upgrading from plugin 21, review the [migration guide](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/migration) before enabling the updated recommended preset.

Register the plugin, spread its recommended configs at the top level, then add the standard Angular and TypeScript configs for your project.

```js
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const rdlabo = require('@rdlabo/eslint-plugin-rules');

module.exports = tseslint.config(
  {
    plugins: { '@rdlabo/rules': rdlabo },
  },
  ...rdlabo.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  },
);
```

Do not place `rdlabo.configs.recommended` inside a scoped `extends`. The `typescript-eslint` config helper would replace the preset's internal `files` selectors and could run TypeScript-only rules against templates.

### Angular and Ionic recommended coverage

The preset enables the common Signal, component boundary, lifecycle, overlay, readonly, and try-block rules for TypeScript. Its HTML config enables Ionic attribute checking, denied overlay elements, double-action prevention, error text on validation controls, and item grouping inside lists.

The TypeScript preset includes `prefer-ionic-standalone`, which requires Ionic 9 root imports and rejects `IonicModule` and NgModule-based lazy imports.

`deny-constructor-di` is deprecated and is not in the preset. Prefer Angular's `inject()` migration.

## Framework-independent TypeScript

To select individual rules without Angular or Ionic, use `eslint.config.mjs` with typed linting. Install the same configuration dependencies listed in the Workers section below, and ensure the linted TypeScript files belong to your project's `tsconfig.json`.

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

export default tseslint.config({
  files: ['**/*.ts'],
  extends: [...tseslint.configs.recommendedTypeChecked],
  languageOptions: {
    parserOptions: { projectService: true, tsconfigRootDir: dirname(fileURLToPath(import.meta.url)) },
  },
  plugins: { '@rdlabo/rules': rdlabo },
  rules: {
    '@rdlabo/rules/deny-soft-private-modifier': 'error',
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
});
```

Typed linting is required for the full Promise and RxJS checks in `restrict-try-block`.

## Cloudflare Workers

The framework-independent `/typescript` entry point provides two independent opt-in presets. Neither is included by Angular `recommended`, and neither includes the other.

| Preset                         | Rules and options                                                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `workers/recommended`          | `restrict-try-block` with `{ allowPromise: false, allowPromiseResolve: true, allowRxjs: false, allowInSignal: false, maxLines: 3 }` |
| `workers-timezone/recommended` | `no-implicit-timezone` and `initialize-timezone-at-module-scope` (both `error`)                                                     |

Enable either preset independently, or combine both. Scope type-aware `typescript-eslint` configs to `**/*.ts` so tools that lint `eslint.config.mjs` do not ask `projectService` for a TypeScript project that does not include that file:

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir },
    },
    plugins: { '@rdlabo/rules': rdlabo },
  },
  ...rdlabo.configs['workers/recommended'],
  ...rdlabo.configs['workers-timezone/recommended'],
);
```

Install the configuration dependencies used above:

```sh
npm install --save-dev eslint @eslint/js typescript typescript-eslint @rdlabo/eslint-plugin-rules
```

`no-implicit-timezone` requires typed linting. `initialize-timezone-at-module-scope` is syntactic: a file may omit initialization, and when initialization is present there may be at most one allowed site in that file—not an app-wide single site, and not a mandatory call in every module.

The timezone preset is a companion to [`@rdlabo/workers-timezone`](https://docs.rdlabo.dev/projects/workers-timezone/docs/readme); neither package depends on the other at runtime. It reports statically identifiable operations, not every dynamic timezone value. See [no-implicit-timezone](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-implicit-timezone) and [initialize-timezone-at-module-scope](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/initialize-timezone-at-module-scope) for exact coverage and limitations.

The Workers preset deliberately does not include the timezone preset, so general Workers policy updates do not implicitly enable date policies.
