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
  outExtension: ({ format }) =>
    format === 'cjs' ? { js: '.cjs' } : { js: '.js' },
  external: [...Object.keys(pkg.dependencies ?? {}), ...builtinModules],
})
