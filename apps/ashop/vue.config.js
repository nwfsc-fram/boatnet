module.exports = {
  devServer: {
    proxy: 'https://localhost:9000'
  },
  pluginOptions: {
    quasar: {
      treeShake: true
    }
  },
  transpileDependencies: [
    /[\\\/]node_modules[\\\/]quasar[\\\/]/
  ]
}
