var webpack = require( 'webpack' );
var helpers = require( './../helpers' );
var autoprefixer = require( 'autoprefixer' );
var ExtractTextPlugin = require( "extract-text-webpack-plugin" );
var HtmlWebpackPlugin = require( 'html-webpack-plugin' );

/*
 * Config
 * with default values at webpack.default.conf
 */
module.exports = {
  // our angular app
  entry: {
    'vendor': './app/vendor.ts',
    'main': './app/main.ts'
  },

  resolve: {
    extensions: [ '.ts', '.js', '.css', '.scss' ]
  },

  module: {
    loaders: [
      // Support for .ts files.
      {
        test: /\.ts$/,
        loader: 'ts-loader?transpileOnly=true,configFileName=tsconfig.webpack.json',
        // 'awesome-typescript-loader',
        exclude: [ /\.(spec|e2e)\.ts$/, helpers.root( 'node_modules' ) ]
      },

      // copy those assets to output
      {test: /\.(png|jpe?g|gif|ico)$/, loader: 'file-loader?name=[path][name].[ext]?[hash]'},
      {test: /\.woff2(\?\S*)?$/, loader: "url-loader?limit=10000&minetype=application/font-woff2"},
      {test: /\.woff(\?\S*)?$/, loader: "url-loader?limit=10000&minetype=application/font-woff"},
      {test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=[path][name].[ext]?[hash]'},

      // Support for *.json files.
      {test: /\.json$/, loader: 'json-loader', exclude: [ helpers.root( 'node_modules' ) ]},

      // Support for CSS as raw text
      // use 'null' loader in test mode (https://github.com/webpack/null-loader)
      // all css in src/style will be bundled in an external css file
      {
        test: /\.css$/,
        exclude: helpers.root( 'app' ),
        loader: ExtractTextPlugin.extract( { fallbackLoader: 'style-loader', loader: 'css-loader' } )
      },
      // all css required in src/app files will be merged in js files
      {test: /\.css$/, include: helpers.root( 'app' ), loader: 'raw-loader'},

      // SASS
      { test: /\.scss$/, exclude: helpers.root( 'app' ), loaders: ['style-loader', 'css-loader', 'sass-loader' ] },

      { test: /\.scss$/, include: helpers.root( 'app' ), loaders: ['raw-loader', 'sass-loader' ] },

      // support for .html as raw text
      {test: /\.html$/, loader: 'raw-loader', exclude: [ helpers.root( 'index.html' ), helpers.root( 'node_modules' ) ]}

    ]
  },

  plugins: [
    //  the following plugin is needed to avoid a warning when running app
    new webpack.ContextReplacementPlugin(
        /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
        __dirname
    ),
    new ExtractTextPlugin( "styles.css" ),
    new webpack.optimize.CommonsChunkPlugin( {
      name: ['main', 'vendor']
    } ),
    new HtmlWebpackPlugin( {template: 'index.html'} )
  ]
};