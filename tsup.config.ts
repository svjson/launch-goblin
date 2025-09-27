import { defineConfig } from 'tsup'
import pkg from './package.json'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: true,
  splitting: false,
  clean: true,
  target: 'node20',
  shims: false,
  define: {
    __LG_VERSION__: JSON.stringify(pkg.version),
  },
  onSuccess: 'tsc --noEmit',
  outExtension: ({ format }) =>
    format === 'cjs' ? { js: '.cjs' } : { js: '.js' },
  external: [/^(?!@src)([^./].*)/],
})
