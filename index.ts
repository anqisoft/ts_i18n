/*
 * Copyright (c) 2024 anqisoft@gmail.com
 * ts_tools_i18n.ts
 * Technology: deno, typescript.
 * i18n: ...<en_us>...</en_us>...<zh_cn>...</zh_cn>...<zh_tw>...</zh_tw>...
 *
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
 *
 * <en_us>
 * Created on Tue Jan 09 2024 11:28:16
 * Function: Provide i18N related functions such as code or Readme.md file.
 * </en_us>
 *
 * <zh_cn>
 * 创建：2024年1月9日 11:28:16
 * 功能：对代码或readme.md文件提供i18n相关拆分、合并、翻译等功能。
 * </zh_cn>
 *
 * <zh_tw>
 * 創建：2024年1月9日 11:28:16
 * 功能：對代碼或readme.md文件提供i18n相關拆分、合併、翻譯等功能。
 * </zh_tw>
 */

/* references:
https://github.com/luhuiguo/chinese-utils/
https://github.com/NLPchina/nlp-lang

https://github.com/uutool/hanzi-convert/
https://github.com/liuyueyi/quick-chinese-transfer
https://github.com/willonboy/ChineseToPinYin

https://github.com/luhuiguo/chinese-utils/blob/master/src/main/resources/simplified.txt

https://www.npmjs.com/package/hanzi-tools 1.2.26 • Public • Published 2 years ago
《汉字工具》是四种工具的集合。 Hanzi Tools is a collection of four different tools.
segment - 分词。 Divide text into words.
pinyinify - 转换汉字为拼音。 Convert Chinese characters to pinyin.
simplify - 转换简体汉字为繁体汉字。 Convert traditional characters to simplified characters.
traditionalize - 转换繁体汉字为简体汉字。 Convert simplified characters to traditional characters.
tag - 词性标注。 Part-of-speech tagging.

https://www.cnblogs.com/livelab/p/14111142.html

https://github.com/YuChunTsao/Translate
google translate. zh-TW to en
<script>
    function googleTranslateElementInit() {
        new google.translate.TranslateElement({
            pageLanguage: GOOGLE_TRANSLATE_LANG_EN,
            includedLanguages: GOOGLE_TRANSLATE_LANG_TW,
            autoDisplay: false
        }, 'google_translate_element');
        var a = document.querySelector("#google_translate_element select");
        a.selectedIndex=1;
        a.dispatchEvent(new Event('change'));
    }
</script>

<script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
*/

import { Builder, By, Element, Key, until } from 'npm:selenium-webdriver';
import * as chrome from 'npm:selenium-webdriver/chrome.js';

const TRANSLATE_MAX_CHAR_COUNT_PER_TIME = 5000;

import {
	assert,
	COMMAND_LINE_ARGS,
	copyFileSync,
	existsSync,
	FILE_CREATE_NEW_AND_MODE_ALL,
	FILE_MODE_ALL,
	getFilenameTimestampPostfix,
	HTML_TAG_BEGIN__EN_US,
	HTML_TAG_BEGIN__ZH_CN,
	HTML_TAG_BEGIN__ZH_TW,
	// exitProcess,
	// I18nable,
	// I18nFlag,
	// I18N_LANG_ARRAY,
	// type I18N_LANG_KIND,

	HTML_TAG_END__EN_US,
	HTML_TAG_END__ZH_CN,
	HTML_TAG_END__ZH_TW,
	I18N_HTML_BEGIN_TAG_LENGTH,
	joinPath,
	LF,
	mkdirSync,
	readTextFileSync,
	SEP,
	SEPARATOR_OF_SPLIT,
	statSync,
	writeTextFileSync,
	// readDirSync,

	// } from "../ts_utils/index.ts";
} from 'https://raw.githubusercontent.com/anqisoft/ts_utils/main/index.ts';

import { showHelpOrVersionOrCallbackAndShowUsedTime } from // from '../ts_command_line_help/index.ts';
'https://raw.githubusercontent.com/anqisoft/ts_command_line_help/main/index.ts';

const GOOGLE_TRANSLATE_LANG_CN = 'zh-CN';
const GOOGLE_TRANSLATE_LANG_EN = 'en';
const GOOGLE_TRANSLATE_LANG_TW = 'zh-TW';

