import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.tsx'],
  format: 'esm',
  sourcemap: true,
  dts: true,
  clean: true,
})
