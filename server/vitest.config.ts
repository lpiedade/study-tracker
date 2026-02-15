import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        reporters: ['default', 'junit'],
        outputFile: {
            junit: './reports/junit.xml'
        },
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/migrate-subjects.ts', 'src/index.ts'],
            reporter: [
                'text',
                'text-summary',
                'json',          // coverage-final.json
                'json-summary',  // coverage-summary.json
                'lcov'
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 80,
                statements: 80,
            },
        },
    },
});
