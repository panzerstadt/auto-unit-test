var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import path from "path";
import { ask, continueConversation } from "../api/index.mjs";
import { getLang } from "../utils.mjs";
export function generateTests(filePath, input, extension = "js") {
    return __awaiter(this, void 0, void 0, function* () {
        const baseName = path.basename(filePath);
        const prompt = `// ${getLang(extension)}
    // write unit tests for the following function that will work for
    // the jest testing framework.
    // Assume that the function is exported as a default export, and name the function testFunction
    // Assume that the reply is a valid ${getLang(extension)} file
    // the tests have to achieve 100% test coverage
    // the tests should additionally cover edge cases, and should be as comprehensive as possible
    // if you ever need to add any comments, please prefix them with '//' to ensure your response is still valid ${getLang(extension)} code
  
    ${input}
    
    // in your reply, start with the following:
    const testFunction = require("./${baseName}');
    `;
        console.log("prompt sent", prompt);
        const { reply, history } = yield ask(prompt);
        return { tests: reply, history };
    });
}
export function generateAdditionalTests(promptHistory) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `the given tests are not 100% coverage yet. please add more tests. you don't have to repeat yourself, as i will append your reply to the previous code. please also continue to only reply in valid code, if you feel the need to add any comments, please also prefix them with '//' to ensure your response is valid code`;
        const { reply, history } = yield continueConversation(prompt, promptHistory);
        return { tests: reply, history };
    });
}
