import tsconfigPaths from 'vitest-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

const excludedFilesFromTesting: string[] = [
  ...configDefaults.exclude,
  '**/electron/*',
  '**/node_modules/*',
  '**/dist/*',
  '**/.{idea,git,cache,output,temp,angular}/**',
  'src/environments/**',
];

export default defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    coverage: {
      reporter: ['html'],
      exclude: excludedFilesFromTesting,
      enabled: true,
    },
    include: ['src/app/helpers/**/*.spec.ts'],
    exclude: excludedFilesFromTesting,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
  },
});
