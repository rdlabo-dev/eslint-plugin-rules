# @rdlabo/rules/require-ion-error-text

> Require Ionic validation controls to provide an errorText source.

Requires Ionic controls participating in Angular Signal Forms validation to have a source for `errorText`.

By default the rule checks `ion-input`, `ion-textarea`, `ion-select`, `ion-checkbox`, `ion-radio-group`, and `ion-toggle` only when they bind `[formField]`. Static non-empty `errorText` and property-bound `[errorText]` are accepted. `[attr.errorText]` is not accepted because Ionic exposes a property input.

## Options

- `formFieldProvidesErrorText` (default `false`): set to `true` only after every relevant component imports `KitIonicFormField` and the application installs `provideKitIonicSignalForms()`.
- `checkAll` (default `false`): also checks supported controls without `[formField]`. This is opt-in because filters and settings controls are not necessarily validation fields.
- `ignoreReadonly` (default `false`): with `checkAll`, ignores `ion-input` and `ion-textarea` carrying a literal `readonly` attribute. A dynamic `[readonly]` binding is still checked.

The rule reports only and does not autofix application validation policy.

## Implementation

- [Rule source](../../src/rules/require-ion-error-text.ts)
- [Test source](../../tests/rules/require-ion-error-text.ts)
