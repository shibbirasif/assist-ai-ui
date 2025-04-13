// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom', // Important for fetch and DOM stuff
        setupFiles: './vitest.setup.ts',
    },
});
