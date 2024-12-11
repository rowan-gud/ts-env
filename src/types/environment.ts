/**
 * @file Defines types for environment variables and their configurations
 * @author Rowan Gudmundsson
 * @since 1.0.0
 */
import {
  type EnvironmentVariableConfig,
  type InferEnvironmentVariableType,
} from './variable';

/**
 * The configuration for an environment
 */
export type EnvironmentConfig = Record<string, EnvironmentVariableConfig>;

/**
 * The inferred type of an environment
 */
export type InferEnvironmentType<T extends EnvironmentConfig> = {
  [K in keyof T]: InferEnvironmentVariableType<T[K]>;
};
