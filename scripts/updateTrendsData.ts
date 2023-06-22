import { initializeApp } from "firebase/app";
import * as dotenv from "dotenv";
import { getFirestore, collection, query, where, getDocs, updateDoc } from "firebase/firestore";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
};

const app = initializeApp(firebaseConfig);

(async () => {
  const db = getFirestore(app);
  const trendType = "frontend";
  const q = query(collection(db, "v1", "trends", trendType), where("tweeted", "==", false), where("todayStarCount", "<", 50));
  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    updateDoc(doc.ref, { tweeted: true })
  })
})()
