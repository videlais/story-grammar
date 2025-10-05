const path = require('path');
const baseConfig = require('./webpack.config.cjs');

module.exports = {
  ...baseConfig,
  
  mode: 'development',
  
  output: {
    ...baseConfig.output,
    filename: 'story-grammar.dev.bundle.js',
  },
  
  optimization: {
    minimize: false,
  },
  
  devtool: 'eval-source-map',
  
  stats: {
    ...baseConfig.stats,
    modules: false,
    chunks: false,
  },
};