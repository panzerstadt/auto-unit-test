var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createRequire } from "module";
const require = createRequire(import.meta.url);
export function hasEnoughTestCoverage(coverageJsonFilePath, minimumCoverage = 80) {
    return __awaiter(this, void 0, void 0, function* () {
        const cov = require(coverageJsonFilePath);
        const { lines, statements, functions, branches } = cov.total;
        if (lines.pct < minimumCoverage)
            return false;
        if (statements.pct < minimumCoverage)
            return false;
        if (functions.pct < minimumCoverage)
            return false;
        if (branches.pct < minimumCoverage)
            return false;
        return true;
    });
}
