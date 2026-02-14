import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    dbCredentials: {
        url: '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/7109345f331f5d5b1e274e598673f3b2c9d6a7fbc8405a9a501584f85f8b41e3.sqlite'
    }
});
