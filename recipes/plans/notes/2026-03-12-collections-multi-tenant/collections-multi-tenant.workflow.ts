/**
 * Orchestrator: runs collections-multi-tenant workflows in milestone order.
 * Each workflow can use a different agent (better context fit).
 * Run from recipes/plans so Cd paths (e.g. ../service/spec) resolve.
 *
 * Order: M1 (spec, db, http) → M2 (collections frontend) →
 * M3 (recipe scoping backend) → M4 (recipe scoping frontend).
 */
import { defineWorkflow, step, makeWorkflowMachine } from "@saflib/workflows";
import { CollectionsM1SpecWorkflowDefinition } from "./collections-m1-spec.workflow.ts";
import { CollectionsM1DbWorkflowDefinition } from "./collections-m1-db.workflow.ts";
import { CollectionsM1HttpWorkflowDefinition } from "./collections-m1-http.workflow.ts";
import { CollectionsM2CollectionsFrontendWorkflowDefinition } from "./collections-m2-collections-frontend.workflow.ts";
import { CollectionsM3RecipeScopingBackendWorkflowDefinition } from "./collections-m3-recipe-scoping-backend.workflow.ts";
import { CollectionsM4RecipeScopingFrontendWorkflowDefinition } from "./collections-m4-recipe-scoping-frontend.workflow.ts";
import path from "path";

const input = [] as const;
interface CollectionsMultiTenantWorkflowContext {}

export const CollectionsMultiTenantWorkflowDefinition = defineWorkflow<
  typeof input,
  CollectionsMultiTenantWorkflowContext
>({
  id: "plans/collections-multi-tenant",
  description:
    "Orchestrator: run all collections-multi-tenant workflows in milestone order (each can use a different agent).",
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
    spec: path.join(import.meta.dirname, "collections-multi-tenant.spec.md"),
    plan: path.join(import.meta.dirname, "collections-multi-tenant.plan.md"),
  },

  versionControl: {
    allowPaths: ["**/*"],
    commitEachStep: true,
  },

  steps: [
    // M1: Collections backend
    step(makeWorkflowMachine(CollectionsM1SpecWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(CollectionsM1DbWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(CollectionsM1HttpWorkflowDefinition), () => ({})),

    // M2: Collections frontend
    step(
      makeWorkflowMachine(CollectionsM2CollectionsFrontendWorkflowDefinition),
      () => ({}),
    ),

    // M3: Recipe scoping backend
    step(
      makeWorkflowMachine(CollectionsM3RecipeScopingBackendWorkflowDefinition),
      () => ({}),
    ),

    // M4: Recipe scoping frontend
    step(
      makeWorkflowMachine(CollectionsM4RecipeScopingFrontendWorkflowDefinition),
      () => ({}),
    ),
  ],
});

export default CollectionsMultiTenantWorkflowDefinition;
