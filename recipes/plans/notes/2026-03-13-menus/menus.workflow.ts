/**
 * Orchestrator: runs menus workflows in milestone order.
 * Run from recipes/plans so Cd paths (e.g. ../service/spec) resolve.
 *
 * Order: M1 (spec, db, http) → M2 (menus frontend).
 */
import { defineWorkflow, step, makeWorkflowMachine } from "@saflib/workflows";
import { MenusM1SpecWorkflowDefinition } from "./menus-m1-spec.workflow.ts";
import { MenusM1DbWorkflowDefinition } from "./menus-m1-db.workflow.ts";
import { MenusM1HttpWorkflowDefinition } from "./menus-m1-http.workflow.ts";
import { MenusM2MenusFrontendWorkflowDefinition } from "./menus-m2-menus-frontend.workflow.ts";
import path from "path";

const input = [] as const;
interface MenusWorkflowContext {}

export const MenusWorkflowDefinition = defineWorkflow<
  typeof input,
  MenusWorkflowContext
>({
  id: "plans/menus",
  description:
    "Orchestrator: run all menus workflows in milestone order (M1 spec/db/http, M2 frontend).",
  input,
  context: ({ input }) => ({
    agentConfig: {
      ...input.agentConfig,
      resetTimeoutEachStep: true,
    },
  }),
  sourceUrl: import.meta.url,
  templateFiles: {},
  docFiles: {
    spec: path.join(import.meta.dirname, "menus.spec.md"),
    plan: path.join(import.meta.dirname, "menus.plan.md"),
  },

  versionControl: {
    allowPaths: ["**/*"],
    commitEachStep: true,
  },

  steps: [
    step(makeWorkflowMachine(MenusM1SpecWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(MenusM1DbWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(MenusM1HttpWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(MenusM2MenusFrontendWorkflowDefinition), () => ({})),
  ],
});

export default MenusWorkflowDefinition;
