/*
 * Copyright (c) 2024 anqisoft@gmail.com
 * ts_i18n/index.ts
 *
 * <en_us>
 * Creation: January 9, 2024 11:28:16
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
	// type I18N_LANG_KIND,

	HTML_TAG_END__EN_US,
	HTML_TAG_END__ZH_CN,
	HTML_TAG_END__ZH_TW,
	I18N_HTML_BEGIN_TAG_LENGTH,
	// exitProcess,
	// I18nable,
	// I18nFlag,
	I18N_LANG_ARRAY,
	I18N_LANG_NAME,
	joinPath,
	LF,
	mkdirSync,
	readTextFileSync,
	SEP,
	SEPARATOR_OF_SPLIT,
	statSync,
	writeTextFileSync,
	// readDirSync,
} from 'https://raw.githubusercontent.com/anqisoft/ts_utils/main/index.ts';

import { showHelpOrVersionOrCallbackAndShowUsedTime } from // '../ts_command_line_help/index.ts';
'https://raw.githubusercontent.com/anqisoft/ts_command_line_help/main/index.ts';

import {
	BrowserName,
	type BrowserNameAndDriverMap,
	type BrowserNameAndDriverPair,
	doubleClick,
	findElementByCss,
	getHeadlessChromeDriver,
	navigateTo,
	SeleniumHelper,
	sendKeysAndReturn,
	waitUtilElementLocatedByCss,
	waitUtilElementLocatedByCssAndGetText,
	// Builder, By, WebElement, Key, until,
	WebDriver,
	// } from './selenium.ts';
} from 'https://raw.githubusercontent.com/anqisoft/ts_selenium/main/index.ts';

import {
	GOOGLE_TRANSLATE_LANG_CN,
	GOOGLE_TRANSLATE_LANG_EN,
	GOOGLE_TRANSLATE_LANG_TW,
	translateByGoogle,
	// } from './translate_by_google.ts';
} from 'https://raw.githubusercontent.com/anqisoft/ts_translate_by_google/main/index.ts';

/**
 * <en_us>regular expression: content to be replaced when modifying the results of the simplified translation</en_us>
 * <zh_cn>正则表达式：修正简译英结果时所要替换的内容</zh_cn>
 * <zh_tw>正則表達式：修正簡譯英結果時所要替換的內容</zh_tw>
 */
const EN_US_PATCH_REPLACE_FROM = new RegExp(
	HTML_TAG_BEGIN__EN_US.concat(' ([^\n]+) ', HTML_TAG_END__EN_US),
	'g',
);

/**
 * <en_us>The string to be replaced when the results of the simplified translation of the British</en_us>
 * <zh_cn>修正简译英结果时所要替换到的字符串</zh_cn>
 * <zh_tw>修正簡譯英結果時所要替換到的字符串</zh_tw>
 */
const EN_US_PATCH_REPLACE_TO = `${HTML_TAG_BEGIN__EN_US}\$1${HTML_TAG_END__EN_US}`;

/**
 * <en_us>regular expression: content to be replaced when modifying the simplified translation results</en_us>
 * <zh_cn>正则表达式：修正简译繁结果时所要替换的内容</zh_cn>
 * <zh_tw>正則表達式：修正簡譯繁結果時所要替換的內容</zh_tw>
 */
const ZH_TW_PATCH_REPLACE_FROM = new RegExp(
	HTML_TAG_BEGIN__ZH_TW.concat(' ([^\n]+) ', HTML_TAG_END__ZH_TW),
	'g',
);

/**
 * <en_us>The string to be replaced when the simplified translation result</en_us>
 * <zh_cn>修正简译繁结果时所要替换到的字符串</zh_cn>
 * <zh_tw>修正簡譯繁結果時所要替換到的字符串</zh_tw>
 */
const ZH_TW_PATCH_REPLACE_TO = `${HTML_TAG_BEGIN__ZH_TW}\$1${HTML_TAG_END__ZH_TW}`;

/**
 * <en_us>regular expression: all I18N language HTML starts and end the label</en_us>
 * <zh_cn>正则表达式：所有i18n语言html开始与结束标签</zh_cn>
 * <zh_tw>正則表達式：所有i18n語言html開始與結束標籤</zh_tw>
 */
const HTML_TAG_BEGIN_OR_END_I18N_ANY_PATTERN = /((\<|\<\/)(en_us|zh_cn|zh_tw)\>)/g;

