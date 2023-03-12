import path from "path";
export const IGNORED = ["**/node_modules/**", "**/coverage/**", "**/auto-unit-test/**"];
export const getDocFilePath = (filePath, extension) => filePath.replace(`.${extension}`, ".md");
export const getTestFilePath = (filePath, extension) => filePath.replace(`.${extension}`, ".test.js");
export const getTestCoverageDirectory = (filePath, extension) => filePath.replace(`.${extension}`, "-coverage");
export const getCoverageFilePath = (filePath, extension) => path.join(process.cwd(), getTestCoverageDirectory(filePath, extension), "coverage-summary.json");
export const getPromptHistoryFilePath = (filePath, extension) => filePath.replace(`.${extension}`, "-prompt-history.json");
