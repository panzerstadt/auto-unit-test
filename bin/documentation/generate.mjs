var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { openai } from "../api/index.mjs";
export function generateDocs(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `Generate professional documentation, and include example usage patterns for the following code: "${input}"`;
        const completions = yield openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });
        const generatedTests = completions.data.choices[0].message.content || "";
        return generatedTests;
    });
}
