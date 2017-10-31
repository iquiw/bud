import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'index.js',
  plugins: [ commonjs(), resolve() ],
  output: {
    file: 'dist/index.js',
    format: 'iife',
    sourcemap: true
  }
};
