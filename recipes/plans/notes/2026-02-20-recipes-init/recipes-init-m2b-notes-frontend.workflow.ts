/**
 * Milestone 2b: Notes frontend — SDK for notes + App recipe detail notes section.
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

export const RecipesInitM2bNotesFrontendWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-m2b-notes-frontend",
  description:
    "Milestone 2b: SDK for notes + App recipe detail notes section (list, add, edit, delete).",
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
      path: "./requests/recipes/notes-list.ts",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand your part (Milestone 2b: notes SDK + app notes section). Then: Add query for GET /recipes/:id/notes.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-create.ts",
      prompt: `Add mutation POST /recipes/:id/notes.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-update.ts",
      prompt: `Add mutation PUT /recipes/:id/notes/:noteId.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-delete.ts",
      prompt: `Add mutation DELETE /recipes/:id/notes/:noteId.`,
    })),

    step(CdStepMachine, () => ({ path: "../clients/app" })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), ({ context }) => ({
      path: "./pages/recipes/detail",
      urlPath: "/recipes/:id",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Then: Update recipe detail: add notes section — list notes, add note, edit note (set ever_edited on edit), optional link to version. Admin only. Use SDK notes queries and mutations. See plan M2b.`,
    })),
    GetFeedbackStep,
  ],
});

export default RecipesInitM2bNotesFrontendWorkflowDefinition;
