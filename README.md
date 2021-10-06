# 🕵️‍♀️ careful-downloader

[![CI](https://github.com/jakejarvis/careful-downloader/actions/workflows/ci.yml/badge.svg)](https://github.com/jakejarvis/careful-downloader/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/careful-downloader?logo=npm)](https://www.npmjs.com/package/careful-downloader)
[![MIT License](https://img.shields.io/github/license/jakejarvis/careful-downloader?color=red)](LICENSE)

Downloads a file and its checksums to a temporary directory, validates the hash, and optionally extracts it if safe. A headache-averting wrapper around [`got`](https://github.com/sindresorhus/got), [`sumchecker`](https://github.com/malept/sumchecker), and [`decompress`](https://github.com/kevva/decompress).

## Install

```sh
npm install careful-downloader
# or...
yarn add careful-downloader
```

## Usage

```js
import downloader from "careful-downloader";

await downloader(
  "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_extended_0.88.1_Windows-64bit.zip",
  "https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_0.88.1_checksums.txt",
  {
    destDir: "./vendor",
    algorithm: "sha256",
    encoding: "binary",
    extract: true,
  },
);
//=> '/Users/jake/src/carefully-downloaded/vendor/hugo.exe'
```

## API

### downloader(downloadUrl, checksumUrl, options?)

#### downloadUrl

Type: `string`

Absolute URL to the desired file to download.

#### checksumUrl

Type: `string`

Absolute URL to a checksums file, usually just a `.txt` containing filenames and hashes [like this](https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_0.88.1_checksums.txt):

```plaintext
27493d1903a41e2dd47edc76a79918d95dfbb31474380d3704322e47ffd11b74  hugo_0.88.1_Windows-32bit.zip
ad81192d188cb584a73074d3dea9350d4609a13ed5fccaafd229b424247e5890  hugo_0.88.1_Windows-64bit.zip
aaa20e258cd668cff66400d365d73ddc375e44487692d49a5285b56330f6e6b2  hugo_extended_0.88.1_Windows-64bit.zip
```

#### options

Type: `object`

##### filename

Type: `string`\
Default: Extracted from the download URL.

Manually set the filename of the download, helpful if the one provided by the server doesn't match the filename listed in the checksum file.

##### extract

Type: `boolean`\
Default: `false`

Use [`decompress`](https://github.com/kevva/decompress) to extract the final download to the destination directory (assuming it's a `.zip`, `.tar`, `.tar.gz`, etc.).

##### tempDir

Type: `string`\
Default: [`tempy.directory()`](https://github.com/sindresorhus/tempy#tempydirectoryoptions)

Path to temporary directory for unverified and/or unextracted downloads. Automatically generated if not set (recommended). If set manually, the directory isn't purged upon finishing for security reasons.

##### destDir

Type: `string`\
Default: `"./downloads"`

Full path or directory name relative to module to store the validated download.

##### cleanDestDir

Type: `boolean`\
Default: `false`

Delete any existing files in the destination directory before downloading.

##### algorithm

Type: `string`\
Default: `"sha256"`

The algorithm used by the checksum file. Available options are dependent on the version of OpenSSL on the platform. Examples are 'SHA1', 'SHA256', 'SHA512', 'MD5', etc.

On recent releases of OpenSSL, `openssl list -digest-algorithms` will display the available digest algorithms. [Read more about `crypto.createHash()`.](https://nodejs.org/dist/latest-v14.x/docs/api/crypto.html#crypto_crypto_createhash_algorithm_options)

##### encoding

Type: `string`\
Default: `"binary"`

Tell the file stream to read the download as a binary, UTF-8 text file, base64, etc.

## License

MIT
