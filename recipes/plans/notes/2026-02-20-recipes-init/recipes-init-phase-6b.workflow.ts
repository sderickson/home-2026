/**
 * Phase 6b: SDK mutations (including upload). Package: recipes/service/sdk.
 * Run after Phase 6a.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import { AddSdkMutationWorkflowDefinition } from "@saflib/sdk/workflows";
import path from "path";
import { GetFeedbackStep } from "@saflib/processes/workflows";
const input = [] as const;
interface Context {}

export const RecipesInitPhase6bWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-phase-6b",
  description:
    "SDK: add all mutation hooks (recipes, notes, files, menus; upload where needed).",
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
    step(
      makeWorkflowMachine(AddSdkMutationWorkflowDefinition),
      ({ context }) => ({
        path: "./requests/recipes/create.ts",
        urlPath: "/recipes",
        method: "post",
        prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Make sure you understand the overall plan and your part in it (Phase 6b: SDK mutation hooks, including upload). Then: Add mutation POST /recipes.`,
      }),
    ),
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
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-create.ts",
      urlPath: "/recipes/{id}/notes",
      method: "post",
      prompt: `Add mutation POST /recipes/:id/notes.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-update.ts",
      urlPath: "/recipes/{id}/notes/{noteId}",
      method: "put",
      prompt: `Add mutation PUT /recipes/:id/notes/:noteId.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-delete.ts",
      urlPath: "/recipes/{id}/notes/{noteId}",
      method: "delete",
      prompt: `Add mutation DELETE /recipes/:id/notes/:noteId.`,
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
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-files-upload.ts",
      upload: true,
      urlPath: "/recipes/{id}/notes/{noteId}/files",
      method: "post",
      prompt: `Add mutation POST /recipes/:id/notes/:noteId/files.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-files-delete.ts",
      urlPath: "/recipes/{id}/notes/{noteId}/files/{fileId}",
      method: "delete",
      prompt: `Add mutation DELETE /recipes/:id/notes/:noteId/files/:fileId.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/menus/create.ts",
      urlPath: "/menus",
      method: "post",
      prompt: `Add mutation POST /menus.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/menus/update.ts",
      urlPath: "/menus/{id}",
      method: "put",
      prompt: `Add mutation PUT /menus/:id.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/menus/delete.ts",
      urlPath: "/menus/{id}",
      method: "delete",
      prompt: `Add mutation DELETE /menus/:id.`,
    })),
    GetFeedbackStep,
  ],
});

export default RecipesInitPhase6bWorkflowDefinition;
