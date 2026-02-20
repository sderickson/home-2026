/**
 * Orchestrator: runs recipes-init phase workflows in order.
 * Each phase is a separate workflow so a different agent can run each (better context fit).
 * Run from recipes/plans so phase Cd paths (e.g. ../service/spec) resolve.
 *
 * Phases: 1 → 2 → 3 → 4 → 5 → 6a → 6b → 7 → 8a → 8b → 8c
 */
import { defineWorkflow, step, makeWorkflowMachine } from "@saflib/workflows";
import { RecipesInitPhase1WorkflowDefinition } from "./recipes-init-phase-1.workflow.ts";
import { RecipesInitPhase1bWorkflowDefinition } from "./recipes-init-phase-1b.workflow.ts";
import { RecipesInitPhase1cWorkflowDefinition } from "./recipes-init-phase-1c.workflow.ts";
import { RecipesInitPhase2WorkflowDefinition } from "./recipes-init-phase-2.workflow.ts";
import { RecipesInitPhase3WorkflowDefinition } from "./recipes-init-phase-3.workflow.ts";
import { RecipesInitPhase4WorkflowDefinition } from "./recipes-init-phase-4.workflow.ts";
import { RecipesInitPhase5WorkflowDefinition } from "./recipes-init-phase-5.workflow.ts";
import { RecipesInitPhase6aWorkflowDefinition } from "./recipes-init-phase-6a.workflow.ts";
import { RecipesInitPhase6bWorkflowDefinition } from "./recipes-init-phase-6b.workflow.ts";
import { RecipesInitPhase7WorkflowDefinition } from "./recipes-init-phase-7.workflow.ts";
import { RecipesInitPhase8aWorkflowDefinition } from "./recipes-init-phase-8a.workflow.ts";
import { RecipesInitPhase8bWorkflowDefinition } from "./recipes-init-phase-8b.workflow.ts";
import { RecipesInitPhase8cWorkflowDefinition } from "./recipes-init-phase-8c.workflow.ts";

import path from "path";

const input = [] as const;
interface RecipesInitWorkflowContext {}

export const RecipesInitWorkflowDefinition = defineWorkflow<
  typeof input,
  RecipesInitWorkflowContext
>({
  id: "plans/recipes-init",
  description:
    "Orchestrator: run all recipes-init phase workflows in order (each phase can use a different agent).",
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
    spec: path.join(import.meta.dirname, "recipes-init.spec.md"),
    plan: path.join(import.meta.dirname, "recipes-init.plan.md"),
  },
  versionControl: {
    allowPaths: ["**/*"],
    commitEachStep: true,
  },
  steps: [
    step(makeWorkflowMachine(RecipesInitPhase1WorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase1bWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase1cWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase2WorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase3WorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase4WorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase5WorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase6aWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase6bWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase7WorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase8aWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase8bWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase8cWorkflowDefinition), () => ({})),
  ],
});

export default RecipesInitWorkflowDefinition;
