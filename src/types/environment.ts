/**
 * @file Defines types for environment variables and their configurations
 * @author Rowan Gudmundsson
 * @since 1.0.0
 */
import type {
  EnvironmentVariableConfig,
  InferEnvironmentVariableType,
} from './variable';

/**
 * The configuration for an environment
 */
export type EnvironmentConfig<Vars extends string = string> = {
  [K in Vars]?: EnvironmentVariableConfig;
};

/**
 * The inferred type of an environment
 */
export type InferEnvironmentType<T extends EnvironmentConfig> = {
  [K in keyof T]: InferEnvironmentVariableType<T[K]>;
};
