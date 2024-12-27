/**
 * @file Defines an Environment class for handling environment variables and their configurations
 * @author Rowan Gudmundsson
 * @since 1.0.0
 */
import type {
  EnumLike,
  EnumValue,
  Result,
  StringKeysOf,
} from '@ellefe/ts-core';

import { Duration, err, isString, ok } from '@ellefe/ts-core';

import type {
  BooleanEnvironmentVariableConfig,
  DurationEnvironmentVariableConfig,
  EnumEnvironmentVariableConfig,
  EnvironmentConfig,
  EnvironmentVariableConfig,
  InferEnvironmentType,
  NumberEnvironmentVariableConfig,
  StringEnvironmentVariableConfig,
} from './types';

import { EnvironmentError } from './error';
import { EnvironmentErrorType, EnvironmentVariableType } from './types';

const DEFAULT_VALID_TRUE_VALUES = ['true', '1', 'yes', 'y'];
const DEFAULT_VALID_FALSE_VALUES = ['false', '0', 'no', 'n'];

export class Environment<Config extends EnvironmentConfig> {
  /**
   * Construct a result from a parser
   *
   * @param parser The parser to use
   * @param key The key of the environment variable
   * @param cfg The configuration of the environment variable
   * @param raw The raw value of the environment variable
   * @returns A result with the value of the environment variable, or an error
   */
  private static constructResult<T, Cfg extends EnvironmentVariableConfig>(
    parser: (raw: string, cgf: Cfg) => Result<T, string>,
    key: string,
    cfg: Cfg,
    raw: string,
  ): Result<T, EnvironmentError> {
    return parser(raw, cfg).mapErr((err) =>
      new EnvironmentError(
        EnvironmentErrorType.VariableParseError,
        key,
        cfg,
        raw,
      ).withMessage(`Error parsing env var ${key}: ${err}`),
    );
  }

  constructor(
    private readonly config: Config,
    private readonly store: { [key: string]: string | undefined } = process.env,
  ) {}

  /**
   * Get an environment variable
   *
   * @param key The key of the environment variable
   * @returns A result with the value of the environment variable, or an error
   */
  public get<K extends keyof Config & string>(
    key: K,
  ): Result<InferEnvironmentType<Config>[K], EnvironmentError> {
    return this.getInner(key);
  }

  /**
   * Get an environment variable, expecting it to be defined
   *
   * @param key The key of the environment variable
   * @param message The message to use if the environment variable is not defined
   * @returns The value of the environment variable
   *
   * @throws {EnvironmentError} If the environment variable is not defined
   */
  public getExpect<K extends keyof Config & string>(
    key: K,
    message?: string,
  ): InferEnvironmentType<Config>[K] {
    const res = this.getInner(key);

    return res
      .mapErr((err) => {
        if (message !== undefined) {
          return err.withMessage(message);
        }

        return err;
      })
      ._unwrap();
  }

  /**
   * Get an environment variable as a string
   *
   * @param key The key of the environment variable
   * @returns The value of the environment variable or undefined
   */
  public getRaw(key: StringKeysOf<Config>): string | undefined {
    return this.store[key];
  }

  /**
   * Set an environment variable
   *
   * @param key The key of the environment variable
   * @param value The value of the environment variable
   */
  public set(key: StringKeysOf<Config>, value: string | undefined): void {
    this.store[key] = value;
  }

  /**
   * Get an object with all the environment variables and their values
   *
   * @returns An object with all the environment variables and their values
   *
   * @throws {EnvironmentError} If an environment variable is not defined
   */
  public snapshot(): InferEnvironmentType<Config> {
    const result: Partial<InferEnvironmentType<Config>> = {};

    for (const key in this.config) {
      if (Object.prototype.hasOwnProperty.call(this.config, key)) {
        result[key] = this.getInner(key)._unwrap();
      }
    }

    return result as InferEnvironmentType<Config>;
  }

  /**
   * Unset an environment variable
   *
   * @param key The key of the environment variable
   */
  public unset(key: StringKeysOf<Config>): void {
    this.set(key, undefined);
  }

  /**
   * Set multiple environment variables and run a function
   * with the new environment then restore the old environment
   *
   * @param vars The environment variables to set
   * @param fn The function to run with the new environment
   * @param args The arguments to pass to the function
   * @returns The result of the function
   */
  public withVars<Args extends any[], Res>(
    vars: {
      [K in StringKeysOf<Config>]: string | undefined;
    },
    fn: (...args: Args) => Res,
    ...args: Args
  ): Res {
    type Keys = StringKeysOf<Config>;

    const old: { [K in Keys]?: string } = {};

    for (const [k, v] of Object.entries(vars) as Array<
      [Keys, string | undefined]
    >) {
      old[k] = this.getRaw(k);
      this.set(k, v);
    }

    const res = fn(...args);

    for (const [k, v] of Object.entries(old) as Array<
      [Keys, string | undefined]
    >) {
      this.set(k, v);
    }

    return res;
  }

