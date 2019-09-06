module.exports = {
  devServer: {
    proxy: 'https://localhost:9000'
  },
  pluginOptions: {
    quasar: {
      treeShake: true
    }
  },
  pwa: {
    appleMobileWebAppCapable: 'yes' ,
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'service-worker.js',
      // skipWaiting: true,
      // clientsClaim: true,
    }
  },
  transpileDependencies: [/[\\\/]node_modules[\\\/]quasar[\\\/]/],
  publicPath: process.env.NODE_ENV === 'production' ? '/observer-trips/' : '/'
};
