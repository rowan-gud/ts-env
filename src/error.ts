/**
 * @file Defines an error class for environment variable errors
 * @author Rowan Gudmundsson
 * @since 1.0.0
 */
import {
  type EnvironmentErrorType,
  type EnvironmentVariableConfig,
} from './types';

/**
 * An error for environment variable errors
 */
export class EnvironmentError extends Error {
  constructor(
    /** The type of the error */
    public readonly type: EnvironmentErrorType,

    /** The key of the environment variable */
    public readonly key: string,

    /** The configuration of the environment variable */
    public readonly config?: EnvironmentVariableConfig,

    /** The raw value of the environment variable */
    public readonly raw?: string,
  ) {
    super(`Error getting environment variable ${key}`);
  }

  /**
   * Sets the message of the error
   *
   * @param message The message to set
   * @returns This error
   */
  public withMessage(message: string): this {
    this.message = message;
    return this;
  }
}