/**
 * <en_us>the core method of split annotation</en_us>
 * <zh_cn>拆分注释的核心方法</zh_cn>
 * <zh_tw>拆分註釋的核心方法</zh_tw>
 *
 * @param {WebDriver} driver <en_us>Browser driver</en_us><zh_cn>浏览器驱动程序</zh_cn><zh_tw>瀏覽器驅動程序</zh_tw>
 * @param {string} sourceFilename <en_us>The file name of the annotation to be split</en_us><zh_cn>所要拆分注释的文件名</zh_cn><zh_tw>所要拆分註釋的文件名</zh_tw>
 * @param {string} commentFilesPath <en_us>Storage path after splitting</en_us><zh_cn>拆分后结果存放路径</zh_cn><zh_tw>拆分後結果存放路徑</zh_tw>
 */
async function splitCommentCore(
	driver: WebDriver,
	sourceFilename: string,
	commentFilesPath: string,
) {
	const fileInfo = statSync(sourceFilename);
	assert(fileInfo.isFile);

	mkdirSync(commentFilesPath, { recursive: true });
	assert(statSync(commentFilesPath).isDirectory);

	const SOURCE_CONTENT = readTextFileSync(sourceFilename);

	const SPLIT_LEVEL_ONE = SOURCE_CONTENT.split(HTML_TAG_BEGIN__EN_US);
	// remove the first one.
	SPLIT_LEVEL_ONE.shift();

	const US_COMMENTS: string[] = [];
	const CN_COMMENTS: string[] = [];
	const TW_COMMENTS: string[] = [];
	SPLIT_LEVEL_ONE.forEach((seg, index) => {
		const EN_US_END_POS = seg.indexOf(HTML_TAG_END__EN_US);
		assert(EN_US_END_POS > -1, `${index}: EN_US_END_POS not right.\n${seg}`);

		const ZH_CN_START_POS = seg.indexOf(HTML_TAG_BEGIN__ZH_CN);
		assert(ZH_CN_START_POS > EN_US_END_POS, `${index}: ZH_CN_START_POS not right.\n${seg}`);

		const ZH_CN_END_POS = seg.indexOf(HTML_TAG_END__ZH_CN);
		assert(ZH_CN_END_POS > ZH_CN_START_POS, `${index}: ZH_CN_END_POS not right.\n${seg}`);

		const ZH_TW_START_POS = seg.indexOf(HTML_TAG_BEGIN__ZH_TW);
		assert(ZH_TW_START_POS > ZH_CN_END_POS, `${index}: ZH_TW_START_POS not right.\n${seg}`);

		const ZH_TW_END_POS = seg.indexOf(HTML_TAG_END__ZH_TW);
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

		US_COMMENTS.push(`${HTML_TAG_BEGIN__EN_US}${EN_US_COMMENT}${HTML_TAG_END__EN_US}`);
		CN_COMMENTS.push(`${HTML_TAG_BEGIN__ZH_CN}${ZH_CN_COMMENT}${HTML_TAG_END__ZH_CN}`);
		TW_COMMENTS.push(`${HTML_TAG_BEGIN__ZH_TW}${ZH_TW_COMMENT}${HTML_TAG_END__ZH_TW}`);
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
	const TW_BEFORE_TRANSLATE = CN_BEFORE_TRANSLATE;
	// .replaceAll(HTML_TAG_BEGIN__ZH_CN, HTML_TAG_BEGIN__ZH_TW)
	// .replaceAll(HTML_TAG_END__ZH_CN, HTML_TAG_END__ZH_TW);

	const DATA = [
		[I18N_LANG_NAME.en_us, US_COMMENTS],
		[I18N_LANG_NAME.zh_cn, CN_COMMENTS],
		[I18N_LANG_NAME.zh_tw, TW_COMMENTS],
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
						(await translateByGoogle(
							driver,
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
								EN_US_PATCH_REPLACE_FROM,
								EN_US_PATCH_REPLACE_TO,
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
						(await translateByGoogle(
							driver,
							TW_BEFORE_TRANSLATE,
							GOOGLE_TRANSLATE_LANG_CN,
							GOOGLE_TRANSLATE_LANG_TW,
						))
							.replaceAll(
								HTML_TAG_BEGIN__ZH_CN,
								HTML_TAG_BEGIN__ZH_TW,
							)
							.replaceAll(
								HTML_TAG_END__ZH_CN,
								HTML_TAG_END__ZH_TW,
							)
							.replace(
								ZH_TW_PATCH_REPLACE_FROM,
								ZH_TW_PATCH_REPLACE_TO,
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

/**
 * <en_us>the core method of split annotation</en_us>
 * <zh_cn>拆分注释的核心方法</zh_cn>
 * <zh_tw>拆分註釋的核心方法</zh_tw>
 *
 * @param {string} sourceFilename <en_us>The file name of the annotation to be split</en_us><zh_cn>所要拆分注释的文件名</zh_cn><zh_tw>所要拆分註釋的文件名</zh_tw>
 * @param {string} commentFilesPath <en_us>Disassembling result folder</en_us><zh_cn>拆分结果文件夹</zh_cn><zh_tw>拆分結果文件夾</zh_tw>
 * @returns {Promise<boolean>} <en_us>Whether the split is successful</en_us><zh_cn>是否拆分成功</zh_cn><zh_tw>是否拆分成功</zh_tw>
 */
export async function splitComments(
	sourceFilename: string,
	commentFilesPath: string,
): Promise<boolean> {
	const driver = await SeleniumHelper.getSingletonHeadlessChromeDriver();
	try {
		await splitCommentCore(driver, sourceFilename, commentFilesPath);
		return true;
	} catch (e) {
		console.error(e);
		return false;
	} finally {
		await SeleniumHelper.closeSingletonHeadlessChromeDriver();
	}
}

/**
 * <en_us>Get the annotation entry according to the split result folder and language</en_us>
 * <zh_cn>根据拆分结果文件夹与语言获取其中的注释条目</zh_cn>
 * <zh_tw>根據拆分結果文件夾與語言獲取其中的註釋條目</zh_tw>
 *
 * @param {string} dir <en_us>Disassembling result folder</en_us><zh_cn>拆分结果文件夹</zh_cn><zh_tw>拆分結果文件夾</zh_tw>
 * @param {string} lang <en_us>Language</en_us><zh_cn>语言</zh_cn><zh_tw>語言</zh_tw>
 * @returns {string[]} <en_us>arrays: entry of the corresponding language</en_us><zh_cn>数组：相应语言的条目</zh_cn><zh_tw>數組：相應語言的條目</zh_tw>
 */
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

/**
 * <en_us>merger notes</en_us>
 * <zh_cn>合并注释</zh_cn>
 * <zh_tw>合併註釋</zh_tw>
 *
 * @param {string} sourceFilename <en_us>The file name to be combined to be combined</en_us><zh_cn>要合并注释的文件名</zh_cn><zh_tw>要合併註釋的文件名</zh_tw>
 * @param {string} commentFilesPath <en_us>Disassembling result folder</en_us><zh_cn>拆分结果文件夹</zh_cn><zh_tw>拆分結果文件夾</zh_tw>
 * @returns {boolean} <en_us>Whether successful merger</en_us><zh_cn>是否成功合并</zh_cn><zh_tw>是否成功合併</zh_tw>
 */
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

		const GOAL_PATH = (sourceFilename.startsWith(SEP) ? SEP : '').concat(joinPath(
			commentFilesPath,
			sourceFilename.split(SEP).pop() as string,
			SEP,
		));
		const US_COMMENTS: string[] = getSplitResultFromGoalFileByLang(GOAL_PATH, I18N_LANG_NAME.en_us);
		const CN_COMMENTS: string[] = getSplitResultFromGoalFileByLang(GOAL_PATH, I18N_LANG_NAME.zh_cn);
		const TW_COMMENTS: string[] = getSplitResultFromGoalFileByLang(GOAL_PATH, I18N_LANG_NAME.zh_tw);

		const CODES_ARRAY = SOURCE_CONTENT.replace(
			HTML_TAG_BEGIN_OR_END_I18N_ANY_PATTERN,
			SEPARATOR_OF_SPLIT,
		)
			.split(SEPARATOR_OF_SPLIT);

		const COUNT = US_COMMENTS.length;
		// console.log(CN_COMMENTS.length, TW_COMMENTS.length, COUNT);
		assert(COUNT === CN_COMMENTS.length && COUNT === TW_COMMENTS.length);

		// console.log(
		// 	'SOURCE_CONTENT\n',
		// 	SOURCE_CONTENT,
		// 	'\n',
		// 	'CODES_ARRAY\n',
		// 	CODES_ARRAY,
		// 	'\n',
		// 	'US_COMMENTS\n',
		// 	US_COMMENTS,
		// 	'\n',
		// 	'CN_COMMENTS\n',
		// 	CN_COMMENTS,
		// 	'\n',
		// 	'TW_COMMENTS\n',
		// 	TW_COMMENTS,
		// 	'\n',
		// 	'COUNT',
		// 	COUNT,
		// 	'\n',
		// );

		for (let i = 0; i < COUNT; ++i) {
			const OFFSET = 6 * i;
			CODES_ARRAY[OFFSET + 1] = `${HTML_TAG_BEGIN__EN_US}${US_COMMENTS[i]}${HTML_TAG_END__EN_US}`;
			CODES_ARRAY[OFFSET + 3] = `${HTML_TAG_BEGIN__ZH_CN}${CN_COMMENTS[i]}${HTML_TAG_END__ZH_CN}`;
			CODES_ARRAY[OFFSET + 5] = `${HTML_TAG_BEGIN__ZH_TW}${TW_COMMENTS[i]}${HTML_TAG_END__ZH_TW}`;
		}
		// console.log(
		// 	'CODES_ARRAY\n',
		// 	CODES_ARRAY,
		// 	'\n\n\n\n\n',
		// 	'[END RESULT]\n',
		// 	CODES_ARRAY.join(''),
		// 	'\n',
		// );

		writeTextFileSync(sourceFilename, CODES_ARRAY.join(''));
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
}

/**
 * <en_us>the core method of translation Chinese to three -character</en_us>
 * <zh_cn>翻译中文到三语的核心方法</zh_cn>
 * <zh_tw>翻譯中文到三語的核心方法</zh_tw>
 *
 * @param {WebDriver} driver <en_us>Browser driver</en_us><zh_cn>浏览器驱动程序</zh_cn><zh_tw>瀏覽器驅動程序</zh_tw>
 * @param {string} sourceFilenames <en_us>to translate Chinese to three -character file name</en_us><zh_cn>要翻译中文到三语的文件名</zh_cn><zh_tw>要翻譯中文到三語的文件名</zh_tw>
 */
async function cn2trilingualCore(driver: WebDriver, sourceFilename: string) {
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
		.replace(HTML_TAG_BEGIN_OR_END_I18N_ANY_PATTERN, SEPARATOR_OF_SPLIT)
		.split(SEPARATOR_OF_SPLIT);
	const LAST_ITEM_START_INDEX = CODES_ARRAY.length - SEG_COUNT_PER_ITEM;
	for (let i = 0; i < LAST_ITEM_START_INDEX; i += SEG_COUNT_PER_ITEM) {
		// US_COMMENTS.push(`${HTML_TAG_BEGIN__EN_US}${CODES_ARRAY[i + 1]}${HTML_TAG_END__EN_US}`);
		CN_COMMENTS.push(`${HTML_TAG_BEGIN__ZH_CN}${CODES_ARRAY[i + 3]}${HTML_TAG_END__ZH_CN}`);
		// TW_COMMENTS.push(`${HTML_TAG_BEGIN__ZH_TW}${CODES_ARRAY[i + 5]}${HTML_TAG_END__ZH_TW}`);
	}
	// console.log('CN_COMMENTS.length', CN_COMMENTS.length);

	const CN_BEFORE_TRANSLATE = CN_COMMENTS.join(LF);
	// console.log('CN_BEFORE_TRANSLATE.length', CN_BEFORE_TRANSLATE.length);
	// console.log('CN_BEFORE_TRANSLATE', CN_BEFORE_TRANSLATE);
	const EN_BEFORE_TRANSLATE = CN_BEFORE_TRANSLATE; // .replaceAll(HTML_TAG_BEGIN__ZH_CN, HTML_TAG_BEGIN__EN_US)
	// .replaceAll(HTML_TAG_END__ZH_CN), HTML_TAG_END__EN_US))
	const TW_BEFORE_TRANSLATE = CN_BEFORE_TRANSLATE;
	// .replaceAll(HTML_TAG_BEGIN__ZH_CN, HTML_TAG_BEGIN__ZH_TW)
	// .replaceAll(HTML_TAG_END__ZH_CN, HTML_TAG_END__ZH_TW);

	US_COMMENTS.length = 0;
	// CN_COMMENTS.length = 0;
	TW_COMMENTS.length = 0;

	const EN_FULL_CONTENT = (await translateByGoogle(
		driver,
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
		.replace(EN_US_PATCH_REPLACE_FROM, EN_US_PATCH_REPLACE_TO);

	EN_FULL_CONTENT
		.substring(I18N_HTML_BEGIN_TAG_LENGTH, EN_FULL_CONTENT.length - I18N_HTML_BEGIN_TAG_LENGTH - 1)
		.replace(
			new RegExp(`${HTML_TAG_END__EN_US}\n${HTML_TAG_BEGIN__EN_US}`, 'g'),
			SEPARATOR_OF_SPLIT,
		)
		.split(SEPARATOR_OF_SPLIT).forEach((item: string) => US_COMMENTS.push(item));
	// console.log('EN_FULL_CONTENT', EN_FULL_CONTENT);

	const TW_FULL_CONTENT = (await translateByGoogle(
		driver,
		TW_BEFORE_TRANSLATE,
		GOOGLE_TRANSLATE_LANG_CN,
		GOOGLE_TRANSLATE_LANG_TW,
	)).replaceAll(
		HTML_TAG_BEGIN__ZH_CN,
		HTML_TAG_BEGIN__ZH_TW,
	)
		.replaceAll(
			HTML_TAG_END__ZH_CN,
			HTML_TAG_END__ZH_TW,
		)
		.replace(ZH_TW_PATCH_REPLACE_FROM, ZH_TW_PATCH_REPLACE_TO);
	// console.log('TW_FULL_CONTENT', TW_FULL_CONTENT);
	TW_FULL_CONTENT
		.substring(I18N_HTML_BEGIN_TAG_LENGTH, TW_FULL_CONTENT.length - I18N_HTML_BEGIN_TAG_LENGTH - 1)
		.replace(
			new RegExp(`${HTML_TAG_END__ZH_TW}\n${HTML_TAG_BEGIN__ZH_TW}`, 'g'),
			SEPARATOR_OF_SPLIT,
		)
		.split(SEPARATOR_OF_SPLIT).forEach((item: string) => TW_COMMENTS.push(item));

	// console.log('US_COMMENTS.length', US_COMMENTS.length);
	// console.log('TW_COMMENTS.length', TW_COMMENTS.length);
	const COUNT = US_COMMENTS.length;
	for (let i = 0; i < COUNT; ++i) {
		const OFFSET = SEG_COUNT_PER_ITEM * i;
		CODES_ARRAY[OFFSET + 1] = `${HTML_TAG_BEGIN__EN_US}${US_COMMENTS[i]}${HTML_TAG_END__EN_US}`;
		// CODES_ARRAY[OFFSET + 3] = `${HTML_TAG_BEGIN__ZH_CN}${CN_COMMENTS[i]}${HTML_TAG_END__ZH_CN}`;
		CODES_ARRAY[OFFSET + 3] = `${CN_COMMENTS[i]}`;
		CODES_ARRAY[OFFSET + 5] = `${HTML_TAG_BEGIN__ZH_TW}${TW_COMMENTS[i]}${HTML_TAG_END__ZH_TW}`;
	}

	writeTextFileSync(sourceFilename, CODES_ARRAY.join(''));
}

/**
 * <en_us>Translate multiple files in Chinese label to trimina</en_us>
 * <zh_cn>翻译多个文件中文标签内容到三语</zh_cn>
 * <zh_tw>翻譯多個文件中文標籤內容到三語</zh_tw>
 *
 * @param {string[]} sourceFilenames <en_us>array: The file name of Chinese to three -character files</en_us><zh_cn>数组：要翻译中文到三语的文件名</zh_cn><zh_tw>數組：要翻譯中文到三語的文件名</zh_tw>
 * @returns {Promise<boolean>} <en_us>asynchronous results: whether to successfully translate all files</en_us><zh_cn>异步结果：是否成功翻译所有文件</zh_cn><zh_tw>異步結果：是否成功翻譯所有文件</zh_tw>
 */
export async function cn2trilingual(sourceFilenames: string[]): Promise<boolean> {
	const driver: WebDriver = await SeleniumHelper.getSingletonHeadlessChromeDriver();

	const COUNT = sourceFilenames.length;
	for (let i = 0; i < COUNT; ++i) {
		const SOURCE_FILENAME = sourceFilenames[i];
		try {
			await cn2trilingualCore(driver, SOURCE_FILENAME);
		} catch (e) {
			console.error(SOURCE_FILENAME, e);
			return false;
		}
	}

	await SeleniumHelper.closeSingletonHeadlessChromeDriver();
	return true;
}

/**
 * <en_us>HTML label segment that removes the specified language</en_us>
 * <zh_cn>移除指定语言的html标签段</zh_cn>
 * <zh_tw>移除指定語言的html標籤段</zh_tw>
 *
 * @param {string} source <en_us>original content</en_us><zh_cn>原始内容</zh_cn><zh_tw>原始內容</zh_tw>
 * @param {string} lang <en_us>international language name</en_us><zh_cn>国际化语言名</zh_cn><zh_tw>國際化語言名</zh_tw>
 * @returns {string} <en_us>The results after removing the corresponding language HTML label</en_us><zh_cn>移除相应语言html标签后的结果</zh_cn><zh_tw>移除相應語言html標籤後的結果</zh_tw>
 */
function removeLangSeg(source: string, lang: string): string {
	// console.log(`[\\r\\n]+(([\\#]+[\\ \\t]+)|([\\ \\t]*\\/\\/[\\ \\t]*)|([\\ \\t]*\\*[\\ \\t]*))<${lang}>`);
	/*
		/[\r\n]+(([\#]+[\ \t]+)|([\ \t]*\/\/[\ \t]*)|([\ \t]*\*[\ \t]*))<en_us\>/g
		/[\r\n]+(([\#]+[\ \t]+)|([\ \t]*\/\/[\ \t]*)|([\ \t]*\*[\ \t]*))<zh_cn\>/g
		/[\r\n]+(([\#]+[\ \t]+)|([\ \t]*\/\/[\ \t]*)|([\ \t]*\*[\ \t]*))<zh_tw\>/g
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

/**
 * <en_us>The HTML label segment that removes other languages can remove the HTML tag itself (retaining text content) of the designated language at the same time (retaining text content)</en_us>
 * <zh_cn>移除其它语言的html标签段，可同时移除所指定语言的html标签本身（保留文本内容）</zh_cn>
 * <zh_tw>移除其它語言的html標籤段，可同時移除所指定語言的html標籤本身（保留文本內容）</zh_tw>
 *
 * @param {string} source <en_us>original content</en_us><zh_cn>原始内容</zh_cn><zh_tw>原始內容</zh_tw>
 * @param {string} lang <en_us>international language name</en_us><zh_cn>国际化语言名</zh_cn><zh_tw>國際化語言名</zh_tw>
 * @param {boolean} keepLangTag <en_us>Whether the split result retains the language html label</en_us><zh_cn>拆分结果是否保留语言html标签</zh_cn><zh_tw>拆分結果是否保留語言html標籤</zh_tw>
 * @returns {string} <en_us>The results after the HTML label section that removes other languages</en_us><zh_cn>移除其它语言的html标签段后的结果</zh_cn><zh_tw>移除其它語言的html標籤段後的結果</zh_tw>
 */
function keepByLang(source: string, lang: string, keepLangTag: boolean): string {
	let result = source;

	switch (lang) {
		case I18N_LANG_NAME.en_us:
			break;
		case I18N_LANG_NAME.zh_cn:
			result = result
				.replace(
					new RegExp(
						`([\\r\\n]+(([\\#]+[\\ \\t]+)|([\\ \\t]*\\/\\/[\\ \\t]*)|([\\ \\t]*\\*[\\ \\t]*)))${HTML_TAG_BEGIN__EN_US}[^\r\n]+${HTML_TAG_END__EN_US}<${lang}>`,
						'g',
					),
					`$1<${lang}>`,
				);
			break;
		case I18N_LANG_NAME.zh_tw:
			result = result
				.replace(
					new RegExp(
						`([\\r\\n]+(([\\#]+[\\ \\t]+)|([\\ \\t]*\\/\\/[\\ \\t]*)|([\\ \\t]*\\*[\\ \\t]*)))${HTML_TAG_BEGIN__EN_US}[^\r\n]+${HTML_TAG_END__EN_US}${HTML_TAG_BEGIN__ZH_CN}[^\r\n]+${HTML_TAG_END__ZH_CN}<${lang}>`,
						'g',
					),
					`$1<${lang}>`,
				);
			break;
		default:
			break;
	}

	I18N_LANG_ARRAY.filter((one) => one !== lang).forEach((removeLang) => {
		result = removeLangSeg(result, removeLang);
	});

	if (!keepLangTag) {
		result = result.replace(new RegExp(`(<|</)${lang}>`, 'g'), '');
	}

	return result;
}

/**
 * <en_us>Several readme.md files (one new file in each international language)</en_us>
 * <zh_cn>拆分若干README.md文件（每种国际化语言一个新文件）</zh_cn>
 * <zh_tw>拆分若干README.md文件（每種國際化語言一個新文件）</zh_tw>
 *
 * @param {boolean} keepLangTag <en_us>Whether the split result retains the language html label</en_us><zh_cn>拆分结果是否保留语言html标签</zh_cn><zh_tw>拆分結果是否保留語言html標籤</zh_tw>
 * @param {string[]} sourceFilenames <en_us>array: Reademe.md file name to be split</en_us><zh_cn>数组：要拆分的READEME.md文件名</zh_cn><zh_tw>數組：要拆分的READEME.md文件名</zh_tw>
 * @returns {boolean} <en_us>Whether to successfully split Reademe.md file</en_us><zh_cn>是否成功拆分READEME.md文件</zh_cn><zh_tw>是否成功拆分READEME.md文件</zh_tw>
 */
export function splitReadmeFiles(keepLangTag: boolean, sourceFilenames: string[]): boolean {
	const COUNT = sourceFilenames.length;
	for (let i = 0; i < COUNT; ++i) {
		const SOURCE_FILENAME = sourceFilenames[i];
		try {
			if (SOURCE_FILENAME.toLowerCase().lastIndexOf('readme.md') === -1) {
				continue;
			}

			const SOURCE_CONTENT = readTextFileSync(SOURCE_FILENAME);

			// console.log('SOURCE_CONTENT', SOURCE_CONTENT);
			// console.log(I18N_LANG_NAME.en_us, removeLangSeg(removeLangSeg(SOURCE_CONTENT, I18N_LANG_NAME.zh_cn), I18N_LANG_NAME.zh_tw));
			// console.log(I18N_LANG_NAME.zh_cn, removeLangSeg(removeLangSeg(SOURCE_CONTENT, I18N_LANG_NAME.en_us), I18N_LANG_NAME.zh_tw));
			// console.log(I18N_LANG_NAME.zh_tw, removeLangSeg(removeLangSeg(SOURCE_CONTENT, I18N_LANG_NAME.en_us), I18N_LANG_NAME.zh_cn));

			const GOAL_FILENAME_PREFIX = SOURCE_FILENAME.substring(
				0,
				SOURCE_FILENAME.toLowerCase().lastIndexOf('readme.md'),
			);

			// writeTextFileSync(GOAL_FILENAME_PREFIX.concat('README.en_us.md'), removeLangSeg(removeLangSeg(SOURCE_CONTENT, I18N_LANG_NAME.zh_cn), I18N_LANG_NAME.zh_tw));
			// writeTextFileSync(GOAL_FILENAME_PREFIX.concat('README.zh_cn.md'), removeLangSeg(removeLangSeg(SOURCE_CONTENT, I18N_LANG_NAME.en_us), I18N_LANG_NAME.zh_tw));
			// writeTextFileSync(GOAL_FILENAME_PREFIX.concat('README.zh_tw.md'), removeLangSeg(removeLangSeg(SOURCE_CONTENT, I18N_LANG_NAME.en_us), I18N_LANG_NAME.zh_cn));

			I18N_LANG_ARRAY.forEach((lang) => {
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

/**
 * <en_us>Several files are split, a I18N folder will be automatically established, and a sub -folder will be established for each international language. The split result corresponds to</en_us>
 * <zh_cn>拆分若干文件，会自动建立一个i18n文件夹，并针对每一种国际化语言建立一个子文件夹，将拆分结果对应放入</zh_cn>
 * <zh_tw>拆分若干文件，會自動建立一個i18n文件夾，並針對每一種國際化語言建立一個子文件夾，將拆分結果對應放入</zh_tw>
 *
 * @param {boolean} keepLangTag <en_us>Whether the split result retains the language html label</en_us><zh_cn>拆分结果是否保留语言html标签</zh_cn><zh_tw>拆分結果是否保留語言html標籤</zh_tw>
 * @param {string[]} sourceFilenames <en_us>array: file name to be split</en_us><zh_cn>数组：要拆分的文件名</zh_cn><zh_tw>數組：要拆分的文件名</zh_tw>
 * @returns {boolean} <en_us>Whether to successfully split all files</en_us><zh_cn>是否成功拆分所有文件</zh_cn><zh_tw>是否成功拆分所有文件</zh_tw>
 */
export function splitFiles(keepLangTag: boolean, sourceFilenames: string[]): boolean {
	const COUNT = sourceFilenames.length;
	for (let i = 0; i < COUNT; ++i) {
		const SOURCE_FILENAME = sourceFilenames[i];
		try {
			const SOURCE_FILENAME_SPLIT_RESULT = SOURCE_FILENAME.split(SEP);

			const FILENAME = SOURCE_FILENAME_SPLIT_RESULT.pop() as string;
			const GOAL_PATH = (SOURCE_FILENAME.startsWith(SEP) ? SEP : '').concat(joinPath(
				SOURCE_FILENAME_SPLIT_RESULT.join(SEP),
				'i18n',
			));

			const splitFile = () => {
				const SOURCE_CONTENT = readTextFileSync(SOURCE_FILENAME);
				[
					[
						I18N_LANG_NAME.en_us,
						removeLangSeg(
							removeLangSeg(SOURCE_CONTENT, I18N_LANG_NAME.zh_cn),
							I18N_LANG_NAME.zh_tw,
						),
					],
					[
						I18N_LANG_NAME.zh_cn,
						removeLangSeg(
							removeLangSeg(SOURCE_CONTENT, I18N_LANG_NAME.en_us),
							I18N_LANG_NAME.zh_tw,
						),
					],
					[
						I18N_LANG_NAME.zh_tw,
						removeLangSeg(
							removeLangSeg(SOURCE_CONTENT, I18N_LANG_NAME.en_us),
							I18N_LANG_NAME.zh_cn,
						),
					],
				].forEach(([lang, content]) => {
					const PATH = joinPath(GOAL_PATH, lang);
					mkdirSync(PATH, { recursive: true });
					writeTextFileSync(
						joinPath(PATH, FILENAME),
						keepLangTag
							? content
							: content.replaceAll(`<${lang}>`, '').replaceAll(`</${lang}>`, ''),
					);
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
					I18N_LANG_ARRAY.forEach((lang) => {
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

/**
 * <en_us>entrance: display help or version, or perform different tasks according to the parameters</en_us>
 * <zh_cn>入口：显示帮助或版本，或根据参数执行不同任务</zh_cn>
 * <zh_tw>入口：顯示幫助或版本，或根據參數執行不同任務</zh_tw>
 */
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
		switch (command) {
			case 'splitComments':
				console.log(
					await splitComments(
						source,
						others[0],
					),
				);

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
			case 'txtCn2trilingual':
				console.log(await txtCn2trilingual([source, ...others]));
				break;
			default:
				break;
		}
	},
);

/**
 * <en_us>Translate multiple files in Chinese label to trimina</en_us>
 * <zh_cn>翻译多个文本文件中文标签内容到三语</zh_cn>
 * <zh_tw>翻譯多個文件中文標籤內容到三語</zh_tw>
 *
 * @param {string[]} sourceFilenames <en_us>array: The file name of Chinese to three -character files</en_us><zh_cn>数组：要翻译中文到三语的文件名</zh_cn><zh_tw>數組：要翻譯中文到三語的文件名</zh_tw>
 * @returns {Promise<boolean>} <en_us>asynchronous results: whether to successfully translate all files</en_us><zh_cn>异步结果：是否成功翻译所有文件</zh_cn><zh_tw>異步結果：是否成功翻譯所有文件</zh_tw>
 */
export async function txtCn2trilingual(sourceFilenames: string[]): Promise<boolean> {
	const driver: WebDriver = await SeleniumHelper.getSingletonHeadlessChromeDriver();

	const COUNT = sourceFilenames.length;
	for (let i = 0; i < COUNT; ++i) {
		const SOURCE_FILENAME = sourceFilenames[i];
		try {
			await txtCn2trilingualCore(driver, SOURCE_FILENAME);
		} catch (e) {
			console.error(SOURCE_FILENAME, e);
			return false;
		}
	}

	await SeleniumHelper.closeSingletonHeadlessChromeDriver();
	return true;
}

/**
 * <en_us>the core method of translation Chinese to three -character</en_us>
 * <zh_cn>翻译文本文件之中文到三语的核心方法</zh_cn>
 * <zh_tw>翻譯中文到三語的核心方法</zh_tw>
 *
 * @param {WebDriver} driver <en_us>Browser driver</en_us><zh_cn>浏览器驱动程序</zh_cn><zh_tw>瀏覽器驅動程序</zh_tw>
 * @param {string} sourceFilenames <en_us>to translate Chinese to three -character file name</en_us><zh_cn>要翻译中文到三语的文件名</zh_cn><zh_tw>要翻譯中文到三語的文件名</zh_tw>
 */
async function txtCn2trilingualCore(driver: WebDriver, sourceFilename: string) {
	// console.log('sourceFilename', sourceFilename);
	const fileInfo = statSync(sourceFilename);
	assert(fileInfo.isFile);

	const SOURCE_CONTENT = readTextFileSync(sourceFilename);
	const BAK_FILENAME = sourceFilename.concat(getFilenameTimestampPostfix(), '.bak');
	if (!existsSync(BAK_FILENAME)) {
		writeTextFileSync(BAK_FILENAME, SOURCE_CONTENT);
	}

	const SOURCE_FILENAME_SPLIT_RESULT = sourceFilename.split(SEP);
	// console.log({ sourceFilename, SOURCE_FILENAME_SPLIT_RESULT });

	const FILENAME = SOURCE_FILENAME_SPLIT_RESULT.pop() as string;
	const GOAL_PATH = (sourceFilename.startsWith(SEP) ? SEP : '').concat(
		SOURCE_FILENAME_SPLIT_RESULT.join(SEP),
	);
	// console.log({ FILENAME });
	// console.log({ GOAL_PATH });

	const FILENAME_SPLIT_BY_DOT_RESULT = FILENAME.split('.');
	const EXTENTION = FILENAME_SPLIT_BY_DOT_RESULT.pop() as string;
	const FILENAME_PREFIX = FILENAME_SPLIT_BY_DOT_RESULT.join('.');

	const EN_US_FILENAME = joinPath(GOAL_PATH, FILENAME_PREFIX.concat('.en_us.', EXTENTION));
	if (!existsSync(EN_US_FILENAME)) {
		const EN_FULL_CONTENT = await translateByGoogle(
			driver,
			SOURCE_CONTENT,
			GOOGLE_TRANSLATE_LANG_CN,
			GOOGLE_TRANSLATE_LANG_EN,
		);
		writeTextFileSync(EN_US_FILENAME, EN_FULL_CONTENT);
	}

	const ZH_TW_FILENAME = joinPath(GOAL_PATH, FILENAME_PREFIX.concat('.zh_tw.', EXTENTION));
	if (!existsSync(ZH_TW_FILENAME)) {
		const TW_FULL_CONTENT = await translateByGoogle(
			driver,
			SOURCE_CONTENT,
			GOOGLE_TRANSLATE_LANG_CN,
			GOOGLE_TRANSLATE_LANG_TW,
		);
		writeTextFileSync(ZH_TW_FILENAME, TW_FULL_CONTENT);
	}
}
