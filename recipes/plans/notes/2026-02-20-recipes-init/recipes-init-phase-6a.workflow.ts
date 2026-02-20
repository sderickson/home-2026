/**
 * Phase 6a: SDK queries only. Package: recipes/service/sdk.
 * Run after Phase 5. Phase 6b adds mutations.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import { AddSdkQueryWorkflowDefinition } from "@saflib/sdk/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const RecipesInitPhase6aWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-phase-6a",
  description: "SDK: add all query hooks (recipes, notes, files, menus).",
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
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/recipes/list.ts",
      prompt: `Orientation: Read context.docFiles.spec and context.docFiles.plan. Make sure you understand the overall plan and your part in it (Phase 6a: SDK query hooks for recipes, notes, files, menus). Then: Add query for GET /recipes (list). See plan Phase 6.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/recipes/get.ts",
      prompt: `Add query for GET /recipes/:id.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/recipes/versions-list.ts",
      prompt: `Add query for GET /recipes/:id/versions.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-list.ts",
      prompt: `Add query for GET /recipes/:id/notes.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/recipes/files-list.ts",
      prompt: `Add query for GET /recipes/:id/files.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-files-list.ts",
      prompt: `Add query for GET /recipes/:id/notes/:noteId/files.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/menus/list.ts",
      prompt: `Add query for GET /menus.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/menus/get.ts",
      prompt: `Add query for GET /menus/:id.`,
    })),
  ],
});

export default RecipesInitPhase6aWorkflowDefinition;
