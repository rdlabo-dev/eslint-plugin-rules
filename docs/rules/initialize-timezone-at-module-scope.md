# @rdlabo/rules/initialize-timezone-at-module-scope

> Keep @rdlabo/workers-timezone initialization at one clear module-level site.

`initializeTimezone()` configures a module instance and must not move into a request, tenant, callback, or class lifecycle. The rule follows named imports, aliases, and namespace imports from `@rdlabo/workers-timezone`.

## Rule details

The following locations are allowed:

- A direct module-level expression statement
- A direct module-level variable initializer
- An exported module-level variable initializer

Functions, request handlers, IIFEs, control-flow blocks, class static blocks, nested expressions, and default exports are reported. A file may omit initialization entirely; the rule only requires that, when initialization is present, there is at most one allowed site. If one file contains multiple otherwise valid initialization sites, every site is reported.

ESLint analyzes one file at a time. The rule guarantees at most one clear site per file, not one site across an entire application.

### Incorrect

```ts
import { initializeTimezone } from '@rdlabo/workers-timezone';

export default {
  fetch() {
    initializeTimezone({ timeZone: 'Asia/Tokyo' });
  },
};
```

### Correct

```ts
import { initializeTimezone } from '@rdlabo/workers-timezone';

export const timezone = initializeTimezone({ timeZone: 'Asia/Tokyo' });
```

## Implementation

- [Rule source](../../src/rules/initialize-timezone-at-module-scope.ts)
- [Test source](../../tests/rules/initialize-timezone-at-module-scope.ts)
