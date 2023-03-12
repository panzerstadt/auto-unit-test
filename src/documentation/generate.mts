import { openai } from "../api/index.mjs";

export async function generateDocs(input: string) {
  const prompt = `Generate professional documentation, and include example usage patterns for the following code: "${input}"`;
  const completions = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });
  const generatedTests = completions.data.choices[0].message.content || "";
  return generatedTests;
}
