// Registry of every state profile. One import per jurisdiction.
import type { StateLawProfile } from "../types";
import { NC } from "./nc";
import { TN } from "./tn";

export const ALL_PROFILES: StateLawProfile[] = [NC, TN];
