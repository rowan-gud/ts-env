export default {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  importOrder: ['<THIRD_PARTY_MODULES>', '^(@)(/.*)$', '^\\.\\.', '^\\.'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
