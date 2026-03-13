/**
 * Milestone 1 — Menus backend (db): Drizzle schema for menu table.
 * Packages: recipes/service/db.
 * Run from recipes/plans so Cd paths resolve (e.g. ../service/db).
 */
import { defineWorkflow, step, CdStepMachine } from "@saflib/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const MenusM1DbWorkflowDefinition = defineWorkflow<typeof input, Context>({
  id: "plans/menus-m1-db",
  description:
    "Menus backend (db): menu table (collection_id, name, is_public, groupings JSON, edited_by_user_ids JSON, etc.); migration — Drizzle.",
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
    step(CdStepMachine, () => ({ path: "../service/db" })),
    GetFeedbackStep,
  ],
});

export default MenusM1DbWorkflowDefinition;
