export interface Options {
  /**
   * Filename of the download, helpful if the one provided by the server doesn't
   * match the name listed in the checksum file.
   *
   * @default Extracted from the download URL.
   */
  readonly filename?: string;

  /**
   * Use decompress to extract the final download to the destination directory.
   *
   * @default false
   */
  readonly extract?: boolean;

  /**
   * Full path or directory name relative to module to store the validated
   * download.
   *
   * @default "./downloads"
   */
  readonly destDir?: string;

  /**
   * Path to temporary directory for unverified and/or unextracted downloads.
   * Automatically generated if not set (recommended).
   *
   * @default `tempy.directory()`
   */
  readonly tempDir?: string;

  /**
   * The algorithm used by the checksum file. Available options are dependent on
   * the version of OpenSSL on the platform. Examples are 'SHA1', 'SHA256',
   * 'SHA512', 'MD5', etc.
   *
   * On recent releases of OpenSSL, `openssl list -digest-algorithms` will
   * display the available digest algorithms:
   *
   * https://nodejs.org/dist/latest-v4.x/docs/api/crypto.html#crypto_crypto_createhash_algorithm
   *
   * @default "sha256"
   */
  readonly algorithm?: string;

  /**
   * Tell the file stream to read the download as a binary, UTF-8 text file,
   * base64, etc.
   *
   * @default "binary"
  */
  readonly encoding?: BufferEncoding;
}

/**
 * Download a file and validate it with its corresponding checksum file.
 */
export default function downloadAndCheck(downloadUrl: string, checksumUrl: string, options: Options): Promise<string>;
