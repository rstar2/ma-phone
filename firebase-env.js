#!/usr/bin/env node

/* eslint-disable no-console */

const fs = require("node:fs");
const path = require("node:path");

const readline = require("readline");

const dotenvFunctions = path.resolve(__dirname, "functions/.env");

/**
 * Read the "dotenv" file and 
 * @param {string} path
 * @return {Promise<Map<string, string>>}
 */
const readFile = (path) => {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(path),
    });

    const envs = new Map();
    rl.on("line", (line) => {
      line = line.trim();
      // skip empty and comment lines
      if (!line || line.startsWith("#")) return;
      const tokens = line.split("=");

      if (tokens.length !== 2) {
        console.warn("Cannot parse env variable from line:", line);
        return;
      }
      envs.set(tokens[0].trim(), tokens[1].trim());
    });
    rl.on("close", () => resolve(envs));
    rl.on("error", (error) => reject(error));
  });
};

/**
 * Output the environment "map" into a file
 * https://firebase.google.com/docs/functions/config-env?gen=2nd#env-variables
 * @param {Map<string, string>} envs
 */
const setEnvs = (envs) => {
  let dotenv = "# Auto-generated file - don't add it to Version Control System";

  envs.forEach((value, key) => (dotenv += `\n${key}=${value}`));

  // it will replace it if already exists
  fs.writeFileSync(dotenvFunctions, dotenv);
};

Promise.all(
  [".env", ".env.local", ".env.production.local"]
    .map((name) => path.join(__dirname, name))
    .filter(fs.existsSync)
    .map(readFile)
)
  .then((envsArr) => {
    // allow overwriting of env variable when present in more than on file
    // so that the last one to be set
    return envsArr.reduce((all, envs) => {
      envs.forEach((value, key) => all.set(key, value));
      return all;
    }, new Map());
  })
  .then(setEnvs);
