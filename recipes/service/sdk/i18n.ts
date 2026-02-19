import { makeReverseTComposable } from "@saflib/vue";
import { recipesSdkStrings } from "./strings.ts";

export const useReverseT = makeReverseTComposable(recipesSdkStrings);
