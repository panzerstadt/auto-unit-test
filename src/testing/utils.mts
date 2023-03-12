import { createRequire } from "module";
const require = createRequire(import.meta.url);

export async function hasEnoughTestCoverage(coverageJsonFilePath: string, minimumCoverage = 80) {
  const cov = require(coverageJsonFilePath);
  const { lines, statements, functions, branches } = cov.total;

  if (lines.pct < minimumCoverage) return false;
  if (statements.pct < minimumCoverage) return false;
  if (functions.pct < minimumCoverage) return false;
  if (branches.pct !== 0 && branches.pct < minimumCoverage) return false; // 0 means the function has no branches, not that there is no coverage
  return true;
}
