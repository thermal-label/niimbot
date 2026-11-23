import mbtech from '@mbtech-nl/eslint-config';

export default [
  ...mbtech,
  {
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    // Emitted by packages/core/scripts/compile-data.mjs. Registry entries
    // still carry the deprecated-but-required contracts `support` field,
    // and the keyed map indexes the device list by position.
    files: ['**/*.generated.ts'],
    rules: {
      '@typescript-eslint/no-deprecated': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/vitest.config.ts',
      '**/scripts/**',
      'docs/api/**',
      'docs/.vitepress/**',
    ],
  },
];
