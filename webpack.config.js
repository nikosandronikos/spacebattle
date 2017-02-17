/* global __dirname */

var path = require('path');

var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var dir_assets = path.resolve(__dirname, 'assets');
var dir_lib = path.resolve(__dirname, 'lib');
var dir_html = path.resolve(__dirname, 'html');
var dir_src = path.resolve(__dirname, 'src');
var dir_build = path.resolve(__dirname, 'build');

module.exports = {
    entry: path.resolve(dir_src, 'main.js'),
    output: {
        path: dir_build,
        filename: 'spacebattle.js'
    },
    devServer: {
        contentBase: dir_build,
    },
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                test: dir_src,
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: dir_html }, // to: output.path
            { from: dir_lib },
            { from: dir_assets }
        ]),
        // Avoid publishing files when compilation fails
        new webpack.NoErrorsPlugin()
    ],
    stats: {
        // Nice colored output
        colors: true
    },
    // Create Sourcemaps for the bundle
    devtool: 'source-map',
};
