const { readFileSync, existsSync, mkdirSync } = require("fs");
const { resolve } = require("path");
const AdmZip = require("adm-zip");

const distDir = resolve(__dirname, "dist");
const outDir = resolve(__dirname, "release");

try {
  const { version, name } = JSON.parse(readFileSync(resolve(distDir, "manifest.json"), "utf8"));

  const filename = `${name.toLowerCase()}-chrome-extension-v${version}.zip`;
  const zip = new AdmZip();
  zip.addLocalFolder(distDir);
  if (!existsSync(outDir)) {
    mkdirSync(outDir);
  }
  zip.writeZip(`${outDir}/${filename}`);

  console.log(
    `Success! Created a ${filename} file under ${outDir} directory. You can upload this file to web store.`,
  );
} catch (e) {
  console.error("Error! Failed to generate a zip file.");
}
