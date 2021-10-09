/* eslint-env mocha */
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { expect } from "chai";

import downloader from "../index.js";

// https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c#what-do-i-use-instead-of-__dirname-and-__filename
const __dirname = path.dirname(fileURLToPath(import.meta.url));

it("verified checksum, hugo.exe was extracted", async function () {
  this.timeout(30000); // increase timeout to an excessive 30 seconds for CI

  await downloader(
    "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_extended_0.88.1_Windows-64bit.zip",
    "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_0.88.1_checksums.txt",
    {
      destDir: path.join(__dirname, "temp"),
      algorithm: "sha256",
      encoding: "binary",
      extract: true,
    },
  );

  expect(fs.existsSync(path.join(__dirname, "temp", "hugo.exe"))).to.be.true;

  // clean up
  fs.removeSync(path.join(__dirname, "temp"));
});

it("incorrect checksum, not extracted", async function () {
  this.timeout(30000); // increase timeout to an excessive 30 seconds for CI

  expect(async () => downloader(
      // download mismatching versions to trigger error
      "https://github.com/gohugoio/hugo/releases/download/v0.88.0/hugo_0.88.0_Windows-64bit.zip",
      "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_0.88.1_checksums.txt",
      {
        destDir: path.join(__dirname, "temp"),
        algorithm: "sha256",
        encoding: "binary",
        extract: false,
      },
  )).to.throw;

  expect(fs.existsSync(path.join(__dirname, "temp", "hugo.exe"))).to.be.false;

  // clean up
  fs.removeSync(path.join(__dirname, "temp"));
});

it("destDir located outside of module, throw error", async function () {
  this.timeout(30000); // increase timeout to an excessive 30 seconds for CI

  expect(async () => downloader(
      "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_0.88.1_Windows-64bit.zip",
      "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_0.88.1_checksums.txt",
      {
        destDir: "../vendor", // invalid path
      },
  )).to.throw;
});

it("zero options, download zip and leave it alone", async function () {
  this.timeout(30000); // increase timeout to an excessive 30 seconds for CI

  await downloader(
    "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_extended_0.88.1_Windows-64bit.zip",
    "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_0.88.1_checksums.txt",
  );

  expect(fs.existsSync(path.join(__dirname, "../downloads", "hugo_extended_0.88.1_Windows-64bit.zip"))).to.be.true;

  // clean up
  fs.removeSync(path.join(__dirname, "../downloads"));
});
