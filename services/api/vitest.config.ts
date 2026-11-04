import { defineConfig } from 'vitest/config';

// Load prompt .md files as plain strings, matching the esbuild `text` loader used in CDK.
export default defineConfig({
  plugins: [
    {
      name: 'markdown-as-text',
      transform(code, id) {
        if (id.endsWith('.md')) return { code: `export default ${JSON.stringify(code)};`, map: null };
      },
    },
  ],
});