const CHROME = 'chrome';

const EN_REPLACE_PATCH_FROM = /<en_us\> ([^\n]+) <\/en_us\>/g;
const EN_REPLACE_PATCH_TO = '<en_us\>$1</en_us\>';

// .replaceAll(HTML_TAG_BEGIN__ZH_CN), HTML_TAG_BEGIN__ZH_TW))
// .replaceAll(HTML_TAG_END__ZH_CN), HTML_TAG_END__ZH_TW))
async function translateByGoogleCore(
	from: string,
	langFrom: string,
	langTo: string,
): Promise<string> {
	const URL = `https://translate.google.com/details?sl=${langFrom}&tl=${langTo}`;
	const FROM_CSS = '.er8xn';
	const TO_CSS = '.lRu31';

	const START_TIME = new Date();

	const driver = await new Builder()
		.forBrowser(CHROME)
		.setChromeOptions(new chrome.Options().headless())
		.build();
	try {
		await driver.get(URL);

		// const elementFrom = await driver.findElement(By.css(FROM_CSS));
		let elementFrom = await driver.findElement(By.css(FROM_CSS));

		// 超过指定字符数则分次翻译
		const FROM_LENGTH = from.length;
		// console.log(FROM_LENGTH, TRANSLATE_MAX_CHAR_COUNT_PER_TIME);
		if (FROM_LENGTH <= TRANSLATE_MAX_CHAR_COUNT_PER_TIME) {
			await driver.actions({ bridge: true }).doubleClick(elementFrom).perform();
			await elementFrom.sendKeys(from, Key.RETURN);

			await driver.wait(until.elementLocated(By.css(TO_CSS)), 40000);

			const element = await driver.findElement(By.css(TO_CSS));
			const result = await element.getText();
			return result;
		} else {
			const RESULTS: string[] = [];
			let remaining = from;
			let remainingLength = FROM_LENGTH;
			const END_TAG = `</${
				langFrom === GOOGLE_TRANSLATE_LANG_EN
					? 'en_us'
					: langFrom.replaceAll('-', '_').toLowerCase()
			}>`;
			const I18N_HTML_END_TAG_LENGTH = END_TAG.length;

			do {
				let next = '';

				if (remainingLength <= TRANSLATE_MAX_CHAR_COUNT_PER_TIME) {
					// await elementFrom.sendKeys(remaining, Key.RETURN);
					// remaining = '';
					next = remaining;
				} else {
					const END_TAG_POS = remaining.substring(0, TRANSLATE_MAX_CHAR_COUNT_PER_TIME)
						.lastIndexOf(END_TAG);
					if (
						END_TAG_POS > -1 &&
						END_TAG_POS + I18N_HTML_END_TAG_LENGTH <= TRANSLATE_MAX_CHAR_COUNT_PER_TIME
					) {
						next = remaining.substring(0, END_TAG_POS + I18N_HTML_END_TAG_LENGTH);
					} else {
						// TODO(@anqisoft) 自动断句
						let ok = false;
						(langFrom === GOOGLE_TRANSLATE_LANG_EN ? '\n.?! ' : '\n。？！ ').split('').forEach(
							(seg) => {
								if (ok) return;

								const POS = remaining.indexOf(seg);
								if (POS > 0) {
									next = remaining.substring(0, POS);
									ok = true;
								}
							},
						);

						if (!ok) {
							next = remaining.substring(0, TRANSLATE_MAX_CHAR_COUNT_PER_TIME);
						}
					}
				}

				await driver.actions({ bridge: true }).doubleClick(elementFrom).perform();
				// elementFrom.setText('');
				await elementFrom.sendKeys(next, Key.RETURN);
				remaining = remaining.substring(next.length);
				// console.log(`Send ${next}`);
				// 下句不是想要的结果
				// console.log('elementFrom.getText():', await elementFrom.getText());

				await driver.wait(until.elementLocated(By.css(TO_CSS)), 40000);

				const element = await driver.findElement(By.css(TO_CSS));
				const result = await element.getText();
				RESULTS.push(result);

				remainingLength = remaining.length;
				if (remainingLength == 0) {
					break;
				}

				await driver.get(URL);
				elementFrom = await driver.findElement(By.css(FROM_CSS));
				// } while(remainingLength > 0);
			} while (true);

			return RESULTS.join(LF);
		}
	} finally {
		try {
			await driver.quit();
		} catch (e) {
			console.error(e);
		}

		const END_TIME = new Date();
		console.log(END_TIME.getTime() - START_TIME.getTime());
	}
}

