import { makeReverseTComposable } from "@saflib/vue";
import { notebook_common_strings } from "./strings.ts";

export const useReverseT = makeReverseTComposable(
  notebook_common_strings,
);
