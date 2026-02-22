import { makeReverseTComposable } from "@saflib/vue";
import { notebook_sdk_strings } from "./strings.ts";

export const useReverseT = makeReverseTComposable(notebook_sdk_strings);
