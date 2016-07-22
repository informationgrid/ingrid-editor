var webpackConfig = require('./webpack.test');

module.exports = function (config) {
    var _config = {
        basePath: '',

        frameworks: ['jasmine'],

        files: [
            {pattern: './config/karma-test-shim.js', watched: false}
        ],

        preprocessors: {
            './config/karma-test-shim.js': ['webpack', 'sourcemap']
        },

        webpack: webpackConfig,

        webpackMiddleware: {
            stats: 'errors-only'
        },

        webpackServer: {
            noInfo: true
        },

        plugins: ['karma-jasmine', 'karma-phantomjs-launcher', 'karma-junit-reporter', 'karma-webpack', 'karma-sourcemap-loader'],

        reporters: ['progress', 'junit'],

        junitReporter: {
            outputFile: 'reports/test-results-karma.xml',
            suite: ''
        },

        port: 9875,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: true
    };

    config.set(_config);
};
