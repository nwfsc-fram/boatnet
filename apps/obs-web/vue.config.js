module.exports = {
  devServer: {
    proxy: 'https://localhost:9000'
  },
  pluginOptions: {
    quasar: {
      treeShake: true
    }
  },
  transpileDependencies: [/[\\\/]node_modules[\\\/]quasar[\\\/]/],
  publicPath: process.env.NODE_ENV === 'production' ? '/observer-web/' : '/'
};
