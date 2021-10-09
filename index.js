import path from "path";
import stream from "stream";
import { promisify } from "util";
import fs from "fs-extra";
import tempy from "tempy";
import got from "got";
import sumchecker from "sumchecker";
import decompress from "decompress";
import urlParse from "url-parse";
import isPathInCwd from "is-path-in-cwd";

export default async function downloader(downloadUrl, checksumUrl, options = {}) {
  // normalize options and set defaults
  options = {
    filename: options.filename || urlParse(downloadUrl).pathname.split("/").pop(),
    extract: !!options.extract,
    destDir: options.destDir ? path.resolve(process.cwd(), options.destDir) : path.resolve(process.cwd(), "downloads"),
    cleanDestDir: !!options.cleanDestDir,
    algorithm: options.algorithm || "sha256",
    encoding: options.encoding || "binary",
  };

  // throw an error if destDir is outside of the module to prevent path traversal for security reasons
  if (!isPathInCwd(options.destDir)) {
    throw new Error(`destDir must be located within '${process.cwd()}', it's currently set to '${options.destDir}'.`);
  }

  // initialize temporary directory
  const tempDir = tempy.directory();

  try {
    // simultaneously download the desired file and its checksums
    await Promise.all([
      downloadFile(downloadUrl, path.join(tempDir, options.filename)),
      downloadFile(checksumUrl, path.join(tempDir, "checksums.txt")),
    ]);

    // validate the checksum of the download
    if (await checkChecksum(tempDir, options.filename, "checksums.txt", options.algorithm, options.encoding)) {
      // optionally clear the target directory of existing files
      if (options.cleanDestDir && fs.existsSync(options.destDir)) {
        await fs.remove(options.destDir);
      }

      // ensure the target directory exists
      await fs.mkdirp(options.destDir);

      if (options.extract) {
        // decompress download and move resulting files to final destination
        await decompress(path.join(tempDir, options.filename), options.destDir);
        return options.destDir;
      } else {
        // move verified download to final destination as-is
        await fs.copy(path.join(tempDir, options.filename), path.join(options.destDir, options.filename));
        return path.join(options.destDir, options.filename);
      }
    } else {
      throw new Error(`Invalid checksum for ${options.filename}.`);
    }
  } finally {
    // delete temporary directory
    await fs.remove(tempDir);
  }
}

// Download any file to any destination. Returns a promise.
async function downloadFile(url, dest) {
  // get remote file and write locally
  const pipeline = promisify(stream.pipeline);
  const download = await pipeline(
    got.stream(url, { followRedirect: true }), // GitHub releases redirect to unpredictable URLs
    fs.createWriteStream(dest),
  );

  return download;
}

// Check da checksum.
async function checkChecksum(baseDir, downloadFile, checksumFile, algorithm, encoding) {
  // instantiate checksum validator
  const checker = new sumchecker.ChecksumValidator(algorithm, path.join(baseDir, checksumFile), {
    defaultTextEncoding: encoding,
  });

  // finally test the file
  const valid = await checker.validate(baseDir, downloadFile);

  return valid;
}

// eslint-disable-next-line no-unused-vars
async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
