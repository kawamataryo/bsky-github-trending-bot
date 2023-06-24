import { OpenAI } from "langchain/llms/openai";
import { loadSummarizationChain } from "langchain/chains";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";

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

  async summarize(url: string): Promise<string> {
    const summarizationChain = loadSummarizationChain(this.model, {
      type: "map_reduce",
    });
    const docs = await this.getWebpageTextDocs(url);

    try {
      const res = await summarizationChain.call({
        input_documents: docs,
      });
      console.info("🚀 ~ summarize result", res.text);
      return res.text;
    } catch (e) {
      console.error(e);
      return "";
    }
  }

  private async getWebpageTextDocs(url: string) {
    const loader = new CheerioWebBaseLoader(url, {
      selector: "#readme",
    });
    return await loader.loadAndSplit();
  }
}
