import { test, expect, describe, vi, afterEach } from "vitest";
import { OpenAIClient } from "./openAIClient.js";

describe("openAIClient", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test("summarize returns empty string when readme fetch fails", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
    });
    vi.stubGlobal("fetch", mockFetch);

    const client = new OpenAIClient("test-api-key");
    const result = await client.summarize({
      owner: "kawamataryo",
      repository: "bsky-github-trending-bot",
      language: "TypeScript",
      description: "A bot",
      starCount: 100,
      forkCount: 10,
      todayStarCount: 50,
      ownersTwitterAccount: "",
      url: "https://github.com/kawamataryo/bsky-github-trending-bot",
    });

    expect(result).toBe("");
  });
});
