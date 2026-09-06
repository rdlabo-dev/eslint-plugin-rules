# @rdlabo/eslint-plugin-rules

<!-- rdlabo-docs-omit -->

[![npm version](https://badge.fury.io/js/%40rdlabo%2Feslint-plugin-rules.svg)](https://badge.fury.io/js/%40rdlabo%2Feslint-plugin-rules)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- /rdlabo-docs-omit -->

Install the plugin as a development dependency:

```sh
npm install --save-dev @rdlabo/eslint-plugin-rules
```

The package root provides Angular and Ionic rules. Install `@angular-eslint/template-parser`, `@ionic/angular`, and `@ionic/core` when you enable those rules. Framework-independent TypeScript projects can use the `/typescript` entry point without loading Angular or Ionic. Cloudflare Workers presets cover explicit error boundaries and timezone-safe Date usage.

## Requirements

| Package                           | Supported version             |
| --------------------------------- | ----------------------------- |
| Node.js                           | 20 or later                   |
| ESLint                            | 9 or later                    |
| `@typescript-eslint/utils`        | 8.33 or later, before 9       |
| `@angular-eslint/template-parser` | 21.x or 22.x                  |
| `@ionic/angular`                  | 9.x when Ionic rules are used |
| `@ionic/core`                     | 9.x when Ionic rules are used |

## Choose an entry point

| Preset                         | Entry point                              | Purpose                                                  |
| ------------------------------ | ---------------------------------------- | -------------------------------------------------------- |
| `recommended`                  | `@rdlabo/eslint-plugin-rules`            | Angular and Ionic fleet defaults for TypeScript and HTML |
| `workers/recommended`          | `@rdlabo/eslint-plugin-rules/typescript` | Opt-in Workers `try/catch` policy                        |
| `workers-timezone/recommended` | `@rdlabo/eslint-plugin-rules/typescript` | Opt-in companion policy for `@rdlabo/workers-timezone`   |

The Angular `recommended` preset ships with the package root. The two Workers presets are independent opt-ins on `/typescript`; neither includes the other.

For timezone conversions and calendar boundaries, see the [`@rdlabo/workers-timezone` usage guide](https://github.com/rdlabo-dev/workers-hono-kit/tree/main/packages/timezone#readme).

The recommended preset is designed for ESLint Flat Config. Add it at the top level so its TypeScript and HTML file selectors remain intact.

For Ionic templates, the preset also requires `ion-item` elements inside `ion-list` to use `ion-item-group`, `ion-reorder-group`, `ion-radio-group`, or `ion-accordion` within `ion-accordion-group`, matching the iOS 26 and Material Design 3 list structure.

## Next step

Continue to [Configuration](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration) to enable the recommended preset or individual rules.

## Documentation

- [Configuration](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration)
- [Migration guide](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/migration)
- [Rules](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules)

<!-- rdlabo-docs-omit -->

**Full documentation:** [https://docs.rdlabo.dev/projects/eslint-plugin-rules](https://docs.rdlabo.dev/projects/eslint-plugin-rules)

## Support This Project

Enjoying this project? Your support helps keep it alive and growing. Sponsoring means you directly contribute to new features, improvements, and maintenance.

[Become a Sponsor](https://github.com/sponsors/rdlabo)

## Prerelease channels

An open, non-draft pull request can be published to the npm `beta` dist-tag after its `CI` and `Package Candidate` workflows pass. A repository owner or maintainer must add a comment whose entire body is:

```text
/beta
```

The request authorizes only the pull request head SHA that existed when the comment was added. The workflow revalidates the owner or maintainer permission and head SHA immediately before publishing. Any new commit requires CI to pass again and a fresh owner or maintainer `/beta` comment. Fork pull requests are supported. Pull requests that change a release-gating workflow cannot be beta-published until those workflow changes land on `main`.

Beta versions use `<base>-beta.pr<PR number>.sha<12-character SHA>`. The candidate is built in a read-only workflow without npm publishing credentials. The privileged release workflow publishes only the validated immutable package artifact with lifecycle scripts disabled. A notification failure cannot invalidate a successful npm publish.

When a pull request is merged into `main`, it is automatically published to `beta` only after the required CI and `Package Candidate` succeed for that exact merge commit. Direct pushes to `main` do not publish a candidate.

Only `npm run release` creates a release tag. Stable `vX.Y.Z` tags publish to npm `latest`; revision/prerelease tags publish to `next`. Neither `beta` nor `next` publishing changes the npm `latest` dist-tag.

## Maintainers

- [rdlabo](https://rdlabo.dev/)

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
<!-- /rdlabo-docs-omit -->
