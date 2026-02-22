/**
 * Milestone 1a: Logged-in recipe experience — SDK (recipes) + App recipe list, detail, edit, delete.
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
import path from "path";
import { GetFeedbackStep } from "@saflib/processes/workflows";

const input = [] as const;
interface Context {}

export const RecipesInitM1aAppRecipesWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-m1a-app-recipes",
  description:
    "Milestone 1a: SDK for recipes + App recipe list, detail, edit, delete (logged-in experience).",
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
      path: "./requests/recipes/list.ts",
      urlPath: "/recipes",
      method: "get",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand the plan and your part (Milestone 1a: SDK for recipes + app recipe UX). Then: Add query for GET /recipes (list).`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/recipes/get.ts",
      urlPath: "/recipes/{id}",
      method: "get",
      prompt: `Add query for GET /recipes/:id.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/recipes/versions-list.ts",
      urlPath: "/recipes/{id}/versions",
      method: "get",
      prompt: `Add query for GET /recipes/:id/versions.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/create.ts",
      urlPath: "/recipes",
      method: "post",
      prompt: `Add mutation POST /recipes.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/update.ts",
      urlPath: "/recipes/{id}",
      method: "put",
      prompt: `Add mutation PUT /recipes/:id.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/versions-latest-update.ts",
      urlPath: "/recipes/{id}/versions/latest",
      method: "put",
      prompt: `Add mutation PUT /recipes/:id/versions/latest.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/versions-create.ts",
      urlPath: "/recipes/{id}/versions",
      method: "post",
      prompt: `Add mutation POST /recipes/:id/versions.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/delete.ts",
      urlPath: "/recipes/{id}",
      method: "delete",
      prompt: `Add mutation DELETE /recipes/:id.`,
    })),
    GetFeedbackStep,
  ],
});

export default RecipesInitM1aAppRecipesWorkflowDefinition;
