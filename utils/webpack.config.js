"use strict";
const BASE_PATH = "../";

const path = require("path");
const webpack = require("webpack");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const glob = require('glob');

const getEntries = () => {
    return glob.sync("../src/js/pages/*.js").reduce(
        (entries, entry) => {
            const matchForRename = /^\.\.\/src\/js\/pages\/([\w\d_]+)\.js$/g.exec(entry);

            if (matchForRename !== null && typeof matchForRename[1] !== 'undefined') {
                entries[matchForRename[1]] = entry;
            }

            return entries;
        },
        {}
    )
};

let config = {
    mode: "development",
    // mode: "production",
    entry: getEntries(),
    context: __dirname,
    output: {
        path: path.resolve(__dirname, BASE_PATH, "src/js/bundle"),
        filename: "[name].bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new UglifyJsPlugin({
            parallel: true,
            uglifyOptions: {
                mangle: true,
                compress: {
                    sequences: true,
                    dead_code: true,
                    conditionals: true,
                    booleans: true,
                    unused: true,
                    if_return: true,
                    join_vars: true,
                    drop_console: true
                },
                toplevel: true,
                output: {
                    comments: false,
                },
                keep_fnames: false,
            },
        })],
    optimization: {
        splitChunks: {
            chunks: 'initial',
            minSize: 0,
            cacheGroups: {
                chunks: 'async',
                minSize: '30000',
                maxSize: '0',
                minChunks: '1',
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                },
                common: {
                    name: 'common',
                    minChunks: 2,
                    chunks: 'initial',
                    priority: 10,
                    reuseExistingChunk: true,
                    enforce: true
                }
            }
        },
    }
};

module.exports = config;