---
title: See a lint rule detect and fix code
---

Make a convention executable: inspect a TypeScript private member, see the diagnostics, and let ESLint convert it to a JavaScript private field. This exercise uses one framework-independent rule, so you can try it without creating an Angular or Ionic application.

## Choose a policy before installing it everywhere

| Project need                           | Entry point and preset                        |
| -------------------------------------- | --------------------------------------------- |
| Angular/Ionic components and templates | Package root, `recommended`                   |
| Workers error boundaries               | `/typescript`, `workers/recommended`          |
| Timezone regression checks             | `/typescript`, `workers-timezone/recommended` |

The two Workers presets are independent opt-ins. For timezone work, start with [the paired library and lint exercise](https://docs.rdlabo.dev/projects/workers-timezone/docs/quickstart). The plugin reports code patterns; it does not implement runtime conversions or replace application tests.

## 1. Create a small lint project

Use Node.js 24 and npm. This isolated exercise uses ESLint 10; see [requirements](../README.md) before changing an existing application.

```sh
mkdir eslint-rules-demo
cd eslint-rules-demo
npm init -y
npm pkg set type=module
npm install --save-dev @rdlabo/eslint-plugin-rules@22.1.0 eslint@10 typescript@6 typescript-eslint@8
```

Save this as `eslint.config.mjs`. This syntax-only rule does not need a TypeScript project or typed linting:

```js
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

export default tseslint.config({
  files: ['**/*.ts'],
  languageOptions: { parser: tseslint.parser },
  plugins: { '@rdlabo/rules': rdlabo },
  rules: { '@rdlabo/rules/deny-soft-private-modifier': 'error' },
});
```

## 2. See the rule in action

Save this as `demo.ts`:

```ts
class Counter {
  private value = 0;

  increment() {
    return ++this.value;
  }
}

console.log(new Counter().increment());
```

```sh
npx eslint demo.ts
```

Expect a nonzero exit status and two `@rdlabo/rules/deny-soft-private-modifier` diagnostics: one for the declaration and one for the member access.

## 3. Apply and inspect the fix

```sh
npx eslint demo.ts --fix
npx eslint demo.ts
```

The second command should pass. Inspect `demo.ts`; the declaration and access should now use a JavaScript private field:

```ts
class Counter {
  #value = 0;

  increment() {
    return ++this.#value;
  }
}

console.log(new Counter().increment());
```

This is one rule demonstration, not a complete project preset. Not every rule has an autofix. Review automatic changes before committing them.

## 4. Adopt the right preset

Open [Configuration](./configuration.md) for Angular/Ionic or Workers setup. Preserve the TypeScript and HTML selectors when spreading the Angular preset, and enable typed linting for rules that inspect types. Run your project lint command in CI and include it in contributor and AI coding instructions.

Use [the rule catalog](./rules.md) to add one policy at a time. Check [Migration](./migration.md) before enabling a newer recommended preset in an existing application.
