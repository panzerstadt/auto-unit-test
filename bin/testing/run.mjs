var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getTestCoverageDirectory, getTestFilePath } from "../constants.mjs";
import jest from "jest";
export function runTests(filePath, extension = "js") {
    return __awaiter(this, void 0, void 0, function* () {
        const testFilePath = getTestFilePath(filePath, extension);
        const testCoverageDirectory = getTestCoverageDirectory(filePath, extension);
        const options = {
            projects: [process.cwd()],
            silent: true,
            coverage: true,
            coverageReporters: ["json-summary", "text"],
            coverageDirectory: testCoverageDirectory,
            testRegex: testFilePath,
            passWithNoTests: true,
        };
        // @ts-ignore
        const { results } = yield jest.runCLI(options, options.projects);
        if (results.testResults.length === 0) {
            console.warn("No tests were run.");
            return;
        }
        const resultJSON = results.testResults[0].testResults;
        console.log("\nresults:\n-----------");
        resultJSON.forEach((res) => {
            const passed = res.status === "passed";
            console.log(`${passed ? "✓" : "✘"} ${res.status}: ${res.fullName}`);
        });
        const hasFailures = resultJSON.some((res) => res.status !== "passed");
        if (hasFailures) {
            console.warn("\nOne or more tests failed, please fix them before continuing.");
        }
    });
}
