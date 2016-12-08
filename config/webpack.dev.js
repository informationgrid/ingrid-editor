var webpackMerge = require( 'webpack-merge' );
var ExtractTextPlugin = require( 'extract-text-webpack-plugin' );
var CopyWebpackPlugin = require( 'copy-webpack-plugin' );
var commonConfig = require( './webpack.common.js' );
var helpers = require( './../helpers' );

module.exports = webpackMerge( commonConfig, {
    devtool: 'cheap-module-eval-source-map',

    output: {
        path: helpers.root( 'dist' ),
        publicPath: 'http://localhost:3000/',
        filename: '[name].bundle.js',
        sourceMapFilename: '[name].map',
        chunkFilename: '[id].chunk.js'
    },

    plugins: [
        new ExtractTextPlugin( '[name].css' ),
        new CopyWebpackPlugin( [
            {from: helpers.root('app/behaviours/additionalBehaviours.js'), to: helpers.root('build')}
        ] )
    ],

    devServer: {
        contentBase: './app',
        port: 3000,
        historyApiFallback: true,
        stats: 'minimal',
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    }
} );