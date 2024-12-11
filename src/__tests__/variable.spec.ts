import { EnvironmentVariableType } from '../types';
import {
  booleanVar,
  durationVar,
  enumVar,
  numberVar,
  stringVar,
} from '../variable';

describe('stringVar())', () => {
  it('should return a string environment variable configuration', () => {
    const cfg = stringVar({
      pattern: 'abc',
    });

    expect(cfg).toEqual({
      type: EnvironmentVariableType.String,
      pattern: 'abc',
    });
  });
});

describe('numberVar()', () => {
  it('should return a number environment variable configuration', () => {
    const cfg = numberVar({
      format: 'integer',
      min: 1,
      max: 10,
    });

    expect(cfg).toEqual({
      type: EnvironmentVariableType.Number,
      format: 'integer',
      min: 1,
      max: 10,
    });
  });
});

describe('booleanVar()', () => {
  it('should return a boolean environment variable configuration', () => {
    const cfg = booleanVar();

    expect(cfg).toEqual({
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
      type: EnvironmentVariableType;
      enum: ['a', 'b', 'c'];
      default?: 'a' | 'b' | 'c' | undefined;
    }>();

    expect(cfg).toEqual({
      type: EnvironmentVariableType.Enum,
      enum: ['a', 'b', 'c'],
      default: 'a',
    });
  });
});

describe('durationVar()', () => {
  it('should return a duration environment variable configuration', () => {
    const cfg = durationVar('seconds');

    expect(cfg).toEqual({
      type: EnvironmentVariableType.Duration,
      unit: 'seconds',
    });
  });
});
