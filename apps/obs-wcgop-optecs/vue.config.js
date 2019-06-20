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
  publicPath: '/obs-trips/'
  // Not sure if this will work in our prod environment:
  // publicPath: process.env.NODE_ENV === 'production'
  //   ? '/obs-trips/'
  //   : '/'
};
