import tsconfigPaths from 'vitest-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    include: ['src/app/helpers/**/*.spec.ts'],
    environment: 'jsdom',
  },
});
