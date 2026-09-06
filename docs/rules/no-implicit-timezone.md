# @rdlabo/rules/no-implicit-timezone

> Prevent implicit host-timezone behavior across Date parsing, construction, access, and Intl formatting.

Cloudflare Workers use UTC as the host local timezone. Code that appeared to use a server's local timezone can therefore change calendar dates or wall-clock values after migration. This rule keeps those operations behind an explicit UTC or IANA-timezone boundary.

## Rule details

One rule covers the common escape hatches so applications do not need to discover and configure a collection of Date rules.

| Reported operation                                                       | Use instead                                                                              |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `new Date(year, month, ...)`                                             | `Date.UTC(...)` for UTC, or a timezone-aware wall-clock conversion                       |
| Callable `Date()`                                                        | Create an instant and format it explicitly                                               |
| Local getters/setters such as `getDate()` and `setHours()`               | A timezone conversion, or the corresponding `getUTC*`/`setUTC*` API when UTC is intended |
| `toString()`, `toDateString()`, `toTimeString()`                         | Explicit formatting                                                                      |
| `Intl.DateTimeFormat` or `Date#toLocale*` without an explicit `timeZone` | Add `{ timeZone: '...' }` or another explicit timezone option                            |
| ISO-like date-time literals without `Z` or `±HH:mm`                      | Add an offset, or parse them as a timezone-local wall clock                              |

`toISOString()`, `toJSON()`, `getTime()`, `valueOf()`, UTC methods, epoch constructors, and date-only `YYYY-MM-DD` strings are allowed. `toISOString()` is the correct representation for many instant contracts and is intentionally not banned.

Typed linting is required. The rule verifies that method receivers are the built-in `Date`, so unrelated objects with methods such as `getDate()` are not reported. `any`, `unknown`, dynamic Intl options (including a dynamic `timeZone` value), argument spreads among the first two slots of `Intl.DateTimeFormat` / `Date#toLocale*` (where the options position is uncertain), dynamic date strings, destructured methods, and spread Date constructor arguments are not guessed at and remain outside static analysis coverage. A trailing spread after a fixed options argument is still checked. A static non-empty `timeZone` string is accepted; missing options, `null` options, and an unshadowed global `undefined` options/`timeZone` value are reported.

The string check covers structurally ISO-like `YYYY-MM-DD[T ]HH:mm[:ss[.fraction]]` literals. It detects a missing offset; it is not a calendar or general date-string validator.

## Examples

### Incorrect

```ts
const local = new Date(2026, 0, 2, 9, 0);
const day = instant.getDate();
const label = instant.toLocaleString('ja-JP');
const parsed = new Date('2026-01-02T09:00:00');
```

### Correct

```ts
const instant = new Date('2026-01-02T00:00:00Z');
const epoch = instant.getTime();
const iso = instant.toISOString();
const utcDay = instant.getUTCDate();
const label = instant.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
```

For `@rdlabo/workers-timezone`, prefer `toLocalDate`, `toLocalDateTime`, and `localDateTimeToInstant` at business-calendar boundaries.

## Implementation

- [Rule source](../../src/rules/no-implicit-timezone.ts)
- [Test source](../../tests/rules/no-implicit-timezone.ts)