async function splitCommentCore(sourceFilename: string, commentFilesPath: string) {
	const fileInfo = statSync(sourceFilename);
	assert(fileInfo.isFile);

	mkdirSync(commentFilesPath, { recursive: true });
	assert(statSync(commentFilesPath).isDirectory);

	const SOURCE_CONTENT = readTextFileSync(sourceFilename);
	// ...<en_us>...</en_us>...<zh_cn>...</zh_cn>...<zh_tw>...</zh_tw>...

	const SPLIT_LEVEL_ONE = SOURCE_CONTENT.split(HTML_TAG_BEGIN__EN_US);
	// remove the first one.
	SPLIT_LEVEL_ONE.shift();

	const US_COMMENTS: string[] = [];
	const CN_COMMENTS: string[] = [];
	const TW_COMMENTS: string[] = [];
	SPLIT_LEVEL_ONE.forEach((seg, index) => {
		// removed <en_us>
		// ...</en_us>...<zh_cn>...</zh_cn>...<zh_tw>...</zh_tw>...
		const EN_US_END_POS = seg.indexOf('</en_us>');
		assert(EN_US_END_POS > -1, `${index}: EN_US_END_POS not right.\n${seg}`);

		const ZH_CN_START_POS = seg.indexOf('<zh_cn>');
		assert(ZH_CN_START_POS > EN_US_END_POS, `${index}: ZH_CN_START_POS not right.\n${seg}`);

		const ZH_CN_END_POS = seg.indexOf('</zh_cn>');
		assert(ZH_CN_END_POS > ZH_CN_START_POS, `${index}: ZH_CN_END_POS not right.\n${seg}`);

		const ZH_TW_START_POS = seg.indexOf('<zh_tw>');
		assert(ZH_TW_START_POS > ZH_CN_END_POS, `${index}: ZH_TW_START_POS not right.\n${seg}`);

		const ZH_TW_END_POS = seg.indexOf('</zh_tw>');
		assert(ZH_TW_END_POS > ZH_TW_START_POS, `${index}: ZH_TW_END_POS not right.\n${seg}`);

		const EN_US_COMMENT = seg.substring(0, EN_US_END_POS);
		const ZH_CN_COMMENT = seg.substring(
			ZH_CN_START_POS + I18N_HTML_BEGIN_TAG_LENGTH,
			ZH_CN_END_POS,
		);
		const ZH_TW_COMMENT = seg.substring(
			ZH_TW_START_POS + I18N_HTML_BEGIN_TAG_LENGTH,
			ZH_TW_END_POS,
		);

		US_COMMENTS.push(`<en_us>${EN_US_COMMENT}</en_us>`);
		CN_COMMENTS.push(`<zh_cn>${ZH_CN_COMMENT}</zh_cn>`);
		TW_COMMENTS.push(`<zh_tw>${ZH_TW_COMMENT}</zh_tw>`);
	});

	const GOAL_PATH = joinPath(
		commentFilesPath,
		sourceFilename.split(SEP).pop() as string,
		SEP,
	);
	mkdirSync(GOAL_PATH, { recursive: true });

	const CN_BEFORE_TRANSLATE = CN_COMMENTS.join(LF);
	const EN_BEFORE_TRANSLATE = CN_BEFORE_TRANSLATE; // .replaceAll(HTML_TAG_BEGIN__ZH_CN, HTML_TAG_BEGIN__EN_US)
	// .replaceAll(HTML_TAG_END__ZH_CN), HTML_TAG_END__EN_US))
	const TW_BEFORE_TRANSLATE = CN_BEFORE_TRANSLATE
		.replaceAll(HTML_TAG_BEGIN__ZH_CN, HTML_TAG_BEGIN__ZH_TW)
		.replaceAll(HTML_TAG_END__ZH_CN, HTML_TAG_END__ZH_TW);

	const DATA = [
		['en_us', US_COMMENTS],
		['zh_cn', CN_COMMENTS],
		['zh_tw', TW_COMMENTS],
	];

	for (let index = 0; index < 3; ++index) {
		const langAndData = DATA[index];
		// DATA.forEach((langAndData, index) => {
		const LANG = langAndData[0] as string;
		const FILE_CONTENT = (langAndData[1] as string[]).join(LF);
		writeTextFileSync(
			joinPath(GOAL_PATH, `${LANG}.original.txt`),
			FILE_CONTENT,
			FILE_MODE_ALL,
		);

		const OTHER_FILENAME = joinPath(GOAL_PATH, `${LANG}.txt`);
		if (!existsSync(OTHER_FILENAME)) {
			switch (index) {
				case 0:
					// writeTextFileSync(
					// 	OTHER_FILENAME,
					// 	EN_BEFORE_TRANSLATE,
					// 	FILE_CREATE_NEW_AND_MODE_ALL,
					// );
					// console.log(EN_BEFORE_TRANSLATE);
					writeTextFileSync(
						OTHER_FILENAME,
						(await translateByGoogleCore(
							EN_BEFORE_TRANSLATE,
							GOOGLE_TRANSLATE_LANG_CN,
							GOOGLE_TRANSLATE_LANG_EN,
						))
							.replaceAll(
								HTML_TAG_BEGIN__ZH_CN,
								HTML_TAG_BEGIN__EN_US,
							)
							.replaceAll(
								HTML_TAG_END__ZH_CN,
								HTML_TAG_END__EN_US,
							)
							.replace(
								EN_REPLACE_PATCH_FROM,
								EN_REPLACE_PATCH_TO,
							),
						FILE_CREATE_NEW_AND_MODE_ALL,
					);
					break;
				case 1:
					writeTextFileSync(
						OTHER_FILENAME,
						FILE_CONTENT,
						FILE_CREATE_NEW_AND_MODE_ALL,
					);
					break;
				case 2:
					// writeTextFileSync(
					// 	OTHER_FILENAME,
					// 	cn2tw(CN_COMMENTS.join(LF)),
					// 	FILE_CREATE_NEW_AND_MODE_ALL,
					// );

					// writeTextFileSync(
					// 	OTHER_FILENAME,
					// 	TW_BEFORE_TRANSLATE,
					// 	FILE_CREATE_NEW_AND_MODE_ALL,
					// );

					writeTextFileSync(
						OTHER_FILENAME,
						await translateByGoogleCore(
							TW_BEFORE_TRANSLATE,
							GOOGLE_TRANSLATE_LANG_CN,
							GOOGLE_TRANSLATE_LANG_TW,
						),
						FILE_CREATE_NEW_AND_MODE_ALL,
					);
					break;
				default:
					break;
			}
		}
		// });
	}
}

