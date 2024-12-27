import { Duration, type Result } from '@ellefe/ts-core';

import { Environment } from '../environment';
import { EnvironmentErrorType } from '../types';
import {
  booleanVar,
  durationVar,
  enumVar,
  numberVar,
  stringVar,
} from '../variable';

enum Enum {
  A = 'a',
  B = 'b',
  C = 'c',
}

function getEnv(store: { [key: string]: string | undefined } = {}) {
  return new Environment(
    {
      BOOLEAN_DEFAULT: booleanVar({ default: true }),
      BOOLEAN_REQUIRED: booleanVar(),
      DURATION_DEFAULT: durationVar('seconds', {
        default: Duration.from(30, 'seconds'),
      }),
      DURATION_REQUIRED: durationVar('seconds'),
      ENUM_DEFAULT: enumVar(Enum, { default: Enum.A }),
      ENUM_REQUIRED: enumVar(Enum),
      NUMBER_DEFAULT: numberVar({ default: 42 }),
      NUMBER_INTEGER: numberVar({ format: 'integer' }),
      NUMBER_MAX: numberVar({ max: 10 }),
      NUMBER_MIN: numberVar({ min: 1 }),
      NUMBER_REQUIRED: numberVar(),
      STRING_DEFAULT: stringVar({ default: 'default' }),
      STRING_PATTERN: stringVar({ pattern: 'abc' }),
      STRING_REQUIRED: stringVar(),
    },
    store,
  );
}

function getErr<T, E>(result: Result<T, E>) {
  if (result.isErr()) {
    return result.inner();
  }

  throw new Error('Expected an error');
}

describe('class Envionment', () => {
  describe('get()', () => {
    describe('string', () => {
      it('should return the string value of an environment variable', () => {
        const env = getEnv({ STRING_REQUIRED: 'value' });

        expect(env.get('STRING_REQUIRED')._unwrap()).toBe('value');
      });

      it('should return an error if the string value is not set and no default', () => {
        const env = getEnv();

        expect(getErr(env.get('STRING_REQUIRED')).type).toBe(
          EnvironmentErrorType.VariableNotFoundError,
        );
      });

      it('should return the default string value if the string value is not set', () => {
        const env = getEnv();

        expect(env.get('STRING_DEFAULT')._unwrap()).toBe('default');
      });
    });

    describe('number', () => {
      it('should return the number value of an environment variable', () => {
        const env = getEnv({ NUMBER_REQUIRED: '42' });

        expect(env.get('NUMBER_REQUIRED')._unwrap()).toBe(42);
      });

      it('should return an error if the number value is not set and no default', () => {
        const env = getEnv();

        expect(getErr(env.get('NUMBER_REQUIRED')).type).toBe(
          EnvironmentErrorType.VariableNotFoundError,
        );
      });

      it('should return the default number value if the number value is not set', () => {
        const env = getEnv();

        expect(env.get('NUMBER_DEFAULT')._unwrap()).toBe(42);
      });

      it('should return an error if the number value is not a number', () => {
        const env = getEnv({ NUMBER_REQUIRED: 'not a number' });

        expect(getErr(env.get('NUMBER_REQUIRED')).type).toBe(
          EnvironmentErrorType.VariableParseError,
        );
      });

      it('should return an error if the number value is not an integer', () => {
        const env = getEnv({ NUMBER_INTEGER: '42.5' });

        expect(getErr(env.get('NUMBER_INTEGER')).type).toBe(
          EnvironmentErrorType.VariableParseError,
        );
      });

      it('should return an error if the number value is less than the minimum', () => {
        const env = getEnv({ NUMBER_MIN: '0' });

        expect(getErr(env.get('NUMBER_MIN')).type).toBe(
          EnvironmentErrorType.VariableParseError,
        );
      });

      it('should return an error if the number value is greater than the maximum', () => {
        const env = getEnv({ NUMBER_MAX: '11' });

        expect(getErr(env.get('NUMBER_MAX')).type).toBe(
          EnvironmentErrorType.VariableParseError,
        );
      });
    });

    describe('boolean', () => {
      it('should return the boolean value of an environment variable', () => {
        const env = getEnv({ BOOLEAN_REQUIRED: 'false' });

        expect(env.get('BOOLEAN_REQUIRED')._unwrap()).toBe(false);
      });

      it('should return an error if the boolean value is not set and no default', () => {
        const env = getEnv();

        expect(getErr(env.get('BOOLEAN_REQUIRED')).type).toBe(
          EnvironmentErrorType.VariableNotFoundError,
        );
      });

      it('should return the default boolean value if the boolean value is not set', () => {
        const env = getEnv();

        expect(env.get('BOOLEAN_DEFAULT')._unwrap()).toBe(true);
      });

      it('should return an error if the boolean value is not a boolean', () => {
        const env = getEnv({ BOOLEAN_REQUIRED: 'not a boolean' });

        expect(getErr(env.get('BOOLEAN_REQUIRED')).type).toBe(
          EnvironmentErrorType.VariableParseError,
        );
      });
    });

    describe('enum', () => {
      it('should return the enum value of an environment variable', () => {
        const env = getEnv({ ENUM_REQUIRED: 'b' });

        expect(env.get('ENUM_REQUIRED')._unwrap()).toBe(Enum.B);
      });

      it('should return an error if the enum value is not set and no default', () => {
        const env = getEnv();

        expect(getErr(env.get('ENUM_REQUIRED')).type).toBe(
          EnvironmentErrorType.VariableNotFoundError,
        );
      });

      it('should return the default enum value if the enum value is not set', () => {
        const env = getEnv();

        expect(env.get('ENUM_DEFAULT')._unwrap()).toBe(Enum.A);
      });

      it('should return an error if the enum value is not a valid enum', () => {
        const env = getEnv({ ENUM_REQUIRED: 'd' });

        expect(getErr(env.get('ENUM_REQUIRED')).type).toBe(
          EnvironmentErrorType.VariableParseError,
        );
      });
    });

    describe('duration', () => {
      it('should return the duration value of an environment variable', () => {
        const env = getEnv({ DURATION_REQUIRED: '30' });

        expect(env.get('DURATION_REQUIRED')._unwrap()).toStrictEqual(
          Duration.from(30, 'seconds'),
        );
      });

      it('should return an error if the duration value is not set and no default', () => {
        const env = getEnv();

        expect(getErr(env.get('DURATION_REQUIRED')).type).toBe(
          EnvironmentErrorType.VariableNotFoundError,
        );
      });

      it('should return the default duration value if the duration value is not set', () => {
        const env = getEnv();

        expect(env.get('DURATION_DEFAULT')._unwrap()).toStrictEqual(
          Duration.from(30, 'seconds'),
        );
      });

      it('should return an error if the duration value is not a valid duration', () => {
        const env = getEnv({ DURATION_REQUIRED: 'not a duration' });

        expect(getErr(env.get('DURATION_REQUIRED')).type).toBe(
          EnvironmentErrorType.VariableParseError,
        );
      });
    });
  });
});
