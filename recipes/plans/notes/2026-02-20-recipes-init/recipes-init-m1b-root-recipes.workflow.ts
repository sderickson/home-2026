/**
 * Milestone 1b: Logged-out recipe experience — SDK components first (recipe preview, recipe list), then root list + detail views.
 * Packages: recipes/service/sdk, recipes/clients/root.
 * Run from recipes/plans so Cd paths resolve.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import { AddComponentWorkflowDefinition } from "@saflib/sdk/workflows";
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
    "Milestone 1b: SDK recipe preview + recipe list components (refactor first), then root recipe list and detail views.",
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
      makeWorkflowMachine(AddComponentWorkflowDefinition),
      ({ context }) => ({
        prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand your part (Milestone 1b: refactor recipe display into SDK components, then add root views). First, refactor: create a **recipe preview** component in the SDK — a display component for one recipe (e.g. card/list item). It should accept recipe (and optionally current version) data as props per the spec. Use sdk/add-component to create it at ./components/recipe-preview. Then run that workflow.`,
        path: "./components/recipe-preview",
      }),
    ),
    step(makeWorkflowMachine(AddComponentWorkflowDefinition), () => ({
      prompt: `Second refactor: create a **recipe list** component in the SDK that renders a list of recipes using the recipe preview component. Use sdk/add-component to create it at ./components/recipe-list. Then run that workflow.`,
      path: "./components/recipe-list",
    })),
    step(CdStepMachine, () => ({ path: "../clients/root" })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/list",
      prompt: `Add public recipe list page (read-only). Use SDK recipe list query and the SDK recipe-list (and recipe-preview) components. See plan M1b.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail",
      prompt: `Add public recipe detail page (current version, ingredients, instructions). Use SDK recipe get query and display components. See plan M1b.`,
    })),
    GetFeedbackStep,
  ],
});

export default RecipesInitM1bRootRecipesWorkflowDefinition;
