import { OpenAI } from "langchain/llms/openai";
import { loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { GHTrend } from "../types/types";

export class OpenAIClient {
  private model: OpenAI;

  constructor(openAIApiKey: string) {
    this.model = new OpenAI({
      openAIApiKey,
      temperature: 0,
      modelName: "gpt-3.5-turbo",
    });
  }

  async complete(prompt: string) {
    return await this.model.call(prompt);
  }

  async summarize(trend: GHTrend): Promise<string> {
    const summarizationChain = loadSummarizationChain(this.model, {
      type: "map_reduce",
    });
    const docs = await this.getWebpageTextDocs({
      owner: trend.owner,
      repository: trend.repository,
    });

    try {
      const res = await summarizationChain.call({
        input_documents: docs,
      });
      return res.text;
    } catch (e) {
      console.error(e);
      return "";
    }
  }

  async getWebpageTextDocs({
    owner,
    repository,
  }: Pick<GHTrend, "owner" | "repository">) {
    const readmeBuffer = (
      await (
        await fetch(
          `https://api.github.com/repos/${owner}/${repository}/readme`
        )
      ).json()
    ).content;
    const readme = Buffer.from(readmeBuffer, "base64").toString("utf-8");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
    });
    const docs = await splitter.createDocuments([readme]);
    return docs;
  }
}
