export declare function splitComments(sourceFilename: string, commentFilesPath: string): Promise<boolean>;
export declare function joinComments(sourceFilename: string, commentFilesPath: string): boolean;
export declare function cn2trilingual(sourceFilenames: string[]): Promise<boolean>;
export declare function splitReadmeFiles(keepLangTag: boolean, sourceFilenames: string[]): boolean;
export declare function splitFiles(keepLangTag: boolean, sourceFilenames: string[]): boolean;
