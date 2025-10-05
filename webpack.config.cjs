const path = require('path');

module.exports = {
  entry: './src/index.ts',
  
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.webpack.json'
          }
        },
        exclude: /node_modules/,
      },
    ],
  },
  
  resolve: {
    extensions: ['.ts', '.js'],
    extensionAlias: {
      '.js': ['.js', '.ts'],
    },
  },
  
  output: {
    filename: 'story-grammar.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'StoryGrammar',
    libraryTarget: 'umd',
    globalObject: 'this',
    clean: false,
  },
  
  externals: {
    // Don't bundle Node.js built-ins
  },
  
  target: 'web',
  
  optimization: {
    minimize: true,
  },
  
  devtool: 'source-map',
  
  // Additional configuration for different environments
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  
  stats: {
    errorDetails: true,
  },
};