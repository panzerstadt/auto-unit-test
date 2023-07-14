var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "node:fs/promises";
import { getPromptHistoryFilePath } from "./constants.mjs";
export const savePromptHistory = (filePath, messages) => __awaiter(void 0, void 0, void 0, function* () { return yield fs.writeFile(filePath, JSON.stringify(messages, null, 2)); });
export const loadPromptHistory = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const promptHistoryString = yield fs.readFile(getPromptHistoryFilePath(filePath, "js"), "utf8");
    return JSON.parse(promptHistoryString);
});
export const getLang = (extension) => {
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
