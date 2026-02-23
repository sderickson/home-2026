/**
 * Milestone 1c: Version history on recipe detail (App).
 * Packages: recipes/clients/app.
 * Run from recipes/plans so Cd paths resolve.
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

export const RecipesInitM1cVersionsWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-m1c-versions",
  description:
    "Milestone 1c: App client — version history section on recipe detail (admin only).",
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
      path: "./pages/recipes/detail",
      urlPath: "/recipes/:id",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand your part (Milestone 1c: add version history to recipe detail). Then: Update recipe detail page: add version history section — have a modal with a list of versions, with an accordion for showing a preview of the version. Use RecipeContentPreview from the sdk package. See plan M1c.`,
    })),
    GetFeedbackStep,
  ],
});

export default RecipesInitM1cVersionsWorkflowDefinition;
