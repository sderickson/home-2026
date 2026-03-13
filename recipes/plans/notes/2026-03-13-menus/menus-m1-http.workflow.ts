/**
 * Milestone 1 — Menus backend (http): Express handlers for menu endpoints.
 * Packages: recipes/service/http.
 * Run from recipes/plans so Cd paths resolve (e.g. ../service/http).
 */
import { defineWorkflow, step, CdStepMachine } from "@saflib/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const MenusM1HttpWorkflowDefinition = defineWorkflow<typeof input, Context>({
  id: "plans/menus-m1-http",
  description:
    "Menus backend (http): Menu handlers; collectionId required; collection role checks; recipeIds-in-collection validation; editedByUserIds append on PUT.",
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
    step(CdStepMachine, () => ({ path: "../service/http" })),
    GetFeedbackStep,
  ],
});

export default MenusM1HttpWorkflowDefinition;
