import { BskyClient } from "../functions/src/lib/bskyClient"
import yargs from "yargs";

const searchUserByName = async (name: string) => {
  const agent = await BskyClient.createAgent({
    identifier: process.env.BLUESKY_IDENTIFIER!,
    password: process.env.BLUESKY_PASSWORD!,
  })

  const result =  await agent.agent.searchActors({
    term: name,
    limit: 1,
  })
  console.log("🚀 ~ file: searchBskyUser.ts:14 ~ searchUserByName ~ result:", result.data.actors)
}


(async () => {
  const args = yargs.options({
    name: {
      type: "string",
      demandOption: true,
      describe: "user name",
      require: true,
      alias: "n",
    },
  }).parseSync()

  await searchUserByName(args.name)
})()
