import { makeReverseTComposable } from "@saflib/vue";
import { recipes_common_strings } from "./strings.ts";

export const useReverseT = makeReverseTComposable(
  recipes_common_strings,
);
