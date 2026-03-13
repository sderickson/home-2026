/**
 * Milestone 1 — Collections backend (db): Drizzle schema and queries.
 * Packages: recipes/service/db.
 * Run from recipes/plans so Cd paths resolve (e.g. ../service/db).
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import {
  UpdateSchemaWorkflowDefinition,
  AddDrizzleQueryWorkflowDefinition,
} from "@saflib/drizzle/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const CollectionsM1DbWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/collections-m1-db",
  description:
    "Collections backend (db): collection + collection_member tables, recipe.collection_id, queries — Drizzle.",
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
    step(CdStepMachine, () => ({ path: "../service/db" })),

    step(
      makeWorkflowMachine(UpdateSchemaWorkflowDefinition),
      ({ context }) => ({
        path: "./schemas/collection.ts",
        prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand the overall plan and your part (Milestone 1: collections backend — db). Then: Add two tables in this file: collection (id text PK user-specified, name, created_by, created_at, updated_at) and collection_member (id, collection_id FK to collection, email text, role text enum owner/editor/viewer, is_creator boolean, created_at). Unique on (collection_id, email). Indexes: collection_member(collection_id), collection_member(email).`,
      }),
    ),

    step(makeWorkflowMachine(UpdateSchemaWorkflowDefinition), () => ({
      path: "./schemas/recipe.ts",
      prompt: `Add collection_id column (text, FK to collection, required for new rows) to the existing recipe table. This is a new required column; no backfill needed (product not launched, scorched earth). Also add an index on recipe(collection_id).`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/collection/list-by-email.ts",
      prompt: `List collections where a given email is a member. Join collection with collection_member on collection_id, filter by email. Return collection rows.`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/collection/get-by-id.ts",
      prompt: `Get one collection by id.`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/collection/create.ts",
      prompt: `Create a collection and insert the creator as a collection_member with role=owner and is_creator=true, in a transaction. Accept optional id (if not provided, generate a URL-safe id), name, and creatorEmail.`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/collection/update.ts",
      prompt: `Update collection name by id.`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/collection/delete.ts",
      prompt: `Delete collection by id. Application logic should check for recipes before calling this; the query itself just deletes the collection and its members.`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/collection/has-recipes.ts",
      prompt: `Check whether a collection has any recipes (return boolean). Used before delete to enforce the "no delete if recipes exist" constraint.`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/collection-member/list.ts",
      prompt: `List all members of a collection by collection_id.`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/collection-member/get-by-collection-and-email.ts",
      prompt: `Get a single collection_member by collection_id and email. Used for auth checks (is this user a member? what role?).`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/collection-member/add.ts",
      prompt: `Add a member to a collection (insert collection_member row). Accept collection_id, email, role. If email already exists for that collection, upsert the role instead (but never change is_creator).`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/collection-member/update-role.ts",
      prompt: `Update a collection_member's role by member id. Application logic should prevent demoting the creator; query just updates the role.`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/collection-member/remove.ts",
      prompt: `Remove a collection_member by member id. Application logic should prevent removing the creator; query just deletes the row.`,
    })),

    GetFeedbackStep,
  ],
});

export default CollectionsM1DbWorkflowDefinition;
