const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const webpack = require('webpack');

module.exports = {
    mode: "development",
    entry: {
        "index.html": "./src/main",
        "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
        "json.worker": "monaco-editor/esm/vs/language/json/json.worker",
        "css.worker": "monaco-editor/esm/vs/language/css/css.worker",
        "html.worker": "monaco-editor/esm/vs/language/html/html.worker",
        "ts.worker": "monaco-editor/esm/vs/language/typescript/ts.worker",
    },
    devServer: {
        contentBase: "./src",
        historyApiFallback: true,
    },
    plugins: [
      new CleanWebpackPlugin(["dist"]),
      new HtmlWebpackPlugin({
        template: "./src/index.html"
      }),
    ],
    output: {
        globalObject: 'self',
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: [
                "style-loader",
                "css-loader",
                "sass-loader"
            ]
        }, {
            test: /\.css$/,
            use: [
                "style-loader",
                "css-loader"
            ]
        }, {
            test: /\.(png|svg|jpg|gif)$/,
            use: [
                "file-loader"
            ]
        }]
    }
};
