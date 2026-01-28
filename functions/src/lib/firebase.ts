import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { Secrets } from "../types/types.js";

initializeApp();

export const db = getFirestore();

export const SECRETS = defineSecret("FUNCTIONS_CONFIG_EXPORT");

export const parseSecrets = (secrets: string) => {
  const parsedSecrets = JSON.parse(secrets);
  return parsedSecrets as Secrets;
};
