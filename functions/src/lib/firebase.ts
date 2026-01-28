import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { defineJsonSecret } from "firebase-functions/params";
import { Secrets } from "../types/types.js";

initializeApp();

export const db = getFirestore();

export const SECRETS = defineJsonSecret<Secrets>("FUNCTIONS_CONFIG_EXPORT");
