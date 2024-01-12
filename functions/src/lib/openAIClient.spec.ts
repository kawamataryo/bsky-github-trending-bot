import { test, expect, describe, vi, afterEach } from 'vitest';
import { OpenAIClient } from './openAIClient';

describe('openAIClient', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('getWebpageTextDocs', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => ({
        content: btoa("example readme")
      })
    })
    vi.stubGlobal("fetch", mockFetch)

    const client = new OpenAIClient("sss");
    const result = await client.getWebpageTextDocs({
      owner: "kawamataryo",
      repository: "bsky-github-trending-bot",
    })

    expect(result instanceof Array).toBe(true)
    expect(result[0].pageContent).toBe("example readme")
  })
})