  /**
   * Get an environment variable
   *
   * @param key The key of the environment variable
   * @returns A result with the value of the environment variable, or an error
   */
  private getInner<K extends keyof Config & string>(
    key: K,
  ): Result<InferEnvironmentType<Config>[K], EnvironmentError> {
    type Res = InferEnvironmentType<Config>[K];

    const cfg = this.config[key];
    const raw = this.store[key];

    if (cfg === undefined) {
      return err(
        new EnvironmentError(
          EnvironmentErrorType.VariableUnknownError,
          key,
        ).withMessage(
          'The environment variable is not defined in the configuration. Please check the configuration.',
        ),
      );
    }

    if (raw === undefined) {
      if (cfg.default !== undefined) {
        return ok(cfg.default as Res);
      }

      return err(
        new EnvironmentError(
          EnvironmentErrorType.VariableNotFoundError,
          key,
          cfg,
        ),
      );
    }

    switch (cfg.type) {
      case EnvironmentVariableType.String:
        return Environment.constructResult(
          this.parseAsString.bind(this),
          key,
          cfg,
          raw,
        ) as Result<Res, EnvironmentError>;

      case EnvironmentVariableType.Number:
        return Environment.constructResult(
          this.parseAsNumber.bind(this),
          key,
          cfg,
          raw,
        ) as Result<Res, EnvironmentError>;

      case EnvironmentVariableType.Boolean:
        return Environment.constructResult(
          this.parseAsBoolean.bind(this),
          key,
          cfg,
          raw,
        ) as Result<Res, EnvironmentError>;

      case EnvironmentVariableType.Enum:
        return Environment.constructResult(
          this.parseAsEnum.bind(this) as (
            raw: string,
            cfg: Config[K],
          ) => Result<Res, string>,
          key,
          cfg,
          raw,
        );

      case EnvironmentVariableType.Duration:
        return Environment.constructResult(
          this.parseAsDuration.bind(this),
          key,
          cfg,
          raw,
        ) as Result<Res, EnvironmentError>;
    }
  }

  /**
   * Get an environment variable as a boolean
   *
   * @param raw The raw value of the environment variable
   * @param cfg The configuration of the environment variable
   * @returns A result with the value of the environment variable, or an error
   */
  private parseAsBoolean(
    raw: string,
    cfg: BooleanEnvironmentVariableConfig,
  ): Result<boolean, string> {
    const {
      validFalseValues = DEFAULT_VALID_FALSE_VALUES,
      validTrueValues = DEFAULT_VALID_TRUE_VALUES,
    } = cfg;

    if (validTrueValues.includes(raw.toLowerCase())) {
      return ok(true);
    }

    if (validFalseValues.includes(raw.toLowerCase())) {
      return ok(false);
    }

    return err('the value is not a boolean');
  }

  /**
   * Get an environment variable as a duration
   *
   * @param raw The raw value of the environment variable
   * @param cfg The configuration of the environment variable
   * @returns A result with the value of the environment variable, or an error
   */
  private parseAsDuration(
    raw: string,
    cfg: DurationEnvironmentVariableConfig,
  ): Result<Duration, string> {
    return this.parseAsNumber(raw, {
      type: EnvironmentVariableType.Number,
    }).map((num) => Duration.from(num, cfg.unit));
  }

  /**
   * Get an environment variable as an enum
   *
   * @param raw The raw value of the environment variable
   * @param cfg The configuration of the environment variable
   * @returns A result with the value of the environment variable, or an error
   */
  private parseAsEnum<T extends EnumLike>(
    raw: string,
    cfg: EnumEnvironmentVariableConfig<T>,
  ): Result<EnumValue<T>, string> {
    const values = Array.isArray(cfg.enum) ? cfg.enum : Object.values(cfg.enum);

    if (!values.includes(raw)) {
      return err('the value is not in the enum');
    }

    return ok(raw as EnumValue<T>);
  }

  /**
   * Get an environment variable as a number
   *
   * @param raw The raw value of the environment variable
   * @param cfg The configuration of the environment variable
   * @returns A result with the value of the environment variable, or an error
   */
  private parseAsNumber(
    raw: string,
    cfg: NumberEnvironmentVariableConfig,
  ): Result<number, string> {
    const parsed = Number(raw);

    if (isNaN(parsed)) {
      return err('the value is not a number');
    }

    if (cfg.format === 'integer' && !Number.isInteger(parsed)) {
      return err('the value is not an integer');
    }

    if (cfg.min !== undefined && parsed < cfg.min) {
      return err('the value is less than the minimum');
    }

    if (cfg.max !== undefined && parsed > cfg.max) {
      return err('the value is greater than the maximum');
    }

    return ok(parsed);
  }

  /**
   * Get an environment variable as a string
   *
   * @param raw The raw value of the environment variable
   * @param cfg The configuration of the environment variable
   * @returns A result with the value of the environment variable, or an error
   */
  private parseAsString(
    raw: string,
    cfg: StringEnvironmentVariableConfig,
  ): Result<string, string> {
    if (cfg.pattern !== undefined) {
      const compiled = isString(cfg.pattern)
        ? new RegExp(cfg.pattern)
        : cfg.pattern;

      if (!compiled.test(raw)) {
        return err('the value does not match the pattern');
      }
    } else if (cfg.shouldAllowEmpty !== true && raw.trim() === '') {
      return err('the value is empty');
    }

    return ok(raw);
  }
}
