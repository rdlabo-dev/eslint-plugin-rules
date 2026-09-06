import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/initialize-timezone-at-module-scope';

new RuleTester().run('initialize-timezone-at-module-scope', rule, {
  valid: [
    `
      import { initializeTimezone } from '@rdlabo/workers-timezone';
      initializeTimezone({ timeZone: 'UTC' });
    `,
    `
      import { initializeTimezone as initialize } from '@rdlabo/workers-timezone';
      export const timezone = initialize({ timeZone: 'UTC' });
    `,
    `
      import * as timezone from '@rdlabo/workers-timezone';
      const config = timezone.initializeTimezone({ timeZone: 'UTC' });
    `,
    `
      import * as timezone from '@rdlabo/workers-timezone';
      timezone['initializeTimezone']({ timeZone: 'UTC' });
    `,
    `
      import * as timezone from '@rdlabo/workers-timezone';
      timezone[\`initializeTimezone\`]({ timeZone: 'UTC' });
    `,
    `
      import { initializeTimezone } from '@rdlabo/workers-timezone';
    `,
    `
      import { initializeTimezone } from 'another-package';
      function fetch() { initializeTimezone({ timeZone: 'UTC' }); }
    `,
  ],
  invalid: [
    {
      code: `
        import { initializeTimezone } from '@rdlabo/workers-timezone';
        export default initializeTimezone({ timeZone: 'UTC' });
      `,
      errors: [{ messageId: 'moduleScope' }],
    },
    {
      code: `
        import { initializeTimezone as initialize } from '@rdlabo/workers-timezone';
        export default { fetch() { initialize({ timeZone: 'UTC' }); } };
      `,
      errors: [{ messageId: 'moduleScope' }],
    },
    {
      code: `
        import * as timezone from '@rdlabo/workers-timezone';
        if (enabled) timezone.initializeTimezone({ timeZone: 'UTC' });
      `,
      errors: [{ messageId: 'moduleScope' }],
    },
    {
      code: `
        import * as timezone from '@rdlabo/workers-timezone';
        function fetch() { timezone['initializeTimezone']({ timeZone: 'UTC' }); }
      `,
      errors: [{ messageId: 'moduleScope' }],
    },
    {
      code: `
        import * as timezone from '@rdlabo/workers-timezone';
        if (enabled) timezone[\`initializeTimezone\`]({ timeZone: 'UTC' });
      `,
      errors: [{ messageId: 'moduleScope' }],
    },
    {
      code: `
        import { initializeTimezone } from '@rdlabo/workers-timezone';
        initializeTimezone({ timeZone: 'UTC' });
        export const config = initializeTimezone({ timeZone: 'UTC' });
      `,
      errors: [{ messageId: 'multipleSites' }, { messageId: 'multipleSites' }],
    },
  ],
});
