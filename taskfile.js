module.exports = {
  *rollup(task) {
    yield task.source('index.js')
      .rollup({
        rollup: {
          plugins: [
            require('rollup-plugin-node-resolve')({
              jsnext: true
            }),
            require('rollup-plugin-commonjs')()
          ]
        },
        bundle: {
          format: 'iife'
        }
      })
      .target('dist');
  },
  *default(task) {
    yield task.parallel(['rollup']);
  }
};
