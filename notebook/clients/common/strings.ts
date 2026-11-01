import { base_layout } from "./components/notebook-layout/NotebookLayout.strings.ts";
import { async_page_error } from "./components/NotebookAsyncPageError.strings.ts";
import { base_sdk_strings } from "@sderickson/notebook-sdk/strings";
export const base_common_strings = {
  base_layout,
  async_page_error,
  ...base_sdk_strings,
};
