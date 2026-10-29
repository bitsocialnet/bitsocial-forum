import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));
const devServerHmr = (() => {
  if (!process.env.PORTLESS_URL) {
    return { overlay: false };
  }

  try {
    const url = new URL(process.env.PORTLESS_URL);
    const isHttps = url.protocol === 'https:';

    return {
      overlay: false,
      protocol: isHttps ? 'wss' : 'ws',
      host: url.hostname,
      clientPort: Number(url.port || (isHttps ? 443 : 80)),
    };
  } catch {
    return { overlay: false };
  }
})();

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  css: {
    postcss: {
      plugins: [tailwindcss({ config: fileURLToPath(new URL('./tailwind.config.ts', import.meta.url)) }), autoprefixer()],
    },
  },
  resolve: {
    alias: {
      // bitsocial-react-hooks imports zustand/shallow's deprecated default export and
      // passes it as a store equality fn, so its console.warn fires on every comparator
      // call. Redirect to an unwrapped re-export (see the shim for details).
      'zustand/shallow': `${srcDir}/lib/zustand-shallow-shim.ts`,
      'node-fetch': 'isomorphic-fetch',
      assert: 'assert',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      buffer: 'buffer',
      events: 'events',
      process: 'process',
      'node:buffer': 'buffer',
      'node:crypto': 'crypto-browserify',
      'node:events': 'events',
      'node:process': 'process',
      'node:stream': 'stream-browserify',
      'node:util': 'util/',
      'util/': 'util/',
      util: 'util/',
    },
  },
  server: {
    port: 3000,
    open: !process.env.PORTLESS_URL,
    hmr: devServerHmr,
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
    sourcemap: process.env.GENERATE_SOURCEMAP === 'true',
    target: 'esnext',
  },
  // Hash routing plus relative asset URLs let the same build run from forum.bitsocial.net, an IPFS gateway path, or file://.
  base: './',
  optimizeDeps: {
    entries: ['index.html'],
    include: ['assert', 'buffer', 'process', 'util', 'stream-browserify', 'isomorphic-fetch'],
  },
  define: {
    'process.version': JSON.stringify(''),
    global: 'globalThis',
    __dirname: '""',
  },
});
