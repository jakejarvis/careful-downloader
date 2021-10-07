export interface Options {
  /**
   * Manually set the filename of the download, helpful if the one provided by
   * the server doesn't match the filename listed in the checksum file.
   *
   * @default Extracted from the download URL.
   */
  readonly filename?: string;

  /**
   * Use [`decompress`](https://github.com/kevva/decompress) to extract the
   * final download to the destination directory.
   *
   * @default false
   */
  readonly extract?: boolean;

  /**
   * Directory path relative to module where the validated download is saved or
   * extracted. Must be located within `process.cwd()` for security reasons.
   *
   * @default "./downloads"
   */
  readonly destDir?: string;

  /**
   * Delete any existing files in the destination directory before downloading.
   *
   * @default false
   */
  readonly cleanDestDir?: boolean;

  /**
   * The algorithm used by the checksum file. Available options are dependent on
   * the version of OpenSSL on the platform. Examples are 'SHA1', 'SHA256',
   * 'SHA512', 'MD5', etc.
   *
   * On recent releases of OpenSSL, `openssl list -digest-algorithms` will
   * display the available digest algorithms:
   *
   * https://nodejs.org/dist/latest-v14.x/docs/api/crypto.html#crypto_crypto_createhash_algorithm_options
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
export default function downloader(downloadUrl: string, checksumUrl: string, options: Options): Promise<string>;
