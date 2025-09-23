import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import pkg from './package.json'

export default defineConfig({
  plugins: [tsconfigPaths()],
  define: {
    __LG_VERSION__: JSON.stringify(pkg.version),
  },
})
