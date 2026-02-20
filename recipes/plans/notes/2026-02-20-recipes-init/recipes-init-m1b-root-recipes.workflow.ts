/**
 * Milestone 1b: Logged-out recipe experience — Root recipe list + detail, refactor into SDK.
 * Packages: recipes/clients/root, recipes/service/sdk.
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

export const RecipesInitM1bRootRecipesWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-m1b-root-recipes",
  description:
    "Milestone 1b: Root client — public recipe list, recipe detail; refactor shared logic into SDK.",
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
    step(CdStepMachine, () => ({ path: "../clients/root" })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), ({ context }) => ({
      path: "./pages/recipes/list",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand your part (Milestone 1b: root client public recipe list + detail; refactor into SDK). Then: Add public recipe list page (read-only). Use SDK recipe list query. After implementing, refactor shared listing/display into recipes/service/sdk (e.g. sdk/add-component for recipe list item) so app client can reuse. See plan M1b.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail",
      prompt: `Add public recipe detail page (current version, ingredients, instructions). Use SDK. After implementing, refactor recipe display (for making/cooking) into recipes/service/sdk so app client can reuse. See plan M1b.`,
    })),
    GetFeedbackStep,
  ],
});

export default RecipesInitM1bRootRecipesWorkflowDefinition;
