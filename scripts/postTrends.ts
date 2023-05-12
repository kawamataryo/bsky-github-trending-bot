import { initializeApp }  from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import * as dotenv from "dotenv";
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
};

const app = initializeApp(firebaseConfig);

(async () => {
  const functions = getFunctions(app);
  const postGithubTrends = httpsCallable(functions, "callable-postGitHubTrends")
  try {
    const result = await postGithubTrends({data: {}})
    console.log(result);
  } catch (e) {
    console.error(e)
  }
})()
