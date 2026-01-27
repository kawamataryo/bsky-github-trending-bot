import { OpenAISummarizeAdapter } from "@tanstack/ai-openai";
import { GHTrend } from "../types/types";

export class OpenAIClient {
  private openAIApiKey: string;

  constructor(openAIApiKey: string) {
    this.openAIApiKey = openAIApiKey;
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
      const adapter = new OpenAISummarizeAdapter(
        { apiKey: this.openAIApiKey },
        "gpt-4.1-nano",
      );
      const result = await adapter.summarize({
        model: "gpt-4.1-nano",
        text: readme,
        maxLength: 200,
        style: "concise",
      });
      return result.summary;
    } catch (e) {
      console.error(e);
      return "";
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
