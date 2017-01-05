var webpack = require( 'webpack' );
var CopyWebpackPlugin = require( 'copy-webpack-plugin' );
var helpers = require( './../helpers' );

module.exports = {
    devtool: 'inline-source-map',

    resolve: {
        extensions: ['.ts', '.js']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts-loader?transpileOnly=true,configFileName=tsconfig.webpack.json'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'null-loader'
            },
            {
                test: /\.css$/,
                exclude: helpers.root('app'),
                loader: 'null-loader'
            },
            {
                test: /\.css$/,
                include: helpers.root('app'),
                loader: 'raw-loader'
            },
            // Support for *.json files.
            {test: /\.json$/, loader: 'json-loader', exclude: [ helpers.root( 'node_modules' ) ]}
        ]
    },
    plugins: [
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            __dirname
        ),
        new CopyWebpackPlugin( [
            {from: helpers.root('app/+behaviours/additionalBehaviours.js'), to: helpers.root('build')}
        ] )
    ]
};
