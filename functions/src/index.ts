import "./lib/firebase.js";
import * as Pubsub from "./pubsub/index.js";
import * as Callable from "./callable/index.js";

export const pubsub = { ...Pubsub };
export const callable = { ...Callable };
