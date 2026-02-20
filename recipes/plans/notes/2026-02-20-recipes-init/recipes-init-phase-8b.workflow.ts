/**
 * Phase 8b: App client — version history, notes, recipe files, note files on recipe detail.
 * Package: recipes/clients/app.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import { AddSpaViewWorkflowDefinition } from "@saflib/vue/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const RecipesInitPhase8bWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-phase-8b",
  description: "App client: recipe detail — version history, notes, recipe files, note files (admin only).",
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
    step(CdStepMachine, () => ({ path: "../clients/app" })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), ({ context }) => ({
      path: "./pages/recipes/detail-version-history",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Make sure you understand the overall plan and your part in it (Phase 8b: app client — version history, notes, recipe files, note files on recipe detail). Then: Update recipe detail: add version history section (list versions, optionally diff). Admin only. See plan Phase 8.4.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail-notes",
      prompt: `Update recipe detail: add notes section (list, add, edit note with ever_edited, optional version link). Admin only. See plan Phase 8.5.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail-recipe-files",
      prompt: `Update recipe detail: add managing recipe files (list, upload, delete). Admin only. See plan Phase 8.6.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail-note-files",
      prompt: `Update recipe detail: add managing files per note (list, upload, delete per note). Admin only. See plan Phase 8.7.`,
    })),
  ],
});

export default RecipesInitPhase8bWorkflowDefinition;
