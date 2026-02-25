/**
 * Milestone 3c: Recipe files visible — Download endpoint (spec + http + SDK) and root recipe detail shows files (read-only).
 * Packages: recipes/service/spec, recipes/service/http, recipes/service/sdk, recipes/clients/root.
 * Run from recipes/plans so Cd paths resolve.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import { AddRouteWorkflowDefinition } from "@saflib/openapi/workflows";
import { AddHandlerWorkflowDefinition } from "@saflib/express/workflows";
import { AddSdkMutationWorkflowDefinition } from "@saflib/sdk/workflows";
import { AddSpaViewWorkflowDefinition } from "@saflib/vue/workflows";
import path from "path";
import { GetFeedbackStep } from "@saflib/processes/workflows";

const input = [] as const;
interface Context {}

export const RecipesInitM3cRecipeFilesVisibleWorkflowDefinition =
  defineWorkflow<typeof input, Context>({
    id: "plans/recipes-init-m3c-recipe-files-visible",
    description:
      "Milestone 3c: Recipe file download (route + handler + SDK mutation) and root recipe detail shows files (read-only).",
    input,
    context: ({ input }) => ({
      agentConfig: { ...input.agentConfig, resetTimeoutEachStep: true },
    }),
    sourceUrl: import.meta.url,
    templateFiles: {},
    docFiles: {
      spec: path.join(import.meta.dirname, "recipes-init.spec.md"),
      plan: path.join(import.meta.dirname, "recipes-init.plan.md"),
    },
    versionControl: { allowPaths: ["**/*"], commitEachStep: true },
    steps: [
      step(CdStepMachine, () => ({ path: "../service/spec" })),
      step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
        path: "./routes/recipes/files-download.yaml",
        urlPath: "/recipes/{id}/files/{fileId}",
        method: "get",
        download: true,
        prompt: `GET /recipes/:id/files/:fileId — download file (binary). See spec.`,
      })),
      step(CdStepMachine, () => ({ path: "../service/http" })),
      step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
        path: "./routes/recipes/files-download.ts",
        download: true,
        prompt: `Handler GET /recipes/:id/files/:fileId (download binary). While you're in there, also update _helpers.ts to return the file path for each recipe-file. Right now the helper does not populate that.`,
      })),
      step(CdStepMachine, () => ({ path: "../service/sdk" })),
      step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
        path: "./requests/recipes/files-download.ts",
        urlPath: "/recipes/{id}/files/{fileId}",
        method: "get",
        download: true,
        prompt: `Add mutation GET /recipes/:id/files/:fileId (download binary).`,
      })),
      step(CdStepMachine, () => ({ path: "../clients/root" })),
      step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
        path: "./pages/recipes/detail",
        urlPath: "/recipes/:id",
        prompt: `Update recipe detail: show the actual files. Only allow uploading images, and render the images using the new recipes/file-download  See plan M3c.`,
      })),
      GetFeedbackStep,
    ],
  });

export default RecipesInitM3cRecipeFilesVisibleWorkflowDefinition;
