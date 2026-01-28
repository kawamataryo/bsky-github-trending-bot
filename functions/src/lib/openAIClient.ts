import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { GHTrend } from "../types/types.js";

export class OpenAIClient {
  private openai: ReturnType<typeof createOpenAI>;

  constructor(openAIApiKey: string) {
    this.openai = createOpenAI({ apiKey: openAIApiKey });
  }

  async summarize(trend: GHTrend): Promise<string> {
    const readme = await this.getReadmeText({
      owner: trend.owner,
      repository: trend.repository,
    });

    if (!readme) {
      return "";
    }

    try {
      console.log("Calling OpenAI API...");
      const { text } = await generateText({
        model: this.openai("gpt-5-nano"),
        system:
          "You are a professional summarizer. Provide a very concise summary in 1-2 sentences. Keep the summary under 200 tokens.",
        prompt: readme,
        providerOptions: {
          openai: {
            reasoningEffort: "minimal",
          },
        },
      });
      console.log("API Result:", JSON.stringify(text, null, 2));
      return text;
    } catch (e) {
      console.error("OpenAI Error:", e);
      throw e;
    }
  }

  private async getReadmeText({
    owner,
    repository,
  }: Pick<GHTrend, "owner" | "repository">): Promise<string> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repository}/readme`,
      );
      if (!response.ok) {
        return "";
      }
      const data = await response.json();
      const readmeBuffer = data.content;
      return Buffer.from(readmeBuffer, "base64").toString("utf-8");
    } catch (e) {
      console.error(e);
      return "";
    }
  }
}
