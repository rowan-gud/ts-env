/**
 * @file Defines types for environment variables and their configurations
 * @author Rowan Gudmundsson
 * @since 1.0.0
 */
import { type DurationUnit, type EnumLike } from '@ellefe/ts-core';

import {
  type BooleanEnvironmentVariableConfig,
  type DurationEnvironmentVariableConfig,
  type EnumEnvironmentVariableConfig,
  EnvironmentVariableType,
  type NumberEnvironmentVariableConfig,
  type StringEnvironmentVariableConfig,
} from './types';

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
 * Create an enum environment variable
 *
 * @param enumType The enum type
 * @param options The options for the environment variable
 * @returns The environment variable configuration
 */
export function enumVar<T extends EnumLike>(
  enumType: T,
  options: Omit<EnumEnvironmentVariableConfig<T>, 'type' | 'enum'> = {},
): EnumEnvironmentVariableConfig<T> {
  return {
    type: EnvironmentVariableType.Enum,
    enum: enumType,
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
