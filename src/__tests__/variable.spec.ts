import { EnvironmentVariableType } from '../types';
import {
  booleanVar,
  durationVar,
  enumVar,
  numberVar,
  stringVar,
} from '../variable';

describe('stringVar()', () => {
  it('should return a string environment variable configuration', () => {
    const cfg = stringVar({
      pattern: 'abc',
    });

    expect(cfg).toStrictEqual({
      pattern: 'abc',
      type: EnvironmentVariableType.String,
    });
  });
});

describe('numberVar()', () => {
  it('should return a number environment variable configuration', () => {
    const cfg = numberVar({
      format: 'integer',
      max: 10,
      min: 1,
    });

    expect(cfg).toStrictEqual({
      format: 'integer',
      max: 10,
      min: 1,
      type: EnvironmentVariableType.Number,
    });
  });
});

describe('booleanVar()', () => {
  it('should return a boolean environment variable configuration', () => {
    const cfg = booleanVar();

    expect(cfg).toStrictEqual({
      type: EnvironmentVariableType.Boolean,
    });
  });
});

describe('enumVar()', () => {
  it('should return an enum environment variable configuration', () => {
    const cfg = enumVar(['a', 'b', 'c'] as const, {
      default: 'a',
    });

    expectTypeOf<typeof cfg>().toMatchTypeOf<{
      default?: 'a' | 'b' | 'c' | undefined;
      enum: ['a', 'b', 'c'];
      type: EnvironmentVariableType;
    }>();

    expect(cfg).toStrictEqual({
      default: 'a',
      enum: ['a', 'b', 'c'],
      type: EnvironmentVariableType.Enum,
    });
  });
});

describe('durationVar()', () => {
  it('should return a duration environment variable configuration', () => {
    const cfg = durationVar('seconds');

    expect(cfg).toStrictEqual({
      type: EnvironmentVariableType.Duration,
      unit: 'seconds',
    });
  });
});
