var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(configuration);
export const ask = (question) => __awaiter(void 0, void 0, void 0, function* () {
    const initialMessage = { role: "user", content: question };
    const completions = yield openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [initialMessage],
        temperature: 0,
    });
    const reply = completions.data.choices[0].message.content || "";
    const nextHistory = [
        initialMessage,
        { role: "assistant", content: reply },
    ];
    return {
        reply,
        history: nextHistory,
    };
});
export const continueConversation = (question, promptHistory) => __awaiter(void 0, void 0, void 0, function* () {
    const userQuestion = { role: "user", content: question };
    const completions = yield openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [...promptHistory, userQuestion],
        temperature: 0,
    });
    const reply = completions.data.choices[0].message.content || "";
    const nextHistory = [
        ...promptHistory,
        userQuestion,
        { role: "assistant", content: reply },
    ];
    return {
        reply,
        history: nextHistory,
    };
});
