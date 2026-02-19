import { makeReverseTComposable } from "@saflib/vue";
import { hubSdkStrings } from "./strings.ts";

export const useReverseT = makeReverseTComposable(hubSdkStrings);
