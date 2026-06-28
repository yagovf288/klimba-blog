import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
    react()
  ],
  env: {
    schema: {
      VITE_SUPABASE_URL: envField.string({ context: 'server', access: 'secret' }),
      VITE_SUPABASE_ANON_KEY: envField.string({ context: 'server', access: 'secret' }),
      GEMINI_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
    }
  }
});
