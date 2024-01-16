"use strict";
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
 * Feature: For codes, documents, etc., translate simplified content (such as comments) into English and traditional Chinese, split files with three natural language contents into corresponding i18n directories, etc.
 * </en_us>
 *
 * <zh_cn>
 * 创建：2024年1月9日 11:28:16
 * 功能：对代码或readme.md文件提供i18n相关拆分、合并、翻译等功能。
 * </zh_cn>
 *
 * <zh_tw>
 * 創建：2024年1月9日 11:28:16
 * 功能：
 * </zh_tw>
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.splitFiles = exports.splitReadmeFiles = exports.cn2trilingual = exports.joinComments = exports.splitComments = void 0;
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
/// <reference lib="deno.ns" />
var npm_selenium_webdriver_1 = require("npm:selenium-webdriver");
var chrome = __importStar(require("npm:selenium-webdriver/chrome.js"));
var TRANSLATE_MAX_CHAR_COUNT_PER_TIME = 5000;
var FILE_WRITE_MODE = { mode: 511 };
var FILE_WRITE_IF_NOT_EXIST_MODE = { createNew: true, mode: 511 };
var index_ts_1 = require("https://raw.githubusercontent.com/anqisoft/ts_utils/main/index.ts");
var index_ts_2 = require("https://raw.githubusercontent.com/anqisoft/ts_command_line_help/main/index.ts");
var GOOGLE_TRANSLATE_LANG_CN = 'zh-CN';
var GOOGLE_TRANSLATE_LANG_EN = 'en';
var GOOGLE_TRANSLATE_LANG_TW = 'zh-TW';
var CHROME = 'chrome';
var EN_REPLACE_PATCH_FROM = /<en_us\> ([^\n]+) <\/en_us\>/g;
var EN_REPLACE_PATCH_TO = '<en_us\>$1</en_us\>';
// .replaceAll(ZH_CN_START_TAG), ZH_TW_START_TAG))
// .replaceAll(ZH_CN_END_TAG), ZH_TW_END_TAG))
function translateByGoogleCore(from, langFrom, langTo) {
    return __awaiter(this, void 0, Promise, function () {
        var URL, FROM_CSS, TO_CSS, START_TIME, driver, elementFrom, FROM_LENGTH, element, result, RESULTS, remaining_1, remainingLength, END_TAG, END_TAG_LENGTH, _loop_1, state_1, e_1, END_TIME;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    URL = "https://translate.google.com/details?sl=" + langFrom + "&tl=" + langTo;
                    FROM_CSS = '.er8xn';
                    TO_CSS = '.lRu31';
                    START_TIME = new Date();
                    return [4 /*yield*/, new npm_selenium_webdriver_1.Builder()
                            .forBrowser(CHROME)
                            .setChromeOptions(new chrome.Options().headless())
                            .build()];
                case 1:
                    driver = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 16, 20]);
                    return [4 /*yield*/, driver.get(URL)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, driver.findElement(npm_selenium_webdriver_1.By.css(FROM_CSS))];
                case 4:
                    elementFrom = _a.sent();
                    FROM_LENGTH = from.length;
                    if (!(FROM_LENGTH <= TRANSLATE_MAX_CHAR_COUNT_PER_TIME)) return [3 /*break*/, 10];
                    return [4 /*yield*/, driver.actions({ bridge: true }).doubleClick(elementFrom).perform()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, elementFrom.sendKeys(from, npm_selenium_webdriver_1.Key.RETURN)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, driver.wait(npm_selenium_webdriver_1.until.elementLocated(npm_selenium_webdriver_1.By.css(TO_CSS)), 40000)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, driver.findElement(npm_selenium_webdriver_1.By.css(TO_CSS))];
                case 8:
                    element = _a.sent();
                    return [4 /*yield*/, element.getText()];
                case 9:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 10:
                    RESULTS = [];
                    remaining_1 = from;
                    remainingLength = FROM_LENGTH;
                    END_TAG = "</" + (langFrom === GOOGLE_TRANSLATE_LANG_EN
                        ? 'en_us'
                        : langFrom.replaceAll('-', '_').toLowerCase()) + ">";
                    END_TAG_LENGTH = END_TAG.length;
                    _loop_1 = function () {
                        var next, END_TAG_POS, ok_1, element, result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    next = '';
                                    if (remainingLength <= TRANSLATE_MAX_CHAR_COUNT_PER_TIME) {
                                        // await elementFrom.sendKeys(remaining, Key.RETURN);
                                        // remaining = '';
                                        next = remaining_1;
                                    }
                                    else {
                                        END_TAG_POS = remaining_1.substring(0, TRANSLATE_MAX_CHAR_COUNT_PER_TIME)
                                            .lastIndexOf(END_TAG);
                                        if (END_TAG_POS > -1 &&
                                            END_TAG_POS + END_TAG_LENGTH <= TRANSLATE_MAX_CHAR_COUNT_PER_TIME) {
                                            next = remaining_1.substring(0, END_TAG_POS + END_TAG_LENGTH);
                                        }
                                        else {
                                            ok_1 = false;
                                            (langFrom === GOOGLE_TRANSLATE_LANG_EN ? '\n.?! ' : '\n。？！ ').split('').forEach(function (seg) {
                                                if (ok_1)
                                                    return;
                                                var POS = remaining_1.indexOf(seg);
                                                if (POS > 0) {
                                                    next = remaining_1.substring(0, POS);
                                                    ok_1 = true;
                                                }
                                            });
                                            if (!ok_1) {
                                                next = remaining_1.substring(0, TRANSLATE_MAX_CHAR_COUNT_PER_TIME);
                                            }
                                        }
                                    }
                                    return [4 /*yield*/, driver.actions({ bridge: true }).doubleClick(elementFrom).perform()];
                                case 1:
                                    _a.sent();
                                    // elementFrom.setText('');
                                    return [4 /*yield*/, elementFrom.sendKeys(next, npm_selenium_webdriver_1.Key.RETURN)];
                                case 2:
                                    // elementFrom.setText('');
                                    _a.sent();
                                    remaining_1 = remaining_1.substring(next.length);
                                    // console.log(`Send ${next}`);
                                    // 下句不是想要的结果
                                    // console.log('elementFrom.getText():', await elementFrom.getText());
                                    return [4 /*yield*/, driver.wait(npm_selenium_webdriver_1.until.elementLocated(npm_selenium_webdriver_1.By.css(TO_CSS)), 40000)];
                                case 3:
                                    // console.log(`Send ${next}`);
                                    // 下句不是想要的结果
                                    // console.log('elementFrom.getText():', await elementFrom.getText());
                                    _a.sent();
                                    return [4 /*yield*/, driver.findElement(npm_selenium_webdriver_1.By.css(TO_CSS))];
                                case 4:
                                    element = _a.sent();
                                    return [4 /*yield*/, element.getText()];
                                case 5:
                                    result = _a.sent();
                                    RESULTS.push(result);
                                    remainingLength = remaining_1.length;
                                    if (remainingLength == 0) {
                                        return [2 /*return*/, "break"];
                                    }
                                    return [4 /*yield*/, driver.get(URL)];
                                case 6:
                                    _a.sent();
                                    return [4 /*yield*/, driver.findElement(npm_selenium_webdriver_1.By.css(FROM_CSS))];
                                case 7:
                                    elementFrom = _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 11;
                case 11: return [5 /*yield**/, _loop_1()];
                case 12:
                    state_1 = _a.sent();
                    if (state_1 === "break")
                        return [3 /*break*/, 14];
                    _a.label = 13;
                case 13:
                    if (true) return [3 /*break*/, 11];
                    _a.label = 14;
                case 14: return [2 /*return*/, RESULTS.join(LF)];
                case 15: return [3 /*break*/, 20];
                case 16:
                    _a.trys.push([16, 18, , 19]);
                    return [4 /*yield*/, driver.quit()];
                case 17:
                    _a.sent();
                    return [3 /*break*/, 19];
                case 18:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 19];
                case 19:
                    END_TIME = new Date();
                    console.log(END_TIME.getTime() - START_TIME.getTime());
                    return [7 /*endfinally*/];
                case 20: return [2 /*return*/];
            }
        });
    });
}
function splitCommentCore(sourceFilename, commentFilesPath) {
    return __awaiter(this, void 0, void 0, function () {
        var fileInfo, SOURCE_CONTENT, SPLIT_LEVEL_ONE, US_COMMENTS, CN_COMMENTS, TW_COMMENTS, GOAL_PATH, CN_BEFORE_TRANSLATE, EN_BEFORE_TRANSLATE, TW_BEFORE_TRANSLATE, DATA, index, langAndData, LANG, FILE_CONTENT, OTHER_FILENAME, _a, _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    fileInfo = Deno.statSync(sourceFilename);
                    index_ts_1.assert(fileInfo.isFile);
                    Deno.mkdirSync(commentFilesPath, { recursive: true });
                    index_ts_1.assert(Deno.statSync(commentFilesPath).isDirectory);
                    SOURCE_CONTENT = Deno.readTextFileSync(sourceFilename);
                    SPLIT_LEVEL_ONE = SOURCE_CONTENT.split(index_ts_1.EN_US_START_TAG);
                    // remove the first one.
                    SPLIT_LEVEL_ONE.shift();
                    US_COMMENTS = [];
                    CN_COMMENTS = [];
                    TW_COMMENTS = [];
                    SPLIT_LEVEL_ONE.forEach(function (seg, index) {
                        // removed <en_us>
                        // ...</en_us>...<zh_cn>...</zh_cn>...<zh_tw>...</zh_tw>...
                        var EN_US_END_POS = seg.indexOf('</en_us>');
                        index_ts_1.assert(EN_US_END_POS > -1, index + ": EN_US_END_POS not right.\n" + seg);
                        var ZH_CN_START_POS = seg.indexOf('<zh_cn>');
                        index_ts_1.assert(ZH_CN_START_POS > EN_US_END_POS, index + ": ZH_CN_START_POS not right.\n" + seg);
                        var ZH_CN_END_POS = seg.indexOf('</zh_cn>');
                        index_ts_1.assert(ZH_CN_END_POS > ZH_CN_START_POS, index + ": ZH_CN_END_POS not right.\n" + seg);
                        var ZH_TW_START_POS = seg.indexOf('<zh_tw>');
                        index_ts_1.assert(ZH_TW_START_POS > ZH_CN_END_POS, index + ": ZH_TW_START_POS not right.\n" + seg);
                        var ZH_TW_END_POS = seg.indexOf('</zh_tw>');
                        index_ts_1.assert(ZH_TW_END_POS > ZH_TW_START_POS, index + ": ZH_TW_END_POS not right.\n" + seg);
                        var EN_US_COMMENT = seg.substring(0, EN_US_END_POS);
                        var ZH_CN_COMMENT = seg.substring(ZH_CN_START_POS + index_ts_1.START_TAG_LENGTH, ZH_CN_END_POS);
                        var ZH_TW_COMMENT = seg.substring(ZH_TW_START_POS + index_ts_1.START_TAG_LENGTH, ZH_TW_END_POS);
                        US_COMMENTS.push("<en_us>" + EN_US_COMMENT + "</en_us>");
                        CN_COMMENTS.push("<zh_cn>" + ZH_CN_COMMENT + "</zh_cn>");
                        TW_COMMENTS.push("<zh_tw>" + ZH_TW_COMMENT + "</zh_tw>");
                    });
                    GOAL_PATH = index_ts_1.joinPath(commentFilesPath, sourceFilename.split(SEP).pop(), SEP);
                    Deno.mkdirSync(GOAL_PATH, { recursive: true });
                    CN_BEFORE_TRANSLATE = CN_COMMENTS.join(LF);
                    EN_BEFORE_TRANSLATE = CN_BEFORE_TRANSLATE;
                    TW_BEFORE_TRANSLATE = CN_BEFORE_TRANSLATE
                        .replaceAll(index_ts_1.ZH_CN_START_TAG, index_ts_1.ZH_TW_START_TAG)
                        .replaceAll(index_ts_1.ZH_CN_END_TAG, index_ts_1.ZH_TW_END_TAG);
                    DATA = [
                        ['en_us', US_COMMENTS],
                        ['zh_cn', CN_COMMENTS],
                        ['zh_tw', TW_COMMENTS],
                    ];
                    index = 0;
                    _h.label = 1;
                case 1:
                    if (!(index < 3)) return [3 /*break*/, 9];
                    langAndData = DATA[index];
                    LANG = langAndData[0];
                    FILE_CONTENT = langAndData[1].join(LF);
                    Deno.writeTextFileSync(index_ts_1.joinPath(GOAL_PATH, LANG + ".original.txt"), FILE_CONTENT, FILE_WRITE_MODE);
                    OTHER_FILENAME = index_ts_1.joinPath(GOAL_PATH, LANG + ".txt");
                    if (!!existsSync(OTHER_FILENAME)) return [3 /*break*/, 8];
                    _a = index;
                    switch (_a) {
                        case 0: return [3 /*break*/, 2];
                        case 1: return [3 /*break*/, 4];
                        case 2: return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 7];
                case 2:
                    // Deno.writeTextFileSync(
                    // 	OTHER_FILENAME,
                    // 	EN_BEFORE_TRANSLATE,
                    // 	FILE_WRITE_IF_NOT_EXIST_MODE,
                    // );
                    // console.log(EN_BEFORE_TRANSLATE);
                    _c = (_b = Deno).writeTextFileSync;
                    _d = [OTHER_FILENAME];
                    return [4 /*yield*/, translateByGoogleCore(EN_BEFORE_TRANSLATE, GOOGLE_TRANSLATE_LANG_CN, GOOGLE_TRANSLATE_LANG_EN)];
                case 3:
                    // Deno.writeTextFileSync(
                    // 	OTHER_FILENAME,
                    // 	EN_BEFORE_TRANSLATE,
                    // 	FILE_WRITE_IF_NOT_EXIST_MODE,
                    // );
                    // console.log(EN_BEFORE_TRANSLATE);
                    _c.apply(_b, _d.concat([(_h.sent())
                            .replaceAll(index_ts_1.ZH_CN_START_TAG, index_ts_1.EN_US_START_TAG)
                            .replaceAll(index_ts_1.ZH_CN_END_TAG, index_ts_1.EN_US_END_TAG)
                            .replace(EN_REPLACE_PATCH_FROM, EN_REPLACE_PATCH_TO), FILE_WRITE_IF_NOT_EXIST_MODE]));
                    return [3 /*break*/, 8];
                case 4:
                    Deno.writeTextFileSync(OTHER_FILENAME, FILE_CONTENT, FILE_WRITE_IF_NOT_EXIST_MODE);
                    return [3 /*break*/, 8];
                case 5:
                    // Deno.writeTextFileSync(
                    // 	OTHER_FILENAME,
                    // 	cn2tw(CN_COMMENTS.join(LF)),
                    // 	FILE_WRITE_IF_NOT_EXIST_MODE,
                    // );
                    // Deno.writeTextFileSync(
                    // 	OTHER_FILENAME,
                    // 	TW_BEFORE_TRANSLATE,
                    // 	FILE_WRITE_IF_NOT_EXIST_MODE,
                    // );
                    _f = (_e = Deno).writeTextFileSync;
                    _g = [OTHER_FILENAME];
                    return [4 /*yield*/, translateByGoogleCore(TW_BEFORE_TRANSLATE, GOOGLE_TRANSLATE_LANG_CN, GOOGLE_TRANSLATE_LANG_TW)];
                case 6:
                    // Deno.writeTextFileSync(
                    // 	OTHER_FILENAME,
                    // 	cn2tw(CN_COMMENTS.join(LF)),
                    // 	FILE_WRITE_IF_NOT_EXIST_MODE,
                    // );
                    // Deno.writeTextFileSync(
                    // 	OTHER_FILENAME,
                    // 	TW_BEFORE_TRANSLATE,
                    // 	FILE_WRITE_IF_NOT_EXIST_MODE,
                    // );
                    _f.apply(_e, _g.concat([_h.sent(), FILE_WRITE_IF_NOT_EXIST_MODE]));
                    return [3 /*break*/, 8];
                case 7: return [3 /*break*/, 8];
                case 8:
                    ++index;
                    return [3 /*break*/, 1];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function splitComments(sourceFilename, commentFilesPath) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            try {
                splitCommentCore(sourceFilename, commentFilesPath);
                return [2 /*return*/, true];
            }
            catch (e) {
                console.error(e);
                return [2 /*return*/, false];
            }
            return [2 /*return*/];
        });
    });
}
exports.splitComments = splitComments;
function getSplitResultFromGoalFileByLang(dir, lang) {
    var ARRAY = Deno.readTextFileSync(index_ts_1.joinPath(dir, lang + ".txt"))
        .substring(index_ts_1.START_TAG_LENGTH).replace(new RegExp("</" + lang + ">[\r\n]+<" + lang + ">", 'g'), index_ts_1.SPLIT_SEPARATOR)
        .split(index_ts_1.SPLIT_SEPARATOR);
    var MAX_INDEX = ARRAY.length - 1;
    ARRAY[MAX_INDEX] = ARRAY[MAX_INDEX].replace("</" + lang + ">", '');
    return ARRAY;
}
function joinComments(sourceFilename, commentFilesPath) {
    try {
        var fileInfo = Deno.statSync(sourceFilename);
        index_ts_1.assert(fileInfo.isFile);
        index_ts_1.assert(Deno.statSync(commentFilesPath).isDirectory);
        var SOURCE_CONTENT = Deno.readTextFileSync(sourceFilename);
        var BAK_FILENAME = sourceFilename.concat(getFilenameTimestampPostfix(), '.bak');
        if (!existsSync(BAK_FILENAME)) {
            Deno.writeTextFileSync(BAK_FILENAME, SOURCE_CONTENT);
        }
        var GOAL_PATH = index_ts_1.joinPath(commentFilesPath, sourceFilename.split(SEP).pop(), SEP);
        var US_COMMENTS = getSplitResultFromGoalFileByLang(GOAL_PATH, 'en_us');
        var CN_COMMENTS = getSplitResultFromGoalFileByLang(GOAL_PATH, 'zh_cn');
        var TW_COMMENTS = getSplitResultFromGoalFileByLang(GOAL_PATH, 'zh_tw');
        var CODES_ARRAY = SOURCE_CONTENT.replace(/((\<|\<\/)(en_us|zh_cn|zh_tw)\>)/g, index_ts_1.SPLIT_SEPARATOR)
            .split(index_ts_1.SPLIT_SEPARATOR);
        var COUNT = US_COMMENTS.length;
        console.log(CN_COMMENTS.length, TW_COMMENTS.length, COUNT);
        index_ts_1.assert(COUNT === CN_COMMENTS.length && COUNT === TW_COMMENTS.length);
        console.log('SOURCE_CONTENT\n', SOURCE_CONTENT, '\n', 'CODES_ARRAY\n', CODES_ARRAY, '\n', 'US_COMMENTS\n', US_COMMENTS, '\n', 'CN_COMMENTS\n', CN_COMMENTS, '\n', 'TW_COMMENTS\n', TW_COMMENTS, '\n', 'COUNT', COUNT, '\n');
        for (var i = 0; i < COUNT; ++i) {
            var OFFSET = 6 * i;
            CODES_ARRAY[OFFSET + 1] = "<en_us>" + US_COMMENTS[i] + "</en_us>";
            CODES_ARRAY[OFFSET + 3] = "<zh_cn>" + CN_COMMENTS[i] + "</zh_cn>";
            CODES_ARRAY[OFFSET + 5] = "<zh_tw>" + TW_COMMENTS[i] + "</zh_tw>";
        }
        console.log('CODES_ARRAY\n', CODES_ARRAY, '\n\n\n\n\n', '[END RESULT]\n', CODES_ARRAY.join(''), '\n');
        Deno.writeTextFileSync(sourceFilename, CODES_ARRAY.join(''));
        return true;
    }
    catch (e) {
        console.error(e);
        return false;
    }
}
exports.joinComments = joinComments;
function cn2trilingualCore(sourceFilename) {
    return __awaiter(this, void 0, void 0, function () {
        var SEG_COUNT_PER_ITEM, fileInfo, SOURCE_CONTENT, BAK_FILENAME, US_COMMENTS, CN_COMMENTS, TW_COMMENTS, CODES_ARRAY, LAST_ITEM_START_INDEX, i, CN_BEFORE_TRANSLATE, EN_BEFORE_TRANSLATE, TW_BEFORE_TRANSLATE, EN_FULL_CONTENT, TW_FULL_CONTENT, COUNT, i, OFFSET;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    SEG_COUNT_PER_ITEM = 6;
                    fileInfo = Deno.statSync(sourceFilename);
                    index_ts_1.assert(fileInfo.isFile);
                    SOURCE_CONTENT = Deno.readTextFileSync(sourceFilename);
                    BAK_FILENAME = sourceFilename.concat(getFilenameTimestampPostfix(), '.bak');
                    if (!existsSync(BAK_FILENAME)) {
                        Deno.writeTextFileSync(BAK_FILENAME, SOURCE_CONTENT);
                    }
                    US_COMMENTS = [];
                    CN_COMMENTS = [];
                    TW_COMMENTS = [];
                    CODES_ARRAY = SOURCE_CONTENT
                        .replace(/((\<|\<\/)(en_us|zh_cn|zh_tw)\>)/g, index_ts_1.SPLIT_SEPARATOR)
                        .split(index_ts_1.SPLIT_SEPARATOR);
                    LAST_ITEM_START_INDEX = CODES_ARRAY.length - SEG_COUNT_PER_ITEM;
                    for (i = 0; i < LAST_ITEM_START_INDEX; i += SEG_COUNT_PER_ITEM) {
                        // US_COMMENTS.push(`<en_us>${CODES_ARRAY[i + 1]}</en_us>`);
                        CN_COMMENTS.push("<zh_cn>" + CODES_ARRAY[i + 3] + "</zh_cn>");
                        // TW_COMMENTS.push(`<zh_tw>${CODES_ARRAY[i + 5]}</zh_tw>`);
                    }
                    CN_BEFORE_TRANSLATE = CN_COMMENTS.join(LF);
                    EN_BEFORE_TRANSLATE = CN_BEFORE_TRANSLATE;
                    TW_BEFORE_TRANSLATE = CN_BEFORE_TRANSLATE
                        .replaceAll(index_ts_1.ZH_CN_START_TAG, index_ts_1.ZH_TW_START_TAG)
                        .replaceAll(index_ts_1.ZH_CN_END_TAG, index_ts_1.ZH_TW_END_TAG);
                    US_COMMENTS.length = 0;
                    // CN_COMMENTS.length = 0;
                    TW_COMMENTS.length = 0;
                    return [4 /*yield*/, translateByGoogleCore(EN_BEFORE_TRANSLATE, GOOGLE_TRANSLATE_LANG_CN, GOOGLE_TRANSLATE_LANG_EN)];
                case 1:
                    EN_FULL_CONTENT = (_a.sent()).replaceAll(index_ts_1.ZH_CN_START_TAG, index_ts_1.EN_US_START_TAG)
                        .replaceAll(index_ts_1.ZH_CN_END_TAG, index_ts_1.EN_US_END_TAG)
                        .replace(EN_REPLACE_PATCH_FROM, EN_REPLACE_PATCH_TO);
                    EN_FULL_CONTENT
                        .substring(index_ts_1.START_TAG_LENGTH, EN_FULL_CONTENT.length - index_ts_1.START_TAG_LENGTH - 1)
                        .replace(/<\/en_us>\n<en_us>/g, index_ts_1.SPLIT_SEPARATOR)
                        .split(index_ts_1.SPLIT_SEPARATOR).forEach(function (item) { return US_COMMENTS.push(item); });
                    return [4 /*yield*/, translateByGoogleCore(TW_BEFORE_TRANSLATE, GOOGLE_TRANSLATE_LANG_CN, GOOGLE_TRANSLATE_LANG_TW)];
                case 2:
                    TW_FULL_CONTENT = _a.sent();
                    // console.log('TW_FULL_CONTENT', TW_FULL_CONTENT);
                    TW_FULL_CONTENT
                        .substring(index_ts_1.START_TAG_LENGTH, TW_FULL_CONTENT.length - index_ts_1.START_TAG_LENGTH - 1)
                        .replace(/<\/zh_tw>\n<zh_tw>/g, index_ts_1.SPLIT_SEPARATOR)
                        .split(index_ts_1.SPLIT_SEPARATOR).forEach(function (item) { return TW_COMMENTS.push(item); });
                    COUNT = US_COMMENTS.length;
                    for (i = 0; i < COUNT; ++i) {
                        OFFSET = SEG_COUNT_PER_ITEM * i;
                        CODES_ARRAY[OFFSET + 1] = "<en_us>" + US_COMMENTS[i] + "</en_us>";
                        // CODES_ARRAY[OFFSET + 3] = `<zh_cn>${CN_COMMENTS[i]}</zh_cn>`;
                        CODES_ARRAY[OFFSET + 3] = "" + CN_COMMENTS[i];
                        CODES_ARRAY[OFFSET + 5] = "<zh_tw>" + TW_COMMENTS[i] + "</zh_tw>";
                    }
                    Deno.writeTextFileSync(sourceFilename, CODES_ARRAY.join(''));
                    return [2 /*return*/];
            }
        });
    });
}
function cn2trilingual(sourceFilenames) {
    return __awaiter(this, void 0, Promise, function () {
        var COUNT, i, SOURCE_FILENAME, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    COUNT = sourceFilenames.length;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < COUNT)) return [3 /*break*/, 6];
                    SOURCE_FILENAME = sourceFilenames[i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, cn2trilingualCore(SOURCE_FILENAME)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_2 = _a.sent();
                    console.error(SOURCE_FILENAME, e_2);
                    return [2 /*return*/, false];
                case 5:
                    ++i;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, true];
            }
        });
    });
}
exports.cn2trilingual = cn2trilingual;
function removeLangSeg(source, lang) {
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
        .replace(new RegExp("[\\r\\n]+(([\\#]+[\\ \\t]+)|([\\ \\t]*\\/\\/[\\ \\t]*)|([\\ \\t]*\\*[\\ \\t]*))<" + lang + ">", 'g'), "<" + lang + ">")
        .replace(new RegExp("</" + lang + ">", 'g'), '\0'.concat("</" + lang + ">"))
        .replace(new RegExp("<" + lang + "[^\0]+\0</" + lang + ">", 'g'), '');
}
function keepByLang(source, lang, keepLangTag) {
    var result = source;
    switch (lang) {
        case 'en_us':
            break;
        case 'zh_cn':
            result = result
                .replace(new RegExp("([\\r\\n]+(([\\#]+[\\ \\t]+)|([\\ \\t]*\\/\\/[\\ \\t]*)|([\\ \\t]*\\*[\\ \\t]*)))<en_us>[^\r\n]+</en_us><" + lang + ">", 'g'), "$1<" + lang + ">");
            break;
        case 'zh_tw':
            result = result
                .replace(new RegExp("([\\r\\n]+(([\\#]+[\\ \\t]+)|([\\ \\t]*\\/\\/[\\ \\t]*)|([\\ \\t]*\\*[\\ \\t]*)))<en_us>[^\r\n]+</en_us><zh_cn>[^\r\n]+</zh_cn><" + lang + ">", 'g'), "$1<" + lang + ">");
            break;
        default:
            break;
    }
    ['en_us', 'zh_cn', 'zh_tw'].filter(function (one) { return one !== lang; }).forEach(function (removeLang) {
        result = removeLangSeg(result, removeLang);
    });
    if (!keepLangTag) {
        result = result.replace(new RegExp("(<|</)" + lang + ">", 'g'), '');
    }
    return result;
}
function splitReadmeFiles(keepLangTag, sourceFilenames) {
    var COUNT = sourceFilenames.length;
    var _loop_2 = function (i) {
        var SOURCE_FILENAME = sourceFilenames[i];
        try {
            var SOURCE_CONTENT_1 = Deno.readTextFileSync(SOURCE_FILENAME);
            // console.log('SOURCE_CONTENT', SOURCE_CONTENT);
            // console.log('en_us', removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'zh_cn'), 'zh_tw'));
            // console.log('zh_cn', removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'en_us'), 'zh_tw'));
            // console.log('zh_tw', removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'en_us'), 'zh_cn'));
            var GOAL_FILENAME_PREFIX_1 = SOURCE_FILENAME.substring(0, SOURCE_FILENAME.toLowerCase().lastIndexOf('readme.md'));
            // Deno.writeTextFileSync(GOAL_FILENAME_PREFIX.concat('README.en_us.md'), removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'zh_cn'), 'zh_tw'));
            // Deno.writeTextFileSync(GOAL_FILENAME_PREFIX.concat('README.zh_cn.md'), removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'en_us'), 'zh_tw'));
            // Deno.writeTextFileSync(GOAL_FILENAME_PREFIX.concat('README.zh_tw.md'), removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'en_us'), 'zh_cn'));
            ['en_us', 'zh_cn', 'zh_tw'].forEach(function (lang) {
                Deno.writeTextFileSync(GOAL_FILENAME_PREFIX_1.concat("README." + lang + ".md"), keepByLang(SOURCE_CONTENT_1, lang, keepLangTag));
            });
        }
        catch (e) {
            console.error(SOURCE_FILENAME, e);
            return { value: false };
        }
    };
    for (var i = 0; i < COUNT; ++i) {
        var state_2 = _loop_2(i);
        if (typeof state_2 === "object")
            return state_2.value;
    }
    return true;
}
exports.splitReadmeFiles = splitReadmeFiles;
function splitFiles(keepLangTag, sourceFilenames) {
    var _a;
    var COUNT = sourceFilenames.length;
    var _loop_3 = function (i) {
        var SOURCE_FILENAME = sourceFilenames[i];
        try {
            var SOURCE_FILENAME_SPLIT_RESULT = SOURCE_FILENAME.split(SEP);
            var FILENAME_1 = SOURCE_FILENAME_SPLIT_RESULT.pop();
            var GOAL_PATH_1 = index_ts_1.joinPath(SOURCE_FILENAME_SPLIT_RESULT.join(SEP), 'i18n');
            switch ((_a = FILENAME_1.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) {
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
                    var SOURCE_CONTENT = Deno.readTextFileSync(SOURCE_FILENAME);
                    [
                        ['en_us', removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'zh_cn'), 'zh_tw')],
                        ['zh_cn', removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'en_us'), 'zh_tw')],
                        ['zh_tw', removeLangSeg(removeLangSeg(SOURCE_CONTENT, 'en_us'), 'zh_cn')],
                    ].forEach(function (_a) {
                        var lang = _a[0], content = _a[1];
                        var PATH = index_ts_1.joinPath(GOAL_PATH_1, lang);
                        Deno.mkdirSync(PATH, { recursive: true });
                        Deno.writeTextFileSync(index_ts_1.joinPath(PATH, FILENAME_1), content);
                    });
                    break;
                default:
                    ['en_us', 'zh_cn', 'zh_tw'].forEach(function (lang) {
                        var PATH = index_ts_1.joinPath(GOAL_PATH_1, lang);
                        Deno.mkdirSync(PATH, { recursive: true });
                        Deno.copyFileSync(SOURCE_FILENAME, index_ts_1.joinPath(PATH, FILENAME_1));
                    });
                    break;
            }
        }
        catch (e) {
            console.error(SOURCE_FILENAME, e);
            return { value: false };
        }
    };
    for (var i = 0; i < COUNT; ++i) {
        var state_3 = _loop_3(i);
        if (typeof state_3 === "object")
            return state_3.value;
    }
    return true;
}
exports.splitFiles = splitFiles;
// (async () => {
// 	const START_DATE = new Date();
// 	const [command, source, ...others] = Deno.args;
// 	switch (command) {
// 		case 'splitComments':
// 			console.log(await splitComments(source, others[0]));
// 			break;
// 		case 'joinComments':
// 			console.log(joinComments(source, others[0]));
// 			break;
// 		case 'cn2trilingual':
// 			console.log(await cn2trilingual([source, ...others]));
// 			break;
// 		case 'splitReadmeFiles':
// 			console.log(splitReadmeFiles(source === 'true', [...others]));
// 			break;
// 		case 'splitFiles':
// 			console.log(splitFiles(source === 'true', [...others]));
// 			break;
// 		default:
// 			break;
// 	}
// 	const END_DATE = new Date();
// 	const USED_MILLISECONDS: number = END_DATE.getTime() - START_DATE.getTime();
// 	console.log(
// 		'Used',
// 		USED_MILLISECONDS,
// 		'milliseconds, it is equivalent to ',
// 		parseFloat((USED_MILLISECONDS / 1000).toFixed(4)),
// 		'seconds.',
// 	);
// })();
// console.log('before showHelpOrVersionOrCallbackAndShowUsedTime()');
index_ts_2.showHelpOrVersionOrCallbackAndShowUsedTime('test', '0.0.1', 2, function () { return __awaiter(void 0, void 0, void 0, function () {
    var command, source, others, _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                command = index_ts_1.commandLineArgs[0], source = index_ts_1.commandLineArgs[1], others = index_ts_1.commandLineArgs.slice(2);
                _a = command;
                switch (_a) {
                    case 'splitComments': return [3 /*break*/, 1];
                    case 'joinComments': return [3 /*break*/, 3];
                    case 'cn2trilingual': return [3 /*break*/, 4];
                    case 'splitReadmeFiles': return [3 /*break*/, 6];
                    case 'splitFiles': return [3 /*break*/, 7];
                }
                return [3 /*break*/, 8];
            case 1:
                _c = (_b = console).log;
                return [4 /*yield*/, splitComments(source, others[0])];
            case 2:
                _c.apply(_b, [_f.sent()]);
                return [3 /*break*/, 9];
            case 3:
                console.log(joinComments(source, others[0]));
                return [3 /*break*/, 9];
            case 4:
                _e = (_d = console).log;
                return [4 /*yield*/, cn2trilingual(__spreadArrays([source], others))];
            case 5:
                _e.apply(_d, [_f.sent()]);
                return [3 /*break*/, 9];
            case 6:
                console.log(splitReadmeFiles(source === 'true', __spreadArrays(others)));
                return [3 /*break*/, 9];
            case 7:
                console.log(splitFiles(source === 'true', __spreadArrays(others)));
                return [3 /*break*/, 9];
            case 8: return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
// console.log('after showHelpOrVersionOrCallbackAndShowUsedTime()');
