import denySoftPrivateModifier from './rules/deny-soft-private-modifier';
import workersRecommended from './configs/workers-recommended';
import workersTimezoneRecommended from './configs/workers-timezone-recommended';
import initializeTimezoneAtModuleScope from './rules/initialize-timezone-at-module-scope';
import noImplicitTimezone from './rules/no-implicit-timezone';
import restrictTryBlock from './rules/restrict-try-block';

/**
 * Plugin entry point for framework-independent TypeScript rules.
 *
 * Importing this entry point must not load Angular or Ionic modules. Rules
 * whose behavior assumes Angular components, signals, DI, or templates belong
 * to the package root instead.
 */
export = {
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
};
