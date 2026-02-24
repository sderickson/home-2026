/**
 * Milestone 3c: Recipe files visible — Root recipe detail shows recipe files (read-only).
 * Packages: recipes/clients/root.
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

export const RecipesInitM3cRecipeFilesVisibleWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-m3c-recipe-files-visible",
  description:
    "Milestone 3c: Root recipe detail shows recipe files (read-only) using existing SDK filesListRecipesQuery.",
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
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail",
      urlPath: "/recipes/:id",
      prompt: `Update recipe detail: show recipe files (read-only). Use SDK filesListRecipesQuery from recipes/service/sdk. Display the file list; no upload or delete. See plan M3c.`,
    })),
    GetFeedbackStep,
  ],
});

export default RecipesInitM3cRecipeFilesVisibleWorkflowDefinition;
