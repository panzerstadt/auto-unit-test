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
import { openai } from "../api/index.mjs";
export function generateTests(filePath, input, extension = "js") {
    return __awaiter(this, void 0, void 0, function* () {
        const baseName = path.basename(filePath);
        const getLang = (extension) => {
            switch (extension) {
                case "js":
                    return "javascript";
                case "ts":
                    return "typescript";
                case "mjs":
                    return "javascript";
                case "mts":
                    return "typescript";
                case "jsx":
                    return "javascript react";
                case "tsx":
                    return "typescript react";
                default:
                    return "javascript";
            }
        };
        const prompt = `// ${getLang(extension)}
    // write unit tests for the following function that will work for
    // the jest testing framework.
    // Assume that the function is exported as a default export, and name the function testFunction
    // Assume that the reply is a valid ${getLang(extension)} file
    // the tests have to achieve 100% test coverage
    // the tests should additionally cover edge cases, and should be as comprehensive as possible
    // if you ever need to add any comments, please prefix them with '//' to ensure your reponse is still valid ${getLang(extension)} code
  
    ${input}
    
    // in your reply, start with the following:
    const testFunction = require("./${baseName}');
    `;
        console.log("prompt sent", prompt);
        const initialMessage = { role: "user", content: prompt };
        const completions = yield openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [initialMessage],
            temperature: 0,
        });
        const generatedTests = completions.data.choices[0].message.content || "";
        return { tests: generatedTests, messages: [initialMessage] };
    });
}
export function generateAdditionalTests(testFilePath, promptHistory) {
    return __awaiter(this, void 0, void 0, function* () {
        // const prompt =
        console.log("TODO: generate additional tests");
        console.log("filepath", testFilePath);
        console.log("prompts so far", promptHistory);
    });
}
