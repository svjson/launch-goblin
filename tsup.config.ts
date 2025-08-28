import { defineConfig } from 'tsup'
import { builtinModules } from 'module'
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
  outExtension: ({ format }) =>
    format === 'cjs' ? { js: '.cjs' } : { js: '.js' },
  external: [...Object.keys(pkg.dependencies ?? {}), ...builtinModules],
})
