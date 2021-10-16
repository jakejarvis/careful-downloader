/* eslint-env mocha */
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { expect } from "chai";

import download from "../index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("checksum via downloaded text file", function () {
  it("verified checksum, hugo.exe was extracted", async function () {
    this.timeout(30000); // increase timeout to an excessive 30 seconds for CI

    await download(
      "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_extended_0.88.1_Windows-64bit.zip",
      {
        checksumUrl: "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_0.88.1_checksums.txt",
        destDir: path.join(__dirname, "temp"),
        algorithm: "sha256",
        extract: true,
      },
    );

    expect(fs.existsSync(path.join(__dirname, "temp", "hugo.exe"))).to.be.true;

    // clean up
    fs.removeSync(path.join(__dirname, "temp"));
  });

  it("incorrect checksum file, not extracted", async function () {
    this.timeout(30000); // increase timeout to an excessive 30 seconds for CI

    expect(async () => download(
      // download mismatching versions to trigger error
      "https://github.com/gohugoio/hugo/releases/download/v0.88.0/hugo_0.88.0_Windows-64bit.zip",
      {
        checksumUrl: "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_0.88.1_checksums.txt",
        destDir: path.join(__dirname, "temp"),
        algorithm: "sha256",
        extract: false,
      },
    )).to.throw;

    expect(fs.existsSync(path.join(__dirname, "temp", "hugo.exe"))).to.be.false;

    // clean up
    fs.removeSync(path.join(__dirname, "temp"));
  });

  it("destDir located outside of module, throw error", async function () {
    this.timeout(30000); // increase timeout to an excessive 30 seconds for CI

    expect(async () => download(
      "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_0.88.1_Windows-64bit.zip",
      {
        checksumUrl: "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_0.88.1_checksums.txt",
        destDir: "../vendor", // invalid path
      },
    )).to.throw;
  });

  it("zero options, download zip and leave it alone", async function () {
    this.timeout(30000); // increase timeout to an excessive 30 seconds for CI

    await download(
      "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_extended_0.88.1_Windows-64bit.zip",
      {
        checksumUrl: "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_0.88.1_checksums.txt",
      },
    );

    expect(fs.existsSync(path.join(__dirname, "../downloads", "hugo_extended_0.88.1_Windows-64bit.zip"))).to.be.true;

    // clean up
    fs.removeSync(path.join(__dirname, "../downloads"));
  });
});

describe("checksum via string", function () {
  it("verified checksum, hugo.exe was extracted", async function () {
    this.timeout(30000); // increase timeout to an excessive 30 seconds for CI

    await download(
      "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_extended_0.88.1_Windows-64bit.zip",
      {
        checksumHash: "aaa20e258cd668cff66400d365d73ddc375e44487692d49a5285b56330f6e6b2",
        destDir: path.join(__dirname, "temp"),
        algorithm: "sha256",
        extract: true,
      },
    );

    expect(fs.existsSync(path.join(__dirname, "temp", "hugo.exe"))).to.be.true;

    // clean up
    fs.removeSync(path.join(__dirname, "temp"));
  });

  it("incorrect checksum string, not extracted", async function () {
    this.timeout(30000); // increase timeout to an excessive 30 seconds for CI

    expect(async () => download(
      // download mismatching versions to trigger error
      "https://github.com/gohugoio/hugo/releases/download/v0.88.0/hugo_0.88.0_Windows-64bit.zip",
      {
        checksumHash: "abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234",
        destDir: path.join(__dirname, "temp"),
        algorithm: "sha256",
        extract: false,
      },
    )).to.throw;

    expect(fs.existsSync(path.join(__dirname, "temp", "hugo.exe"))).to.be.false;

    // clean up
    fs.removeSync(path.join(__dirname, "temp"));
  });
});
