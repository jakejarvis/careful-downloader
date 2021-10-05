import path from "path";
import stream from "stream";
import { promisify } from "util";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import tempy from "tempy";
import got from "got";
import sumchecker from "sumchecker";
import decompress from "decompress";
import urlParse from "url-parse";

// https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c#what-do-i-use-instead-of-__dirname-and-__filename
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function downloader(downloadUrl, checksumUrl, options) {
  // normalize options and set defaults
  options = {
    filename: options.filename ?? urlParse(downloadUrl).pathname.split("/").pop(),
    extract: !!options.extract,
    tempDir: options.tempDir ? path.resolve(__dirname, options.tempDir) : tempy.directory(),
    destDir: options.destDir ? path.resolve(__dirname, options.destDir) : path.resolve(__dirname, "download"),
    cleanDestDir: !!options.cleanDestDir,
    algorithm: options.algorithm ?? "sha256",
    encoding: options.encoding ?? "binary",
  };

  try {
    // simultaneously download the desired file and its checksums
    await Promise.all([
      downloadFile(downloadUrl, path.join(options.tempDir, options.filename)),
      downloadFile(checksumUrl, path.join(options.tempDir, "checksums.txt")),
    ]);

    // validate the checksum of the download
    await checkChecksum(options.tempDir, path.join(options.tempDir, "checksums.txt"), options.filename, options.algorithm, options.encoding);

    // optionally clear the target directory of existing files
    if (options.cleanDestDir) {
      await fs.remove(options.destDir);
    }

    // ensure the target directory exists
    await fs.mkdirp(options.destDir);

    if (options.extract) {
      // decompress download and move resulting files to final destination
      await decompress(path.join(options.tempDir, options.filename), options.destDir);
      return options.destDir;
    } else {
      // move verified download to final destination as-is
      await fs.copy(path.join(options.tempDir, options.filename), path.join(options.destDir, options.filename));
      return path.join(options.destDir, options.filename);
    }
  } finally {
    // delete temporary directory
    await fs.remove(options.tempDir);
  }
}

// Download any file to any destination. Returns a promise.
async function downloadFile(url, dest) {
  const pipeline = promisify(stream.pipeline);

  return await pipeline(
    got.stream(url, { followRedirect: true }), // GitHub releases redirect to unpredictable URLs
    fs.createWriteStream(dest),
  );
}

// Check da checksum.
async function checkChecksum(baseDir, checksumFile, downloadFile, algorithm, encoding) {
  const checker = new sumchecker.ChecksumValidator(algorithm, checksumFile, {
    defaultTextEncoding: encoding,
  });

  return await checker.validate(baseDir, downloadFile);
}
