/**
 * @file Defines an Environment class for handling environment variables and their configurations
 * @author Rowan Gudmundsson
 * @since 1.0.0
 */
import {
  Duration,
  type EnumLike,
  type EnumValue,
  Result,
  err,
  isString,
  ok,
} from '@ellefe/ts-core';

import { EnvironmentError } from './error';
import {
  type BooleanEnvironmentVariableConfig,
  type DurationEnvironmentVariableConfig,
  type EnumEnvironmentVariableConfig,
  type EnvironmentConfig,
  EnvironmentErrorType,
  type EnvironmentVariableConfig,
  EnvironmentVariableType,
  type InferEnvironmentType,
  type NumberEnvironmentVariableConfig,
  type StringEnvironmentVariableConfig,
} from './types';

const DEFAULT_VALID_TRUE_VALUES = ['true', '1', 'yes', 'y'];
const DEFAULT_VALID_FALSE_VALUES = ['false', '0', 'no', 'n'];

/**
 * An environment
 */
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
  private static ConstructResult<T, Cfg extends EnvironmentVariableConfig>(
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
    private readonly store: Record<string, string | undefined> = process.env,
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
   * Set an environment variable
   *
   * @param key The key of the environment variable
   * @param value The value of the environment variable
   */
  public set<K extends keyof Config & string>(
    key: K,
    value: string | undefined,
  ): void {
    this.store[key] = value;
  }

  /**
   * Unset an environment variable
   *
   * @param key The key of the environment variable
   */
  public unset<K extends keyof Config & string>(key: K): void {
    this.set(key, undefined);
  }

  /**
   * Set multiple environment variables and run a function
   * with the new environment then restore the old environment
   *
   * @param vars The environment variables to set
   * @param fn The function to run with the new environment
   * @param {...any} args The arguments to pass to the function
   * @returns The result of the function
   */
  public withVars<Keys extends keyof Config & string, Args extends any[], Res>(
    vars: Record<Keys, string | undefined>,
    fn: (...args: Args) => Res,
    ...args: Args
  ): Res {
    const old: Partial<Record<Keys, string>> = {};

    for (const [k, v] of Object.entries(vars)) {
      old[k as Keys] = this.store[k as Keys];
      this.set(k as Keys, v as string | undefined);
    }

    const res = fn(...args);

    for (const [k, v] of Object.entries(old)) {
      this.set(k as Keys, v as string | undefined);
    }

    return res;
  }

  /**
   * Get an environment variable, expecting it to be defined
   *
   * @param key The key of the environment variable
   * @returns The value of the environment variable
   *
   * @throws {EnvironmentError} If the environment variable is not defined
   */
  public getExpect<K extends keyof Config & string>(
    key: K,
  ): InferEnvironmentType<Config>[K] {
    return this.getInner(key)._unwrap();
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
        return Environment.ConstructResult(
          this.parseAsString.bind(this),
          key,
          cfg,
          raw,
        ) as Result<Res, EnvironmentError>;

      case EnvironmentVariableType.Number:
        return Environment.ConstructResult(
          this.parseAsNumber.bind(this),
          key,
          cfg,
          raw,
        ) as Result<Res, EnvironmentError>;

      case EnvironmentVariableType.Boolean:
        return Environment.ConstructResult(
          this.parseAsBoolean.bind(this),
          key,
          cfg,
          raw,
        ) as Result<Res, EnvironmentError>;

      case EnvironmentVariableType.Enum:
        return Environment.ConstructResult(
          this.parseAsEnum.bind(this) as (
            raw: string,
            cfg: Config[K],
          ) => Result<Res, string>,
          key,
          cfg,
          raw,
        );

      case EnvironmentVariableType.Duration:
        return Environment.ConstructResult(
          this.parseAsDuration.bind(this),
          key,
          cfg,
          raw,
        ) as Result<Res, EnvironmentError>;
    }
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
    } else if (cfg.allowEmpty !== true && raw.trim() === '') {
      return err('the value is empty');
    }

    return ok(raw);
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
   * Get an environment variable as a boolean
   *
   * @param raw The raw value of the environment variable
   * @param _cfg The configuration of the environment variable
   * @returns A result with the value of the environment variable, or an error
   */
  private parseAsBoolean(
    raw: string,
    cfg: BooleanEnvironmentVariableConfig,
  ): Result<boolean, string> {
    const {
      validTrueValues = DEFAULT_VALID_TRUE_VALUES,
      validFalseValues = DEFAULT_VALID_FALSE_VALUES,
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
}
