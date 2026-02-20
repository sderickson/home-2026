/**
 * Phase 8a: App client — recipe list, recipe detail (view), recipe edit.
 * Package: recipes/clients/app. Reuse SDK components from Phase 7.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import { AddSpaViewWorkflowDefinition } from "@saflib/vue/workflows";
import path from "path";
import { GetFeedbackStep } from "@saflib/processes/workflows";
const input = [] as const;
interface Context {}

export const RecipesInitPhase8aWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-phase-8a",
  description:
    "App client: recipe list, recipe detail (read), recipe edit (metadata + content, update latest vs new version).",
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
      path: "./pages/recipes/list",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Make sure you understand the overall plan and your part in it (Phase 8a: app client — recipe list, recipe detail view, recipe edit). Then: Recipe list: admin sees all, non-admin sees public only; hide create for non-admin. Reuse SDK list/display. See plan Phase 8.1.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail",
      prompt: `Recipe detail (read-only first): current version, ingredients, instructions. Reuse SDK recipe display. No edit UI yet. See plan Phase 8.2.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail-edit",
      prompt: `Update recipe detail: add edit (metadata + content). On save offer "Update latest version" vs "Save as new version." Admin only. See plan Phase 8.3.`,
    })),
    GetFeedbackStep,
  ],
});

export default RecipesInitPhase8aWorkflowDefinition;
