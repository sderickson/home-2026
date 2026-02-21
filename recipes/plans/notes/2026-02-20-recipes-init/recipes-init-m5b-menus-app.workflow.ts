/**
 * Milestone 5b: Menus logged-in — SDK for menus + App menu list and create/edit.
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

export const RecipesInitM5bMenusAppWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-m5b-menus-app",
  description:
    "Milestone 5b: SDK for menus + App menu list, menu create/edit (admin only).",
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
      path: "./requests/menus/list.ts",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand your part (Milestone 5b: menus SDK + app). Then: Add query for GET /menus.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/menus/get.ts",
      prompt: `Add query for GET /menus/:id.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/menus/create.ts",
      prompt: `Add mutation POST /menus.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/menus/update.ts",
      prompt: `Add mutation PUT /menus/:id.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/menus/delete.ts",
      prompt: `Add mutation DELETE /menus/:id.`,
    })),

    step(CdStepMachine, () => ({ path: "../clients/app" })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), ({ context }) => ({
      path: "./pages/menus/list",
      urlPath: "/menus/list",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Then: Menu list page: admin sees all, non-admin sees public only; hide "create menu" for non-admin. Use SDK. See plan M5b.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/menus/edit",
      urlPath: "/menus/:id",
      prompt: `Menu create and edit: name, is_public, groupings (name + ordered recipe ids). Admin only. See plan M5b.`,
    })),
    GetFeedbackStep,
  ],
});

export default RecipesInitM5bMenusAppWorkflowDefinition;
