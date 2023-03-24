const autoprefixer = require('autoprefixer')
const postcss = require('postcss')
const webpack = require('webpack')
const path = require('path')
const pkg = require('./package.json')
const classPrefix = require('postcss-class-prefix')
const TerserPlugin = require('terser-webpack-plugin')

const banner = pkg.name + ' v' + pkg.version + ' ' + pkg.homepage

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: [
        postcss.plugin('postcss-namespace', function() {
          // Add '.dev-tools .tools ' to every selector.
          return function(root) {
            root.walkRules(function(rule) {
              if (!rule.selectors) return rule

              rule.selectors = rule.selectors.map(function(
                selector
              ) {
                return '.dev-tools .tools ' + selector
              })
            })
          }
        }),
        classPrefix('eruda-', {
          ignore: [/luna-*/]
        }),
        autoprefixer
      ]
    }
  }
}

module.exports = (env, argv) => {
  const config = {
    devtool: 'source-map',
    entry: './src/index.js',
    resolve: {
      mainFields: ['main', 'module']
    },
    devServer: {
      static: {
        directory: path.join(__dirname, './')
      },
      port: 8080
    },
    output: {
      path: __dirname,
      filename: 'eruda-monitor.js',
      publicPath: '/assets/',
      library: ['erudaMonitor'],
      libraryTarget: 'umd'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              sourceType: 'unambiguous',
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-transform-runtime']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            'css-loader',
            postcssLoader,
          ]
        },
        {
          test: /\.scss$/,
          use: [
            'css-loader',
            postcssLoader,
            'sass-loader'
          ]
        }
      ]
    },
    plugins: [new webpack.BannerPlugin(banner)]
  }

  if (argv.mode === 'production') {
    config.optimization = {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false
            }
          },
          extractComments: false
        })
      ]
    }
  }

  return config
}
