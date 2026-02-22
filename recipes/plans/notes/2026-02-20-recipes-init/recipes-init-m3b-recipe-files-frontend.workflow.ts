/**
 * Milestone 3b: Recipe files frontend — SDK + App recipe detail file management.
 * Packages: recipes/service/sdk, recipes/clients/app.
 * Run from recipes/plans so Cd paths resolve.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import {
  AddSdkQueryWorkflowDefinition,
  AddSdkMutationWorkflowDefinition,
} from "@saflib/sdk/workflows";
import { AddSpaViewWorkflowDefinition } from "@saflib/vue/workflows";
import path from "path";
import { GetFeedbackStep } from "@saflib/processes/workflows";

const input = [] as const;
interface Context {}

export const RecipesInitM3bRecipeFilesFrontendWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-m3b-recipe-files-frontend",
  description:
    "Milestone 3b: SDK for recipe files + App recipe detail file management (list, upload, delete).",
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
    step(CdStepMachine, () => ({ path: "../service/sdk" })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), ({ context }) => ({
      path: "./requests/recipes/files-list.ts",
      urlPath: "/recipes/{id}/files",
      method: "get",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand your part (Milestone 3b: recipe files SDK + app UI). Then: Add query for GET /recipes/:id/files.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/files-upload.ts",
      upload: true,
      urlPath: "/recipes/{id}/files",
      method: "post",
      prompt: `Add mutation POST /recipes/:id/files (upload).`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/files-delete.ts",
      urlPath: "/recipes/{id}/files/{fileId}",
      method: "delete",
      prompt: `Add mutation DELETE /recipes/:id/files/:fileId.`,
    })),

    step(CdStepMachine, () => ({ path: "../clients/app" })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail",
      urlPath: "/recipes/:id",
      prompt: `Update recipe detail: add managing recipe files (list, upload, delete). Admin only. Use SDK recipe files queries and mutations. See plan M3b.`,
    })),
    GetFeedbackStep,
  ],
});

export default RecipesInitM3bRecipeFilesFrontendWorkflowDefinition;
