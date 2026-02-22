import { makeReverseTComposable } from "@saflib/vue";
import { recipes_sdk_strings } from "./strings.ts";

export const useReverseT = makeReverseTComposable(recipes_sdk_strings);
