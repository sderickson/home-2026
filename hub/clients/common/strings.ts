import { hub_layout } from "./components/hub-layout/HubLayout.strings.ts";
import { async_page_error } from "./components/hub-async-page-error/HubAsyncPageError.strings.ts";
import { hub_sdk_strings } from "@sderickson/hub-sdk/strings";

export const hub_common_strings = {
  hub_layout,
  async_page_error,
  ...hub_sdk_strings,
};
