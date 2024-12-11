/**
 * @file Defines types for environment variables and their configurations
 * @author Rowan Gudmundsson
 * @since 1.0.0
 */

/**
 * Environment error types
 */
export enum EnvironmentErrorType {
  VariableNotFoundError = 'not-found-error',
  VariableParseError = 'parse-error',
  VariableUnknownError = 'unknown-error',
}
