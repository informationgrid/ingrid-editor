var webpack = require( 'webpack' );
var CopyWebpackPlugin = require( 'copy-webpack-plugin' );
var helpers = require( './../helpers' );

module.exports = {
    devtool: 'inline-source-map',

    resolve: {
        extensions: ['', '.ts', '.js']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader']
            },
            {
                test: /\.html$/,
                loader: 'html'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'null'
            },
            {
                test: /\.css$/,
                exclude: helpers.root('src', 'app'),
                loader: 'null'
            },
            {
                test: /\.css$/,
                include: helpers.root('src', 'app'),
                loader: 'raw'
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
