import fs from 'fs';
import path from 'path';

import type { PackageJson, PackageJsonField } from './package-json';

const copiedFields = [
  'name',
  'version',
  'description',
  'keywords',
  'bugs',
  'license',
  'author',
  'contributors',
  'repository',
  'dependencies',
  'peerDependencies',
] as const;

type CopiedField = (typeof copiedFields)[number] & PackageJsonField;

function createPackageJson(pkg: PackageJson): Pick<PackageJson, CopiedField> & {
  main: string;
  types: string;
} {
  const packageJson: Record<string, unknown> & {
    main: string;
    types: string;
  } = {
    main: './index.js',
    types: './index.d.ts',
  };

  for (const field of copiedFields) {
    if (field in pkg) {
      packageJson[field] = pkg[field as CopiedField];
    }
  }

  return packageJson as Pick<PackageJson, CopiedField> & {
    main: string;
    types: string;
  };
}

const filesToCopy = [
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'VERSION',
  '.npmignore',
];

function main() {
  const root = path.resolve(process.cwd());
  const packagePath = path.resolve(root, 'package.json');

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8')) as PackageJson;

  const packageJson = createPackageJson(pkg);
  const packageJsonString = JSON.stringify(packageJson, null, 2);

  fs.writeFileSync(path.resolve(root, 'dist/package.json'), packageJsonString);

  for (const file of filesToCopy) {
    const source = path.resolve(root, file);

    if (fs.existsSync(source)) {
      fs.copyFileSync(source, path.resolve(root, 'dist', file));
    }
  }
}

main();
