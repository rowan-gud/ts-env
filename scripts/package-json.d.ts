import pkg from '../package.json';

export type PackageJson = typeof pkg;
export type PackageJsonField = keyof PackageJson;
