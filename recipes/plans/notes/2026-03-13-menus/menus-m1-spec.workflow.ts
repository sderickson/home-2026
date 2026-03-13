/**
 * Milestone 1 — Menus backend (spec): OpenAPI schema and routes for menus.
 * Packages: recipes/service/spec.
 * Run from recipes/plans so Cd paths resolve (e.g. ../service/spec).
 */
import { defineWorkflow, step, CdStepMachine } from "@saflib/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const MenusM1SpecWorkflowDefinition = defineWorkflow<typeof input, Context>({
  id: "plans/menus-m1-spec",
  description:
    "Menus backend (spec): Menu schema and CRUD routes (GET/POST /menus, GET/PUT/DELETE /menus/:id) with collectionId — OpenAPI.",
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
    step(CdStepMachine, () => ({ path: "../service/spec" })),
    GetFeedbackStep,
  ],
});

export default MenusM1SpecWorkflowDefinition;
