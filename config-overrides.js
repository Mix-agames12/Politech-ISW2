const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer"),
    "vm": require.resolve("vm-browserify") // Agregar este polyfill
  };
  
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    })
  ]);

  return config;
};
