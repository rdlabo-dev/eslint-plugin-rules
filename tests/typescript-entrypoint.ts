import plugin from '../src/typescript';
import workersRecommended from '../src/configs/workers-recommended';
import workersTimezoneRecommended from '../src/configs/workers-timezone-recommended';
import denySoftPrivateModifier from '../src/rules/deny-soft-private-modifier';
import initializeTimezoneAtModuleScope from '../src/rules/initialize-timezone-at-module-scope';
import noImplicitTimezone from '../src/rules/no-implicit-timezone';
import restrictTryBlock from '../src/rules/restrict-try-block';

describe('framework-independent TypeScript entry point', () => {
  it('exposes every framework-independent TypeScript rule', () => {
    expect(plugin).toEqual({
      configs: {
        'workers/recommended': workersRecommended,
        'workers-timezone/recommended': workersTimezoneRecommended,
      },
      rules: {
        'deny-soft-private-modifier': denySoftPrivateModifier,
        'initialize-timezone-at-module-scope': initializeTimezoneAtModuleScope,
        'no-implicit-timezone': noImplicitTimezone,
        'restrict-try-block': restrictTryBlock,
      },
    });
  });
});
