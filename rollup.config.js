import terser from '@rollup/plugin-terser'
import typescript from 'rollup-plugin-typescript2'

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/index.ts',
  output: [
    {
      file: `dist/lib/index.js`,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: `dist/es/index.js`,
      format: 'esm',
      sourcemap: true,
    }
  ],
  external: ['tslib'],
  plugins: [
    typescript({
      sourcemap: true,
    }),
    terser()
  ]
}