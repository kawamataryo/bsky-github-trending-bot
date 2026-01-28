/**
 * 投稿テキスト生成のテストスクリプト
 *
 * 使い方:
 *   npm run test:post [language] [--summary]
 *
 * 例:
 *   npm run test:post           # 全言語のトレンド
 *   npm run test:post ts        # TypeScript
 *   npm run test:post js        # JavaScript
 *   npm run test:post python    # Python
 *   npm run test:post ts --summary  # サマリーも取得
 */

import { GHTrendScraper } from "../lib/src/lib/ghTrendScraper.js";
import { createPostText } from "../lib/src/lib/bskyService.js";
import { OpenAIClient } from "../lib/src/lib/openAIClient.js";

const LANGUAGE_MAP = {
  ts: "/typescript",
  typescript: "/typescript",
  js: "/javascript",
  javascript: "/javascript",
  python: "/python",
  py: "/python",
  rust: "/rust",
  go: "/go",
  java: "/java",
  cpp: "/c++",
  c: "/c",
  ruby: "/ruby",
  swift: "/swift",
  kotlin: "/kotlin",
  all: "",
};

async function main() {
  const args = process.argv.slice(2);
  const langArg = args.find((arg) => !arg.startsWith("--")) || "all";
  const withSummary = args.includes("--summary");

  const langParam = LANGUAGE_MAP[langArg.toLowerCase()] ?? `/${langArg}`;

  console.log(`\n📊 Fetching GitHub Trending${langParam || " (all)"}...\n`);

  const trends = await GHTrendScraper.scraping(langParam);

  if (trends.length === 0) {
    console.log("No trends found.");
    return;
  }

  console.log(`Found ${trends.length} trending repositories.\n`);
  console.log("=".repeat(60));

  for (let i = 0; i < Math.min(3, trends.length); i++) {
    const trend = trends[i];
    const postText = createPostText(trend);

    console.log(`\n[${i + 1}] ${trend.owner}/${trend.repository}`);
    console.log("-".repeat(60));
    console.log("📝 Post Text:");
    console.log(postText);
    console.log(`\n📏 Length: ${postText.length} chars`);

    if (withSummary) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.log("\n⚠️  OPENAI_API_KEY not set. Skipping summary.");
      } else {
        console.log("\n🤖 Generating summary...");
        const client = new OpenAIClient(apiKey);
        const summary = await client.summarize(trend);
        console.log("📝 Summary:");
        console.log(summary || "(empty)");
      }
    }

    console.log("\n" + "=".repeat(60));
  }
}

main().catch(console.error);
