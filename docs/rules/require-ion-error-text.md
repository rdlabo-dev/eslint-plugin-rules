# @rdlabo/rules/require-ion-error-text

> Require Ionic validation controls to provide an errorText source.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

Requires Ionic controls participating in Angular Signal Forms validation to have a source for `errorText`.

## Rule Details

The rule checks these Ionic controls in Angular template files:

- `ion-input`
- `ion-textarea`
- `ion-select`
- `ion-checkbox`
- `ion-radio-group`
- `ion-toggle`

By default, a supported control is checked only when it binds Angular Signal Forms with `[formField]`. It must use one of these error text sources:

- A non-empty static `errorText`
- A property-bound `[errorText]`
- `KitIonicFormField`, when `formFieldProvidesErrorText` is enabled

`[attr.errorText]` is not accepted because Ionic exposes `errorText` as a component property. An empty or whitespace-only static value is also rejected. `.spec.html` files are ignored.

## Options

```json
{
  "rules": {
    "@rdlabo/rules/require-ion-error-text": [
      "error",
      {
        "formFieldProvidesErrorText": true,
        "checkAll": false,
        "ignoreReadonly": false
      }
    ]
  }
}
```

### `formFieldProvidesErrorText`

- Type: `boolean`
- Default: `false`

When `true`, a supported control with `[formField]` may omit `errorText` because `KitIonicFormField` supplies it. Enable this option only after every relevant standalone component imports `KitIonicFormField` and the application installs `provideKitIonicSignalForms()`.

This option declares that the adapter is installed; the rule does not inspect component imports or application providers. An explicit but empty `errorText` remains an error instead of falling back to the adapter.

### `checkAll`

- Type: `boolean`
- Default: `false`

When `true`, the rule also checks supported controls without `[formField]`. This is opt-in because filters, search fields, and settings controls do not necessarily participate in validation.

### `ignoreReadonly`

- Type: `boolean`
- Default: `false`

When both `checkAll` and `ignoreReadonly` are `true`, `ion-input` and `ion-textarea` with a literal `readonly` attribute are ignored. A dynamic `[readonly]` binding remains checked because the control may become editable at runtime.

## Examples

### Incorrect

```html
<ion-input [formField]="fields.name"></ion-input>
```

```html
<ion-textarea [formField]="fields.description" errorText="   "></ion-textarea>
```

```html
<ion-select [formField]="fields.category" [attr.errorText]="categoryError"></ion-select>
```

With `checkAll: true`, a supported control without `[formField]` also requires an error text source:

```html
<ion-toggle></ion-toggle>
```

### Correct

```html
<ion-input [formField]="fields.name" errorText="Name is required."></ion-input>
```

```html
<ion-textarea [formField]="fields.description" [errorText]="descriptionError()"></ion-textarea>
```

With `formFieldProvidesErrorText: true` and the kit adapter installed:

```html
<ion-select [formField]="fields.category"></ion-select>
```

With `checkAll: true` and `ignoreReadonly: true`:

```html
<ion-input readonly></ion-input>
```

Unsupported controls such as `ion-searchbar` are outside the rule's scope:

```html
<ion-searchbar [formField]="fields.query"></ion-searchbar>
```

## When to enable

Enable this rule in Ionic Angular applications that use Ionic's `errorText` API for validation feedback. The default scope is appropriate for Angular Signal Forms applications because it checks validation-bound controls without imposing error messages on unrelated UI controls.

Use `formFieldProvidesErrorText` when the application delegates generic validation messages to `@rdlabo/ionic-angular-kit`. Use `checkAll` only when the application requires every supported Ionic control to declare an error text source.

The rule reports only and does not autofix application validation policy or adapter setup.

## See also

- [`@rdlabo/ionic-angular-kit` Signal Forms integration](https://github.com/rdlabo-dev/ionic-angular-library/blob/main/projects/kit/docs/forms.md)

## Implementation

- [Rule source](../../src/rules/require-ion-error-text.ts)
- [Test source](../../tests/rules/require-ion-error-text.ts)
