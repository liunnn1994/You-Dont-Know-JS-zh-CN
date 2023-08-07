const { writeFileSync } = require("node:fs");
const { resolve } = require("node:path");
const prettier = require("prettier");
const pkgJson = require("../package.json");

// 最大小版本号
const MAX_SUB_VERSION = 20;
// 起始版本号
const DEFAULT_VERSION = "1.0.0";

module.exports = async function generateAndSaveNewVersion() {
  let newVersion;
  const [numericIdentifiers, nonNumericIdentifiers] =
    pkgJson.version.split("-");
  if (numericIdentifiers === "0.0.0") {
    newVersion = DEFAULT_VERSION;
  } else {
    const [major, minor, patch] = numericIdentifiers.split(".").map(Number);

    let nextPatch = patch + 1;
    let nextMinor = minor;
    let nextMajor = major;

    if (nextPatch > MAX_SUB_VERSION) {
      nextPatch = 0;
      nextMinor++;
    }
    if (nextMinor > MAX_SUB_VERSION) {
      nextPatch = 0;
      nextMinor = 0;
      nextMajor++;
    }
    newVersion = `${nextMajor}.${nextMinor}.${nextPatch}`;
  }
  if (nonNumericIdentifiers) {
    newVersion += `-${nonNumericIdentifiers}`;
  }
  pkgJson.version = newVersion;

  writeFileSync(
    resolve(process.cwd(), "package.json"),
    await prettier.format(JSON.stringify(pkgJson), { parser: "json" }),
    "utf-8",
  );
  return newVersion;
};
