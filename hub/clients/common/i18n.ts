import { makeReverseTComposable } from "@saflib/vue";
import { hub_common_strings } from "./strings.ts";

export const useReverseT = makeReverseTComposable(
  hub_common_strings,
);
