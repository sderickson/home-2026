import { makeReverseTComposable } from "@saflib/vue";
import { hub_sdk_strings } from "./strings.ts";

export const useReverseT = makeReverseTComposable(hub_sdk_strings);
