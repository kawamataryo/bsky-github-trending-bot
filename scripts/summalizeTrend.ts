import { OpenAIClient } from "../functions/src/lib/openAIClient";
import { GHTrend } from "../functions/src/types/types";


(async () => {
  const client = new OpenAIClient(process.env.OPEN_AI_KEY!)
  const trend: GHTrend = {
    owner: "KingsGambitLab",
    repository: "Lecture_Notes",
    language: "HTML",
    description: "This repository is there to store the combined lecture notes of all the lectures. We are using markdown to write the lecture notes.",
    starCount: 88,
    forkCount: 8,
    todayStarCount: 8,
    ownersTwitterAccount: "",
    url: "https://github.com/KingsGambitLab/Lecture_Notes",
  }
  console.log(await client.summarize(trend))
})()
