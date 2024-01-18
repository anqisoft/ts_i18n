### <en_us>Introduction</en_us><zh_cn>介绍</zh_cn><zh_tw>介紹</zh_tw>
#### <en_us></en_us>

#### <zh_cn>对代码或readme.md文件提供i18n相关拆分、合并、翻译等功能。</zh_cn>

#### <zh_tw></zh_tw>

 * Functions:
 *   splitComments(sourceFilename: string, commentFilesPath: string): boolean
 *   joinComments(sourceFilename: string, commentFilesPath: string): boolean
 *   splitReadmeFiles(sourceFilenames: string[]): boolean
 *   splitFiles(sourcePaths: string[]): boolean
 *
 * Usage:
 *   deno run --allow-read --allow-write ts_tools_i18n.ts splitComments ~sourceFilename~ ~commentFilesPath~
 *   deno run --allow-read --allow-write ts_tools_i18n.ts joinComments ~sourceFilename~ ~commentFilesPath~
 *   deno run --allow-read --allow-write ts_tools_i18n.ts splitReadmeFiles ~sourceFilename1~[ ~sourceFilename2~ [...]]
 *   deno run --allow-read --allow-write ts_tools_i18n.ts splitFiles ~sourcePath1~[ ~sourcePath2~ [...]]