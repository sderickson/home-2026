import { makeConfig } from "@saflib/vite";
import { htmlHeaderPlugin } from "./html-header-plugin.ts";
import path from "path";
import { defineConfig, mergeConfig } from "vite";
import { validateEnv } from "@saflib/env";
import envSchema from "./env.schema.combined.json" with { type: "json" };

validateEnv(process.env, envSchema);

const monorepoRoot = path.resolve(import.meta.dirname, "../../..");

export default mergeConfig(
  makeConfig({
    plugins: [htmlHeaderPlugin()],

    vuetifySettings: "./overrides.scss",
    monorepoRoot,
  }),
  defineConfig({
    define: {
      "import.meta.env.VITE_ADMIN_EMAILS": JSON.stringify(
        process.env.ADMIN_EMAILS ?? "",
      ),
      "import.meta.env.VITE_DEPLOYMENT_NAME": JSON.stringify(
        process.env.DEPLOYMENT_NAME ?? "",
      ),
    },
  }),
);
