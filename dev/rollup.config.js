import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import cjs from "rollup-plugin-cjs-es";

export default [{
  //input: 'src/server/index.mjs',
  input: 'src/server/index.mjs',
  output: {
    file: '../prod/index.mjs',
    format: 'es'
  },
  plugins: [

    nodeResolve({
      jsnext: true,
      main: true
    }),

    commonjs({
      extensions: [ '.js' ],
      sourceMap: false,

    }),
    /*
    cjs({
      nested: true
    }),
    */
    cleanup({
      comments : 'all',
      }
    )
  ]
}];
