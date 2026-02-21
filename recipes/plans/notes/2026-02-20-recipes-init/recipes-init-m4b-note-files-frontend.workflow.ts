/**
 * Milestone 4b: Note files frontend — SDK + App recipe detail note-file management.
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

export const RecipesInitM4bNoteFilesFrontendWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-m4b-note-files-frontend",
  description:
    "Milestone 4b: SDK for note files + App recipe detail — manage files per note (list, upload, delete).",
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
      path: "./requests/recipes/notes-files-list.ts",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand your part (Milestone 4b: note files SDK + app UI). Then: Add query for GET /recipes/:id/notes/:noteId/files.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-files-upload.ts",
      upload: true,
      prompt: `Add mutation POST /recipes/:id/notes/:noteId/files.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-files-delete.ts",
      prompt: `Add mutation DELETE /recipes/:id/notes/:noteId/files/:fileId.`,
    })),

    step(CdStepMachine, () => ({ path: "../clients/app" })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail",
      urlPath: "/recipes/:id",
      prompt: `Update recipe detail: add managing files per note (list, upload, delete per note). Admin only. Use SDK note files queries and mutations. See plan M4b.`,
    })),
    GetFeedbackStep,
  ],
});

export default RecipesInitM4bNoteFilesFrontendWorkflowDefinition;
