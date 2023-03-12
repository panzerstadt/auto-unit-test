import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(configuration);

export const ask = async (question: string) => {
  const initialMessage = { role: "user", content: question } as ChatCompletionRequestMessage;

  const completions = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [initialMessage],
    temperature: 0,
  });

  const reply = completions.data.choices[0].message.content || "";
  const nextHistory = [
    initialMessage,
    { role: "assistant", content: reply },
  ] as ChatCompletionRequestMessage[];

  return {
    reply,
    history: nextHistory,
  };
};

export const continueConversation = async (
  question: string,
  promptHistory: ChatCompletionRequestMessage[]
) => {
  const userQuestion = { role: "user", content: question } as ChatCompletionRequestMessage;

  const completions = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [...promptHistory, userQuestion],
    temperature: 0,
  });

  const reply = completions.data.choices[0].message.content || "";
  const nextHistory = [
    ...promptHistory,
    userQuestion,
    { role: "assistant", content: reply },
  ] as ChatCompletionRequestMessage[];

  return {
    reply,
    history: nextHistory,
  };
};
