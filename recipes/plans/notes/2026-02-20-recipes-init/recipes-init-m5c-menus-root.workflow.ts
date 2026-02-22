/**
 * Milestone 5c: Menus logged-out — SDK components first (menu preview, menu detail), then root list + detail views.
 * Packages: recipes/service/sdk, recipes/clients/root.
 * Run from recipes/plans so Cd paths resolve.
 *
 * Interface sketch: menu preview = full Menu; menu detail = fully resolved shape (groupings with recipes: { id, title, shortDescription }[]).
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

export const RecipesInitM5cMenusRootWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-m5c-menus-root",
  description:
    "Milestone 5c: SDK menu preview + menu detail components (with clear interfaces), then root menu list and detail views.",
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
        path: "./components/menu-preview",
        prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand your part (Milestone 5c: menu components then root views). Read the plan's M5c **interface sketch**. First, create a **menu preview** component in the SDK — a display component for one menu (e.g. card/list item). Props: full \`menu: { id, name, isPublic, groupings?: { name, recipeIds }[] }\` (Menu type per spec). No resolved recipe data needed for the list item. Use sdk/add-component at ./components/menu-preview. Then run that workflow.`,
      }),
    ),
    step(
      makeWorkflowMachine(AddComponentWorkflowDefinition),
      ({ context }) => ({
        path: "./components/menu-detail",
        prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (especially M5c interface sketch). Create a **menu detail** component that receives the **entire structure needed to render** — no "just ids." Use a single prop, e.g. \`menuDetail: { id, name, isPublic, groupings: { name, recipes: { id, title, shortDescription }[] }[] }\`, so each grouping has an ordered array of resolved recipe display items. The component must not accept only recipe ids or a separate map; the page/loader will fetch the menu and resolve recipe summaries and pass this shape. Use sdk/add-component at ./components/menu-detail. Then run that workflow.`,
      }),
    ),
    step(CdStepMachine, () => ({ path: "../clients/root" })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/menus/list",
      urlPath: "/menus/list",
      prompt: `Add public menu list page. Use SDK menus list query and the SDK menu-preview component. Pass full Menu to each preview. See plan M5c.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/menus/detail",
      urlPath: "/menus/:id",
      prompt: `Add public menu detail page. Fetch menu (GET /menus/:id) and resolve recipe summaries (id, title, shortDescription) for each recipeId in groupings; pass the fully resolved \`menuDetail\` shape to the SDK menu-detail component. See plan M5c interface sketch.`,
    })),
    GetFeedbackStep,
  ],
});

export default RecipesInitM5cMenusRootWorkflowDefinition;
