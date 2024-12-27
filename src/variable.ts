/**
 * @file Defines types for environment variables and their configurations
 * @author Rowan Gudmundsson
 * @since 1.0.0
 */
import type { DurationUnit, EnumLike } from '@ellefe/ts-core';

import {
  type BooleanEnvironmentVariableConfig,
  type DurationEnvironmentVariableConfig,
  type EnumEnvironmentVariableConfig,
  EnvironmentVariableType,
  type NumberEnvironmentVariableConfig,
  type StringEnvironmentVariableConfig,
} from './types';

/**
 * Create a boolean environment variable
 *
 * @param options The options for the environment variable
 * @returns The environment variable configuration
 */
export function booleanVar(
  options: Omit<BooleanEnvironmentVariableConfig, 'type'> = {},
): BooleanEnvironmentVariableConfig {
  return {
    type: EnvironmentVariableType.Boolean,
    ...options,
  };
}

/**
 * Create a duration environment variable
 *
 * @param unit The unit to interpret the duration as
 * @param options The options for the environment variable
 * @returns The environment variable configuration
 */
export function durationVar(
  unit: DurationUnit,
  options: Omit<DurationEnvironmentVariableConfig, 'type' | 'unit'> = {},
): DurationEnvironmentVariableConfig {
  return {
    type: EnvironmentVariableType.Duration,
    unit,
    ...options,
  };
}

/**
 * Create an enum environment variable
 *
 * @param enumType The enum values that the variable can be
 * @param options The options for the environment variable
 * @returns The environment variable configuration
 */
export function enumVar<T extends EnumLike>(
  enumType: T,
  options: Omit<EnumEnvironmentVariableConfig<T>, 'enum' | 'type'> = {},
): EnumEnvironmentVariableConfig<T> {
  return {
    enum: enumType,
    type: EnvironmentVariableType.Enum,
    ...options,
  };
}

/**
 * Create a number environment variable
 *
 * @param options The options for the environment variable
 * @returns The environment variable configuration
 */
export function numberVar(
  options: Omit<NumberEnvironmentVariableConfig, 'type'> = {},
): NumberEnvironmentVariableConfig {
  return {
    type: EnvironmentVariableType.Number,
    ...options,
  };
}

/**
 * Create a string environment variable
 *
 * @param options The options for the environment variable
 * @returns The environment variable configuration
 */
export function stringVar(
  options: Omit<StringEnvironmentVariableConfig, 'type'> = {},
): StringEnvironmentVariableConfig {
  return {
    type: EnvironmentVariableType.String,
    ...options,
  };
}
