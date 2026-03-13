/**
 * Milestone 2 — Menus frontend: SDK for menus + Menus page (list, create, edit) under /c/:collectionId/menus.
 * Packages: recipes/service/sdk, recipes/clients/app.
 * Run from recipes/plans so Cd paths resolve.
 */
import { defineWorkflow, step, CdStepMachine } from "@saflib/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const MenusM2MenusFrontendWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/menus-m2-menus-frontend",
  description:
    "Menus frontend: SDK menu queries/mutations + Menus page (list, create, edit) under /c/:collectionId/menus.",
  input,
  context: ({ input }) => ({
    agentConfig: { ...input.agentConfig, resetTimeoutEachStep: true },
  }),
  sourceUrl: import.meta.url,
  templateFiles: {},
  docFiles: {
    spec: path.join(import.meta.dirname, "menus.spec.md"),
    plan: path.join(import.meta.dirname, "menus.plan.md"),
  },
  versionControl: { allowPaths: ["**/*"], commitEachStep: true },
  steps: [
    step(CdStepMachine, () => ({ path: "../service/sdk" })),
    step(CdStepMachine, () => ({ path: "../clients/app" })),
    GetFeedbackStep,
  ],
});

export default MenusM2MenusFrontendWorkflowDefinition;
