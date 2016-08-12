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
                loaders: ['ts?transpileOnly=true,configFileName=tsconfig.webpack.json', 'angular2-template-loader']
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
                loader: 'null'
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin( [
            {from: helpers.root('app/services/behaviour/additionalBehaviours.js'), to: helpers.root('build')}
        ] )
    ]
};
