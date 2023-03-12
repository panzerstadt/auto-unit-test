import { getTestCoverageDirectory, getTestFilePath } from "../constants.mjs";
import jest from "jest";

export async function runTests(filePath, extension = "js"): Promise<boolean> {
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
  const { results } = await jest.runCLI(options, options.projects);

  if (results.testResults.length === 0) {
    console.warn("No tests were run.");
    return false;
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
    return false;
  }
  return true;
}
