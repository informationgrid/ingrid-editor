var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require( 'copy-webpack-plugin' );
var CleanWebpackPlugin = require('clean-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./../helpers');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = webpackMerge(commonConfig, {
    devtool: 'source-map',

    output: {
        path: helpers.root('dist'),
        publicPath: '',
        filename: '[name].bundle.js',
        // sourceMapFilename: '[name].map',
        chunkFilename: '[id].chunk.js'
    },

    plugins: [
        new CleanWebpackPlugin(['dist'], {
            root: helpers.root(''),
            verbose: true
        }),
        new webpack.dependencies.LabeledModulesPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new ExtractTextPlugin('styles.css'),
        new CopyWebpackPlugin( [
            {from: helpers.root('app/behaviours/additionalBehaviours.js'), to: helpers.root('dist/behaviours')}
        ] ),
        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify(ENV)
            }
        })
    ]
});