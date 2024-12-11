import { Duration } from '@ellefe/ts-core';

import { Environment, durationVar, enumVar } from '../src';

const env = new Environment({
  NODE_ENV: enumVar(['development', 'production']),
  LOG_LEVEL: enumVar(['error', 'warn', 'info', 'debug'], { default: 'info' }),

  DEFAULT_TIMEOUT: durationVar('seconds', {
    default: Duration.from(30, 'seconds'),
  }),
});

function main() {
  if (env.get('NODE_ENV').unwrapOr('development') === 'production') {
    console.log('Running in production mode');
  }

  console.log(`Log level: ${env.get('LOG_LEVEL')._unwrap()}`);

  console.log(
    `Default timeout is: ${env.getExpect('DEFAULT_TIMEOUT').seconds()} seconds`,
  );
}

void main();
