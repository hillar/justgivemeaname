// Rollup plugins.
import buble from 'rollup-plugin-buble'
import cjs from 'rollup-plugin-commonjs'
import globals from 'rollup-plugin-node-globals'
import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'
import serve from './rollup-plugin-serve-proxy' // naive proxy
import livereload from 'rollup-plugin-livereload'

export default {
  input: 'src/index.js',
  output: {
    file: 'html/app.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    buble(),
    cjs({
      exclude: 'node_modules/process-es6/**',
      include: [
        'node_modules/create-react-class/**',
        'node_modules/fbjs/**',
        'node_modules/object-assign/**',
        'node_modules/react/**',
        'node_modules/react-dom/**',
        'node_modules/prop-types/**'
      ]
    }),
    globals(),
    replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
    resolve({
      browser: true,
      main: true
    }),
    serve({contentBase:'html',proxy:{'/':'http://localhost:4444/'}}),
    livereload('html')
  ]
}