export async function splitComments(
	sourceFilename: string,
	commentFilesPath: string,
): Promise<boolean> {
	try {
		await splitCommentCore(sourceFilename, commentFilesPath);
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
}

function getSplitResultFromGoalFileByLang(dir: string, lang: string): string[] {
	const ARRAY = readTextFileSync(joinPath(dir, `${lang}.txt`))
		.substring(I18N_HTML_BEGIN_TAG_LENGTH).replace(
			new RegExp(`</${lang}>[\r\n]+<${lang}>`, 'g'),
			SEPARATOR_OF_SPLIT,
		)
		.split(SEPARATOR_OF_SPLIT);

	const MAX_INDEX = ARRAY.length - 1;
	ARRAY[MAX_INDEX] = ARRAY[MAX_INDEX].replace(`</${lang}>`, '');
	return ARRAY;
}

export function joinComments(sourceFilename: string, commentFilesPath: string): boolean {
	try {
		const fileInfo = statSync(sourceFilename);
		assert(fileInfo.isFile);

		assert(statSync(commentFilesPath).isDirectory);

		const SOURCE_CONTENT = readTextFileSync(sourceFilename);
		const BAK_FILENAME = sourceFilename.concat(getFilenameTimestampPostfix(), '.bak');
		if (!existsSync(BAK_FILENAME)) {
			writeTextFileSync(BAK_FILENAME, SOURCE_CONTENT);
		}

		const GOAL_PATH = joinPath(
			commentFilesPath,
			sourceFilename.split(SEP).pop() as string,
			SEP,
		);
		const US_COMMENTS: string[] = getSplitResultFromGoalFileByLang(GOAL_PATH, 'en_us');
		const CN_COMMENTS: string[] = getSplitResultFromGoalFileByLang(GOAL_PATH, 'zh_cn');
		const TW_COMMENTS: string[] = getSplitResultFromGoalFileByLang(GOAL_PATH, 'zh_tw');

		const CODES_ARRAY = SOURCE_CONTENT.replace(
			/((\<|\<\/)(en_us|zh_cn|zh_tw)\>)/g,
			SEPARATOR_OF_SPLIT,
		)
			.split(SEPARATOR_OF_SPLIT);

		const COUNT = US_COMMENTS.length;
		console.log(CN_COMMENTS.length, TW_COMMENTS.length, COUNT);
		assert(COUNT === CN_COMMENTS.length && COUNT === TW_COMMENTS.length);

		console.log(
			'SOURCE_CONTENT\n',
			SOURCE_CONTENT,
			'\n',
			'CODES_ARRAY\n',
			CODES_ARRAY,
			'\n',
			'US_COMMENTS\n',
			US_COMMENTS,
			'\n',
			'CN_COMMENTS\n',
			CN_COMMENTS,
			'\n',
			'TW_COMMENTS\n',
			TW_COMMENTS,
			'\n',
			'COUNT',
			COUNT,
			'\n',
		);

		for (let i = 0; i < COUNT; ++i) {
			const OFFSET = 6 * i;
			CODES_ARRAY[OFFSET + 1] = `<en_us>${US_COMMENTS[i]}</en_us>`;
			CODES_ARRAY[OFFSET + 3] = `<zh_cn>${CN_COMMENTS[i]}</zh_cn>`;
			CODES_ARRAY[OFFSET + 5] = `<zh_tw>${TW_COMMENTS[i]}</zh_tw>`;
		}
		console.log(
			'CODES_ARRAY\n',
			CODES_ARRAY,
			'\n\n\n\n\n',
			'[END RESULT]\n',
			CODES_ARRAY.join(''),
			'\n',
		);

		writeTextFileSync(sourceFilename, CODES_ARRAY.join(''));
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
}

async function cn2trilingualCore(sourceFilename: string) {
	const SEG_COUNT_PER_ITEM = 6;

	// console.log('sourceFilename', sourceFilename);
	const fileInfo = statSync(sourceFilename);
	assert(fileInfo.isFile);

	const SOURCE_CONTENT = readTextFileSync(sourceFilename);
	const BAK_FILENAME = sourceFilename.concat(getFilenameTimestampPostfix(), '.bak');
	if (!existsSync(BAK_FILENAME)) {
		writeTextFileSync(BAK_FILENAME, SOURCE_CONTENT);
	}

	const US_COMMENTS: string[] = [];
	const CN_COMMENTS: string[] = [];
	const TW_COMMENTS: string[] = [];

	const CODES_ARRAY = SOURCE_CONTENT
		.replace(/((\<|\<\/)(en_us|zh_cn|zh_tw)\>)/g, SEPARATOR_OF_SPLIT)
		.split(SEPARATOR_OF_SPLIT);
	const LAST_ITEM_START_INDEX = CODES_ARRAY.length - SEG_COUNT_PER_ITEM;
	for (let i = 0; i < LAST_ITEM_START_INDEX; i += SEG_COUNT_PER_ITEM) {
		// US_COMMENTS.push(`<en_us>${CODES_ARRAY[i + 1]}</en_us>`);
		CN_COMMENTS.push(`<zh_cn>${CODES_ARRAY[i + 3]}</zh_cn>`);
		// TW_COMMENTS.push(`<zh_tw>${CODES_ARRAY[i + 5]}</zh_tw>`);
	}
	// console.log('CN_COMMENTS.length', CN_COMMENTS.length);

	const CN_BEFORE_TRANSLATE = CN_COMMENTS.join(LF);
	// console.log('CN_BEFORE_TRANSLATE.length', CN_BEFORE_TRANSLATE.length);
	// console.log('CN_BEFORE_TRANSLATE', CN_BEFORE_TRANSLATE);
	const EN_BEFORE_TRANSLATE = CN_BEFORE_TRANSLATE; // .replaceAll(HTML_TAG_BEGIN__ZH_CN, HTML_TAG_BEGIN__EN_US)
	// .replaceAll(HTML_TAG_END__ZH_CN), HTML_TAG_END__EN_US))
	const TW_BEFORE_TRANSLATE = CN_BEFORE_TRANSLATE
		.replaceAll(HTML_TAG_BEGIN__ZH_CN, HTML_TAG_BEGIN__ZH_TW)
		.replaceAll(HTML_TAG_END__ZH_CN, HTML_TAG_END__ZH_TW);

	US_COMMENTS.length = 0;
	// CN_COMMENTS.length = 0;
	TW_COMMENTS.length = 0;

	const EN_FULL_CONTENT = (await translateByGoogleCore(
		EN_BEFORE_TRANSLATE,
		GOOGLE_TRANSLATE_LANG_CN,
		GOOGLE_TRANSLATE_LANG_EN,
	)).replaceAll(
		HTML_TAG_BEGIN__ZH_CN,
		HTML_TAG_BEGIN__EN_US,
	)
		.replaceAll(
			HTML_TAG_END__ZH_CN,
			HTML_TAG_END__EN_US,
		)
		.replace(EN_REPLACE_PATCH_FROM, EN_REPLACE_PATCH_TO);

	EN_FULL_CONTENT
		.substring(I18N_HTML_BEGIN_TAG_LENGTH, EN_FULL_CONTENT.length - I18N_HTML_BEGIN_TAG_LENGTH - 1)
		.replace(/<\/en_us>\n<en_us>/g, SEPARATOR_OF_SPLIT)
		.split(SEPARATOR_OF_SPLIT).forEach((item) => US_COMMENTS.push(item));
	// console.log('EN_FULL_CONTENT', EN_FULL_CONTENT);

	const TW_FULL_CONTENT = await translateByGoogleCore(
		TW_BEFORE_TRANSLATE,
		GOOGLE_TRANSLATE_LANG_CN,
		GOOGLE_TRANSLATE_LANG_TW,
	);
	// console.log('TW_FULL_CONTENT', TW_FULL_CONTENT);
	TW_FULL_CONTENT
		.substring(I18N_HTML_BEGIN_TAG_LENGTH, TW_FULL_CONTENT.length - I18N_HTML_BEGIN_TAG_LENGTH - 1)
		.replace(/<\/zh_tw>\n<zh_tw>/g, SEPARATOR_OF_SPLIT)
		.split(SEPARATOR_OF_SPLIT).forEach((item) => TW_COMMENTS.push(item));

	// console.log('US_COMMENTS.length', US_COMMENTS.length);
	// console.log('TW_COMMENTS.length', TW_COMMENTS.length);
	const COUNT = US_COMMENTS.length;
	for (let i = 0; i < COUNT; ++i) {
		const OFFSET = SEG_COUNT_PER_ITEM * i;
		CODES_ARRAY[OFFSET + 1] = `<en_us>${US_COMMENTS[i]}</en_us>`;
		// CODES_ARRAY[OFFSET + 3] = `<zh_cn>${CN_COMMENTS[i]}</zh_cn>`;
		CODES_ARRAY[OFFSET + 3] = `${CN_COMMENTS[i]}`;
		CODES_ARRAY[OFFSET + 5] = `<zh_tw>${TW_COMMENTS[i]}</zh_tw>`;
	}

	writeTextFileSync(sourceFilename, CODES_ARRAY.join(''));
}

export async function cn2trilingual(sourceFilenames: string[]): Promise<boolean> {
	const COUNT = sourceFilenames.length;
	for (let i = 0; i < COUNT; ++i) {
		const SOURCE_FILENAME = sourceFilenames[i];
		try {
			await cn2trilingualCore(SOURCE_FILENAME);
		} catch (e) {
			console.error(SOURCE_FILENAME, e);
			return false;
		}
	}
	return true;
}

function removeLangSeg(source: string, lang: string): string {
	// console.log(`[\\r\\n]+(([\\#]+[\\ \\t]+)|([\\ \\t]*\\/\\/[\\ \\t]*)|([\\ \\t]*\\*[\\ \\t]*))<${lang}>`);
	/*
		/[\r\n]+(([\#]+[\ \t]+)|([\ \t]*\/\/[\ \t]*)|([\ \t]*\*[\ \t]*))<en_us>/g
		/[\r\n]+(([\#]+[\ \t]+)|([\ \t]*\/\/[\ \t]*)|([\ \t]*\*[\ \t]*))<zh_cn>/g
		/[\r\n]+(([\#]+[\ \t]+)|([\ \t]*\/\/[\ \t]*)|([\ \t]*\*[\ \t]*))<zh_tw>/g
	*/

	// return source
	// .replace(new RegExp(`[\\r\\n]+(([\\#]+[\\ \\t]+)|([\\ \\t]*\\/\\/[\\ \\t]*)|([\\ \\t]*\\*[\\ \\t]*))<${lang}>`, 'g'), `<${lang}>`)

	// .replace(new RegExp(`</${lang}>`, 'g'), '\0'.concat(`</${lang}>`))
	// .replace(new RegExp(`<${lang}[^\0]+\0<\/${lang}>`, 'g'), '')
	// ;

	return source
		.replace(
			new RegExp(
				`[\\r\\n]+(([\\#]+[\\ \\t]+)|([\\ \\t]*\\/\\/[\\ \\t]*)|([\\ \\t]*\\*[\\ \\t]*))<${lang}>`,
				'g',
			),
			`<${lang}>`,
		)
		.replace(new RegExp(`</${lang}>`, 'g'), '\0'.concat(`</${lang}>`))
		.replace(new RegExp(`<${lang}[^\0]+\0<\/${lang}>`, 'g'), '');
}

function keepByLang(source: string, lang: string, keepLangTag: boolean): string {
	let result = source;

	switch (lang) {
		case 'en_us':
			break;
		case 'zh_cn':
			result = result
				.replace(
					new RegExp(
						`([\\r\\n]+(([\\#]+[\\ \\t]+)|([\\ \\t]*\\/\\/[\\ \\t]*)|([\\ \\t]*\\*[\\ \\t]*)))<en_us>[^\r\n]+</en_us><${lang}>`,
						'g',
					),
					`$1<${lang}>`,
				);
			break;
		case 'zh_tw':
			result = result
				.replace(
					new RegExp(
						`([\\r\\n]+(([\\#]+[\\ \\t]+)|([\\ \\t]*\\/\\/[\\ \\t]*)|([\\ \\t]*\\*[\\ \\t]*)))<en_us>[^\r\n]+</en_us><zh_cn>[^\r\n]+</zh_cn><${lang}>`,
						'g',
					),
					`$1<${lang}>`,
				);
			break;
		default:
			break;
	}

	['en_us', 'zh_cn', 'zh_tw'].filter((one) => one !== lang).forEach((removeLang) => {
		result = removeLangSeg(result, removeLang);
	});

	if (!keepLangTag) {
		result = result.replace(new RegExp(`(<|</)${lang}>`, 'g'), '');
	}

	return result;
}

export function splitReadmeFiles(keepLangTag: boolean, sourceFilenames: string[]): boolean {
	const COUNT = sourceFilenames.length;
	for (let i = 0; i < COUNT; ++i) {
		const SOURCE_FILENAME = sourceFilenames[i];
		try {
			const SOURCE_CONTENT = readTextFileSync(SOURCE_FILENAME);

			// console.log('SOURCE_CONTENT', SOURCE_CONTENT);
			// console.log('en_us', removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'zh_cn'), 'zh_tw'));
			// console.log('zh_cn', removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'en_us'), 'zh_tw'));
			// console.log('zh_tw', removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'en_us'), 'zh_cn'));

			const GOAL_FILENAME_PREFIX = SOURCE_FILENAME.substring(
				0,
				SOURCE_FILENAME.toLowerCase().lastIndexOf('readme.md'),
			);

			// writeTextFileSync(GOAL_FILENAME_PREFIX.concat('README.en_us.md'), removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'zh_cn'), 'zh_tw'));
			// writeTextFileSync(GOAL_FILENAME_PREFIX.concat('README.zh_cn.md'), removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'en_us'), 'zh_tw'));
			// writeTextFileSync(GOAL_FILENAME_PREFIX.concat('README.zh_tw.md'), removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'en_us'), 'zh_cn'));

			['en_us', 'zh_cn', 'zh_tw'].forEach((lang) => {
				writeTextFileSync(
					GOAL_FILENAME_PREFIX.concat(`README.${lang}.md`),
					keepByLang(SOURCE_CONTENT, lang, keepLangTag),
				);
			});
		} catch (e) {
			console.error(SOURCE_FILENAME, e);
			return false;
		}
	}
	return true;
}

export function splitFiles(keepLangTag: boolean, sourceFilenames: string[]): boolean {
	const COUNT = sourceFilenames.length;
	for (let i = 0; i < COUNT; ++i) {
		const SOURCE_FILENAME = sourceFilenames[i];
		try {
			const SOURCE_FILENAME_SPLIT_RESULT = SOURCE_FILENAME.split(SEP);

			const FILENAME = SOURCE_FILENAME_SPLIT_RESULT.pop() as string;
			const GOAL_PATH = joinPath(
				SOURCE_FILENAME_SPLIT_RESULT.join(SEP),
				'i18n',
			);

			const splitFile = () => {
				const SOURCE_CONTENT = readTextFileSync(SOURCE_FILENAME);
				[
					['en_us', removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'zh_cn'), 'zh_tw')],
					['zh_cn', removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'en_us'), 'zh_tw')],
					['zh_tw', removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'en_us'), 'zh_cn')],
				].forEach(([lang, content]) => {
					const PATH = joinPath(GOAL_PATH, lang);
					mkdirSync(PATH, { recursive: true });
					writeTextFileSync(joinPath(PATH, FILENAME), content);
				});
			};

			switch (FILENAME.split('.').pop()?.toLowerCase()) {
				case 'md':
				case 'xml':
				case 'ini':
				case 'txt':
				case 'log':
				case 'sass':
				case 'scss':
				case 'less':
				case 'css':
				case 'html':
				case 'htm':
				case 'h':
				case 'cs':
				case 'bas':
				case 'php':
				case 'py':
				case 'rs':
				case 'java':
				case 'bat':
				case 'ps1':
				case 'js':
				case 'ts':
					splitFile();
					break;
				default:
					['en_us', 'zh_cn', 'zh_tw'].forEach((lang) => {
						const PATH = joinPath(GOAL_PATH, lang);
						mkdirSync(PATH, { recursive: true });
						copyFileSync(SOURCE_FILENAME, joinPath(PATH, FILENAME));
					});
					break;
			}
		} catch (e) {
			console.error(SOURCE_FILENAME, e);
			return false;
		}
	}
	return true;
}

