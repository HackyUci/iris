const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isDevelopment = process.env.NODE_ENV !== "production";

require('dotenv').config({ path: '../../.env' });

module.exports = {
  target: "web",
  mode: isDevelopment ? "development" : "production",
  entry: "./src/index.tsx",
  devtool: isDevelopment ? "source-map" : false,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx"],
    fallback: {
      assert: require.resolve("assert/"),
      buffer: require.resolve("buffer/"),
      events: require.resolve("events/"),
      stream: require.resolve("stream-browserify/"),
      util: require.resolve("util/"),
      crypto: require.resolve("crypto-browserify"),
      vm: require.resolve("vm-browserify"),
    },
  },
  output: {
    filename: "index.js",
    path: path.join(__dirname, "dist"),
  },
  module: {
    rules: [
      { test: /\.(ts|tsx|jsx)$/, loader: "ts-loader" },
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          "css-loader",
          "postcss-loader"
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "index.html"),
    }),
    new webpack.DefinePlugin({
      'process.env.CANISTER_ID_IRIS_BACKEND': JSON.stringify(process.env.CANISTER_ID_IRIS_BACKEND),
      'process.env.CANISTER_ID_IRIS_FRONTEND': JSON.stringify(process.env.CANISTER_ID_IRIS_FRONTEND),
      'process.env.CANISTER_ID_INTERNET_IDENTITY': JSON.stringify(process.env.CANISTER_ID_INTERNET_IDENTITY),
      'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK || 'local'),
    }),
    new webpack.ProvidePlugin({
      Buffer: [require.resolve("buffer/"), "Buffer"],
      process: require.resolve("process/browser"),
      crypto: "crypto-browserify",
    }),
  ],
  devServer: {
    port: 8080,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
  },
};