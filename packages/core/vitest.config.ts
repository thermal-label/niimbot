import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['src/**/*.ts'],
      exclude: [
        'scripts/**',
        'src/*.generated.ts',
        'src/types.ts',
        'src/__tests__/**',
        'src/index.ts',
        'data/**',
        'dist/**',
      ],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 85,
      },
    },
  },
});
