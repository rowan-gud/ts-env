/**
 * @file Defines types for environment variables and their configurations
 * @author Rowan Gudmundsson
 * @since 1.0.0
 */
import type { Duration, DurationUnit } from '@ellefe/ts-core';
import type { EnumLike, EnumValue } from '@ellefe/ts-core';

/**
 * The possible types for an environment variable
 */
export enum EnvironmentVariableType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Enum = 'enum',
  Duration = 'duration',
}

/**
 * Config for a boolean environment variable
 */
export interface BooleanEnvironmentVariableConfig
  extends EnvironmentVariableBase<boolean> {
  /** The type of the environment variable */
  type: EnvironmentVariableType.Boolean;

  /**
   * The values that are considered false. The values are case-insensitive.
   * If not provided, the default values are:
   * - 'false'
   * - '0'
   * - 'no'
   * - 'n'
   */
  validFalseValues?: string[];

  /**
   * The values that are considered true. The values are case-insensitive.
   * If not provided, the default values are:
   * - 'true'
   * - '1'
   * - 'yes'
   * - 'y'
   */
  validTrueValues?: string[];
}

/**
 * Config for a duration environment variable
 */
export interface DurationEnvironmentVariableConfig
  extends EnvironmentVariableBase<Duration> {
  /** The type of the environment variable */
  type: EnvironmentVariableType.Duration;

  /** The unit to interpret the duration as */
  unit: DurationUnit;
}

/**
 * Config for an enum environment variable
 */
export interface EnumEnvironmentVariableConfig<T extends EnumLike>
  extends EnvironmentVariableBase<EnumValue<T>> {
  /**
   * The possible values for the environment variable.
   * This can either be an array of possible values, or an object
   * the the values are the possible values for the enum (like an enum in TypeScript)
   */
  enum: T;

  /** The type of the environment variable */
  type: EnvironmentVariableType.Enum;
}

/**
 * The configuration for an environment variable
 */
export type EnvironmentVariableConfig =
  | BooleanEnvironmentVariableConfig
  | DurationEnvironmentVariableConfig
  | EnumEnvironmentVariableConfig<any>
  | NumberEnvironmentVariableConfig
  | StringEnvironmentVariableConfig;

/**
 * Get the type of the value of an environment variable config
 */
export type InferEnvironmentVariableType<T> =
  T extends EnvironmentVariableConfig
    ? T extends EnumEnvironmentVariableConfig<infer E>
      ? EnumValue<E>
      : T['type'] extends keyof KnownEnvironmentVariableTypeMap
        ? KnownEnvironmentVariableTypeMap[T['type']]
        : never
    : never;

/**
 * Config for a number environment variable
 */
export interface NumberEnvironmentVariableConfig
  extends EnvironmentVariableBase<number> {
  /** The format of the number */
  format?: 'decimal' | 'integer';

  /** The maximum value the number can be */
  max?: number;

  /** The minimum value the number can be */
  min?: number;

  /** The type of the environment variable */
  type: EnvironmentVariableType.Number;
}

/**
 * Config for a string environment variable
 */
export interface StringEnvironmentVariableConfig
  extends EnvironmentVariableBase<string> {
  /** A regular expression pattern that the environment variable must match */
  pattern?: RegExp | string;

  /**
   * Whether to allow the empty string
   *
   * @default false
   */
  shouldAllowEmpty?: boolean;

  /** The type of the environment variable */
  type: EnvironmentVariableType.String;
}

interface EnvironmentVariableBase<T> {
  default?: T;
  type: EnvironmentVariableType;
}

interface KnownEnvironmentVariableTypeMap {
  [EnvironmentVariableType.Boolean]: boolean;
  [EnvironmentVariableType.Duration]: Duration;
  [EnvironmentVariableType.Number]: number;
  [EnvironmentVariableType.String]: string;
}
