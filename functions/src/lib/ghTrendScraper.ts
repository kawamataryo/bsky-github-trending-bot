import { parse, HTMLElement } from "node-html-parser";
import { GHTrend } from "../types/types";

export class GHTrendScraper {
  static async scraping(params = ""): Promise<GHTrend[]> {
    const res = await fetch(`https://github.com/trending${params}`);
    const dom = parse(await res.text());
    const rows = dom.querySelectorAll(".Box-row");

    return await Promise.all(
      rows.map(async (row) => {
        const { owner, repository } = GHTrendScraper.getOwnerAndRepoName(row);
        const { description } = GHTrendScraper.getDescription(row);
        const { starCount } = GHTrendScraper.getStarCount(row);
        const { forkCount } = GHTrendScraper.getForkCount(row);
        const { todayStarCount } = GHTrendScraper.getTodayStarCount(row);
        const { language } = GHTrendScraper.getLanguage(row);
        const { ownersTwitterAccount } =
          await GHTrendScraper.getOwnersTwitterAccount(owner);

        return {
          owner,
          repository,
          language: language ?? "",
          description: description ?? "",
          starCount,
          forkCount,
          todayStarCount,
          ownersTwitterAccount: ownersTwitterAccount ?? "",
          url: `https://github.com/${owner}/${repository}`,
        };
      })
    );
  }

  private static getOwnerAndRepoName(dom: HTMLElement) {
    const path = dom.querySelector("> h2 a")!.attributes.href;
    const result = path.split("/");
    return {
      owner: result[1],
      repository: result[2],
    };
  }

  private static async getOwnersTwitterAccount(owner?: string) {
    if (!owner) {
      return {
        ownersTwitterAccount: null,
      };
    }
    const res = await fetch(`https://github.com/${owner}`);
    const dom = parse(await res.text());
    const ownersTwitterAccount = dom
      .querySelector(".vcard-details a[href^=\"https://twitter.com\"]")
      ?.innerText.trim();
    return {
      ownersTwitterAccount,
    };
  }

  private static getDescription(dom: HTMLElement) {
    const description = dom.querySelector("> p")?.innerText.trim();
    return {
      description,
    };
  }

  private static getStarCount(dom: HTMLElement) {
    const starCount = dom
      .querySelector("a[href$=\"stargazers\"]")
      ?.innerText.trim();
    return {
      starCount: starCount ? this.strToNumber(starCount) : 0,
    };
  }

  private static getForkCount(dom: HTMLElement) {
    const forkCount = dom.querySelector("a[href*=\"forks\"]")?.innerText.trim();
    return {
      forkCount: forkCount ? this.strToNumber(forkCount) : 0,
    };
  }

  private static getTodayStarCount(dom: HTMLElement) {
    const text = dom.querySelector("span.float-sm-right")?.innerText.trim();
    return {
      todayStarCount: text ? this.strToNumber(text?.split(/\s/)[0]) : 0,
    };
  }

  private static getLanguage(dom: HTMLElement) {
    const language = dom
      .querySelector("[itemprop=\"programmingLanguage\"]")
      ?.innerText.trim();
    return {
      language,
    };
  }

  private static strToNumber(str: string) {
    return Number(str.replace(/,/g, ""));
  }
}
