/* eslint-env mocha */
import fs from "fs-extra";
import path from "path";
import tempy from "tempy";
import { expect } from "chai";

import downloader from "../index.js";

it("hugo.exe was downloaded and extracted", async function () {
  this.timeout(30000); // increase timeout to an excessive 30 seconds for CI

  const outDir = path.join(tempy.directory());

  await downloader(
    "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_extended_0.88.1_Windows-64bit.zip",
    "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_0.88.1_checksums.txt",
    {
      destDir: outDir,
      algorithm: "sha256",
      encoding: "binary",
      extract: true,
    },
  );

  expect(fs.existsSync(path.join(outDir, "hugo.exe"))).to.be.true;

  fs.removeSync(outDir);
});

// TODO: FIX THIS
/*
it("incorrect checksum", async () => {
  const outDir = path.join(tempy.directory());

  expect(await downloader(
    "https://github.com/gohugoio/hugo/releases/download/v0.88.0/hugo_0.88.0_NetBSD-ARM.tar.gz",
    "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_0.88.1_checksums.txt",
    {
      destDir: outDir,
      algorithm: "sha256",
      encoding: "binary",
      extract: false,
    },
  )).to.throw(/No checksum/);

//  assert(fs.existsSync(path.join(outDir, "hugo.exe")));

//  fs.removeSync(outDir);
});
*/
