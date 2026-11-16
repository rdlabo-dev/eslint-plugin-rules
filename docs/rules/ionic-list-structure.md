# @rdlabo/rules/ionic-list-structure

> Prevent note-only Ionic rows and list headers placed after list items.
>
> - ⭐️ This rule is included in Flat Config [`rdlabo.configs.recommended`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration).

## Rule Details

This rule reports two structural mistakes in Angular templates:

- An `ion-item` whose only child is one `ion-note` (ignoring whitespace and comments). Explanatory text should sit outside the item and its item group, without the row background and spacing.
- An `ion-list-header` preceded by an `ion-item` or `ion-item-group` in the same `ion-list`. Close the previous list and start a new list for the next section.

The header check traverses wrappers and Angular control-flow blocks. Nested lists have independent item tracking. It checks source order, including conditional items; it does not evaluate runtime conditions. The note check intentionally checks direct children only. Notes alongside labels, values, or controls remain valid.

Diagnostics explain the layout problem and the intended structure. No automatic fixes or suggestions are provided because choosing list boundaries and moving projected content requires application context.

### Incorrect

```html
<ion-list>
  <ion-item-group>
    <ion-item><ion-note>Request bookings require approval.</ion-note></ion-item>
  </ion-item-group>
  <ion-list-header>Another section</ion-list-header>
</ion-list>
```

### Correct

```html
<ion-list>
  <ion-item-group>
    <ion-item><ion-label>Booking method</ion-label><ion-note slot="end">Request</ion-note></ion-item>
  </ion-item-group>
  <ion-note>Request bookings require approval.</ion-note>
</ion-list>
<ion-list>
  <ion-list-header>Another section</ion-list-header>
  <ion-item-group>
    <ion-item>Another setting</ion-item>
  </ion-item-group>
</ion-list>
```

## Implementation

- [Rule source](../../src/rules/ionic-list-structure.ts)
- [Test source](../../tests/rules/ionic-list-structure.ts)
