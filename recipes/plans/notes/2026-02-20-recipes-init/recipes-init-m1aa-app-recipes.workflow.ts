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
import { AddSpaViewWorkflowDefinition } from "@saflib/vue/workflows";
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
    step(CdStepMachine, () => ({ path: "../clients/app" })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), ({ context }) => ({
      path: "./pages/recipes/list",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Then: Recipe list page: admin sees all recipes, non-admin sees public only. Hide "create recipe" for non-admin. Use SDK recipe list query. See plan M1a.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail",
      prompt: `Recipe detail page (read): current version, ingredients, instructions, descriptions. Use SDK recipe get. No edit UI yet. Admin can see delete; non-admin read-only.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail",
      prompt: `Update recipe detail: add edit (metadata + content). On save offer "Update latest version" vs "Save as new version." Admin only. Use SDK mutations. Include create-recipe flow from list.`,
    })),
    GetFeedbackStep,
  ],
});

export default RecipesInitM1aAppRecipesWorkflowDefinition;
