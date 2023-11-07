const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");
const PATHS = require("./paths");

const files = ["serviceWorker", "popup", "contentScript", "offscreen"];

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: files.reduce((res, file) => {
      res[file] = `${PATHS.src}/${file}.ts`;
      return res;
    }, {}),
    devtool: argv.mode === "production" ? false : "source-map",
  });

module.exports = config;
