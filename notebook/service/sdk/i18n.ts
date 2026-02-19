import { makeReverseTComposable } from "@saflib/vue";
import { notebookSdkStrings } from "./strings.ts";

export const useReverseT = makeReverseTComposable(notebookSdkStrings);
