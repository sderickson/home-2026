/**
 * Milestone 1 — Collections backend (http): Express handlers for collection
 * and collection_member CRUD with auth and constraints.
 * Packages: recipes/service/http.
 * Run from recipes/plans so Cd paths resolve (e.g. ../service/http).
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import { AddHandlerWorkflowDefinition } from "@saflib/express/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const CollectionsM1HttpWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/collections-m1-http",
  description:
    "Collections backend (http): collection + member CRUD handlers with auth and constraints.",
  input,
  context: ({ input }) => ({
    agentConfig: { ...input.agentConfig, resetTimeoutEachStep: true },
  }),
  sourceUrl: import.meta.url,
  templateFiles: {},
  docFiles: {
    spec: path.join(import.meta.dirname, "collections-multi-tenant.spec.md"),
    plan: path.join(import.meta.dirname, "collections-multi-tenant.plan.md"),
  },
  versionControl: { allowPaths: ["**/*"], commitEachStep: true },
  steps: [
    step(CdStepMachine, () => ({ path: "../service/http" })),

    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), ({ context }) => ({
      path: "./routes/collections/list.ts",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand the overall plan and your part (Milestone 1: collections backend — http handlers). Then: Handler for GET /collections. Authenticated. Use list-by-email query with the caller's email. Only return collections where caller's email is validated OR caller is creator (check is_creator on collection_member). See spec API #1.`,
    })),

    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/collections/create.ts",
      prompt: `Handler for POST /collections. Authenticated. Accept name (required) and optional id in body. Use collection create query (creates collection + creator member). See spec API #2.`,
    })),

    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/collections/get.ts",
      prompt: `Handler for GET /collections/:id. Authenticated. Caller must be a member (look up by collection_id + email). Validated-email rule applies (creator excepted). Return 403 if not a member or unvalidated non-creator. See spec API #3.`,
    })),

    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/collections/update.ts",
      prompt: `Handler for PUT /collections/:id. Owner only (look up member by collection_id + caller email, check role=owner). Update collection name. See spec API #4.`,
    })),

    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/collections/delete.ts",
      prompt: `Handler for DELETE /collections/:id. Owner only. Check has-recipes query first; if collection has recipes, return 409 with message "Cannot delete collection that has recipes". Otherwise delete. See spec API #5.`,
    })),

    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/collections/members-list.ts",
      prompt: `Handler for GET /collections/:id/members. Caller must be a member (any role); validated-email rule applies (creator excepted). Use collection-member list query. See spec API #6.`,
    })),

    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/collections/members-add.ts",
      prompt: `Handler for POST /collections/:id/members. Owner only. Accept email and role in body. Use collection-member add query (upserts if email exists). See spec API #7.`,
    })),

    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/collections/members-update.ts",
      prompt: `Handler for PUT /collections/:id/members/:memberId. Owner only. Accept role in body. Check if target member is_creator; if so, return 400 "Cannot demote collection creator". Otherwise update role. See spec API #8.`,
    })),

    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/collections/members-remove.ts",
      prompt: `Handler for DELETE /collections/:id/members/:memberId. Owner only. Check if target member is_creator; if so, return 400 "Cannot remove collection creator". Otherwise remove. See spec API #9.`,
    })),

    GetFeedbackStep,
  ],
});

export default CollectionsM1HttpWorkflowDefinition;
