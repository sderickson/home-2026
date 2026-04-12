import { makeConfig } from "@saflib/vite";
import { htmlHeaderPlugin } from "../build/html-header-plugin.ts";
import path from "path";

const monorepoRoot = path.resolve(import.meta.dirname, "../../..");

export default makeConfig({
  plugins: [htmlHeaderPlugin()],
  vuetifyOverrides: "../build/overrides.scss",
  monorepoRoot,
  useSubdomainProxy: false,
  appType: "spa",
});
