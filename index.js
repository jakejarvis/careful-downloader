import path from "path";
import stream from "stream";
import { promisify } from "util";
import fs from "fs-extra";
import tempy from "tempy";
import got from "got";
import sumchecker from "sumchecker";
import decompress from "decompress";
import urlParse from "url-parse";

export default async function downloader(downloadUrl, checksumUrl, options) {
  // intialize options if none are set
  options = options || {};

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
  if (!options.destDir.startsWith(process.cwd())) {
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
  const pipeline = promisify(stream.pipeline);

  return pipeline(
    got.stream(url, { followRedirect: true }), // GitHub releases redirect to unpredictable URLs
    fs.createWriteStream(dest),
  );
}

// Check da checksum.
async function checkChecksum(baseDir, downloadFile, checksumFile, algorithm, encoding) {
  const checker = new sumchecker.ChecksumValidator(algorithm, path.join(baseDir, checksumFile), {
    defaultTextEncoding: encoding,
  });

  return checker.validate(baseDir, downloadFile);
}