// console.log('before showHelpOrVersionOrCallbackAndShowUsedTime()');
showHelpOrVersionOrCallbackAndShowUsedTime(
	{
		en_us:
			'This tool is used to assist in internationalization operations of code or README.md and other files, such as splitting, merging, and translating.',
		zh_cn: '本工具用于辅助代码或README.md等文件的国际化操作，如拆分、合并、翻译等。',
		zh_tw: '本工具用於輔助程式碼或README.md等檔案的國際化操作，如分割、合併、翻譯等。',
	},
	'0.0.1',
	2,
	async () => {
		const [command, source, ...others] = COMMAND_LINE_ARGS;
		// console.log('call me', command, source);
		switch (command) {
			case 'splitComments':
				console.log(await splitComments(source, others[0]));
				break;
			case 'joinComments':
				console.log(joinComments(source, others[0]));
				break;
			case 'cn2trilingual':
				console.log(await cn2trilingual([source, ...others]));
				break;
			case 'splitReadmeFiles':
				console.log(splitReadmeFiles(source === 'true', [...others]));
				break;
			case 'splitFiles':
				console.log(splitFiles(source === 'true', [...others]));
				break;
			default:
				break;
		}
	},
);
// console.log('after showHelpOrVersionOrCallbackAndShowUsedTime()');
