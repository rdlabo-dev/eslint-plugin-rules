# @rdlabo/rules/no-viewmodel-subscribe

> Keep subscription ownership on the Component instead of a ViewModel class declaration.

This opt-in rule is not included in any recommended preset. A ViewModel exposes an Observable; its Component owns the subscription and its teardown.

## Configuration

Enable the rule from the package root in your TypeScript configuration:

```js
const rdlabo = require('@rdlabo/eslint-plugin-rules');

module.exports = [
  {
    files: ['**/*.ts'],
    plugins: { '@rdlabo/rules': rdlabo },
    rules: { '@rdlabo/rules/no-viewmodel-subscribe': 'error' },
  },
];
```

Use this fragment with your existing TypeScript parser configuration. The rule does not need type information and has no options or automatic fix.

## Rule Details

The rule preserves the fleet's existing `no-restricted-syntax` selector:

```text
ClassDeclaration[id.name="ViewModel"] CallExpression[callee.property.name="subscribe"]
```

Only class declarations named exactly `ViewModel` are selected; no Angular decorator or particular base class is required. All descendant calls are checked, including callbacks and nested classes. Dot calls and optional calls are detected. For compatibility with the original selector, computed identifier access such as `source[subscribe]()` is also detected, but string-key access such as `source['subscribe']()` is not. Calls on non-Observable objects are not distinguished. Named class expressions and classes with other names are outside this rule's scope.

### Incorrect

```ts
class ViewModel {
  start() {
    this.value$.subscribe();
  }
}
```

### Correct

```ts
class ViewModel {
  readonly value$ = source.pipe(map(transform));
}
```

Subscription teardown on the Component remains a separate responsibility; this rule does not verify it.
