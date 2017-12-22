const path = require('path');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const rxPaths = require('rxjs/_esm5/path-mapping');
const nodeExternals = require('webpack-node-externals');

const { NoEmitOnErrorsPlugin, NamedModulesPlugin } = require('webpack');
const { NamedLazyChunksWebpackPlugin } = require('@angular/cli/plugins/webpack');
const { CommonsChunkPlugin } = require('webpack').optimize;
const { AngularCompilerPlugin } = require('@ngtools/webpack');

module.exports = {
  "resolve": {
    "extensions": [
      ".ts",
      ".js"
    ],
    "modules": [
      "./node_modules",
      "./node_modules"
    ],
    "symlinks": true,
    "alias": rxPaths(),
    "mainFields": [
      "browser",
      "module",
      "main"
    ]
  },
  "resolveLoader": {
    "modules": [
      "./node_modules",
      "./node_modules"
    ],
    "alias": rxPaths()
  },
  "entry": {
    "pack-bkg": [
      "./src\\profiles\\pack-bkg.ts"
    ],
    "pack-lgv": [
      "./src\\profiles\\pack-lgv.ts"
    ]
  },
  "output": {
    "path": path.join(process.cwd(), "dist"),
    "filename": "[name].bundle.js",
    "chunkFilename": "[id].chunk.js",
    "crossOriginLoading": false
  },
  "module": {
    "rules": [
      {
        "test": /\.ts$/,
        "loader": "@ngtools/webpack"
      }
    ]
  },
  "plugins": [
    new NoEmitOnErrorsPlugin(),
    new ProgressPlugin(),
    new CircularDependencyPlugin({
      "exclude": /(\\|\/)node_modules(\\|\/)/,
      "failOnError": false,
      "onDetected": false,
      "cwd": "C:\\Users\\Andre\\WebstormProjects\\ige-ng-cli"
    }),
    new NamedLazyChunksWebpackPlugin(),

    // use this to move the webpack stuff out of the bundles
    /*new CommonsChunkPlugin({
      "name": [
        "inline"
      ],
      "minChunks": Infinity
    }),*/
    new NamedModulesPlugin({}),
    new AngularCompilerPlugin({
      "mainPath": "main.ts",
      "platform": 0,
      "hostReplacementPaths": {
        "environments\\environment.ts": "environments\\environment.ts"
      },
      "sourceMap": true,
      "tsConfigPath": "src\\tsconfig.app.json",
      "skipCodeGeneration": true,
      "compilerOptions": {}
    })
  ],
  externals: [
    nodeExternals(),
    function(context, request, callback) {
      console.log("external: ", request);
      if (/codelist/.test(request)){
        return callback(null, 'commonjs ' + request);
      }
      callback();
    }
  ]
};
