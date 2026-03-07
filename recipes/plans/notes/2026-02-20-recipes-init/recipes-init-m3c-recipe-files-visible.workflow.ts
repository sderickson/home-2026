/**
 * Milestone 3c: Recipe files visible — Serve endpoint (spec + http), downloadUrl in list response, root recipe detail shows files (read-only).
 * Packages: recipes/service/spec, recipes/service/http, recipes/clients/root.
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
import { AddSpaViewWorkflowDefinition } from "@saflib/vue/workflows";
import path from "path";
import { GetFeedbackStep } from "@saflib/processes/workflows";

const input = [] as const;
interface Context {}

export const RecipesInitM3cRecipeFilesVisibleWorkflowDefinition =
  defineWorkflow<typeof input, Context>({
    id: "plans/recipes-init-m3c-recipe-files-visible",
    description:
      "Milestone 3c: Recipe file serve endpoint (route + handler), downloadUrl in _helpers, root recipe detail shows files via downloadUrl (read-only).",
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
        urlPath: "/recipes/{id}/files/{fileId}/blob",
        method: "get",
        download: true,
        prompt: `GET /recipes/:id/files/:fileId/blob — serve file binary (so GET .../files/:fileId can later return JSON RecipeFileInfo if desired). See spec.`,
      })),
      step(CdStepMachine, () => ({ path: "../service/http" })),
      step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
        path: "./routes/recipes/files-download.ts",
        download: true,
        prompt: `Handler GET /recipes/:id/files/:fileId/blob (binary response; set Content-Disposition per add-handler guidance). Also update _helpers.ts: in recipeFileToApiRecipeFile add downloadUrl pointing to this endpoint (path ending in /blob, built from recipeId and fileId) so list responses include it.`,
      })),
      step(CdStepMachine, () => ({ path: "../clients/root" })),
      step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
        path: "./pages/recipes/detail",
        urlPath: "/recipes/:id",
        prompt: `Update recipe detail: show recipe files (read-only). Use SDK filesListRecipesQuery; display each file using its downloadUrl (points to .../files/:fileId/blob for the raw bytes; e.g. img src or link href). No download mutation — the list response includes downloadUrl. See plan M3c.`,
      })),
      GetFeedbackStep,
    ],
  });

export default RecipesInitM3cRecipeFilesVisibleWorkflowDefinition;
