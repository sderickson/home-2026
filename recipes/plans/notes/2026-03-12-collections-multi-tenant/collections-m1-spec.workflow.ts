/**
 * Milestone 1 — Collections backend (spec): OpenAPI schemas and routes.
 * Packages: recipes/service/spec.
 * Run from recipes/plans so Cd paths resolve (e.g. ../service/spec).
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import {
  AddSchemaWorkflowDefinition,
  AddRouteWorkflowDefinition,
} from "@saflib/openapi/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const CollectionsM1SpecWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/collections-m1-spec",
  description:
    "Collections backend (spec): Collection + CollectionMember schemas and CRUD routes — OpenAPI.",
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
    step(CdStepMachine, () => ({ path: "../service/spec" })),

    step(makeWorkflowMachine(AddSchemaWorkflowDefinition), ({ context }) => ({
      name: "collection",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand the overall plan and your part (Milestone 1: collections backend — spec). Then: Add Collection schema per spec: id (user-specified, URL-safe, unique), name, createdBy, createdAt, updatedAt.`,
    })),

    step(makeWorkflowMachine(AddSchemaWorkflowDefinition), () => ({
      name: "collection-member",
      prompt: `Add CollectionMember schema per spec: id, collectionId, email, role (enum: owner, editor, viewer), isCreator (boolean), createdAt.`,
    })),

    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/collections/list.yaml",
      urlPath: "/collections",
      method: "get",
      prompt: `GET /collections — list collections the current user is a member of (any role). Returns { collections: Collection[] }. Authenticated; returns only collections where the user's email is in collection_member and (email is validated OR user is creator). See spec API #1.`,
    })),

    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/collections/create.yaml",
      urlPath: "/collections",
      method: "post",
      prompt: `POST /collections — create a collection. Body: name (required), id (optional; URL-safe, unique). Caller becomes sole owner and creator. Response: { collection: Collection }. Authenticated. See spec API #2.`,
    })),

    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/collections/get.yaml",
      urlPath: "/collections/{id}",
      method: "get",
      prompt: `GET /collections/:id — get one collection by id. Response: { collection: Collection }. Caller must be a member (any role) and have validated email (creator excepted). See spec API #3.`,
    })),

    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/collections/update.yaml",
      urlPath: "/collections/{id}",
      method: "put",
      prompt: `PUT /collections/:id — update collection name. Body: name. Response: { collection: Collection }. Owner only. See spec API #4.`,
    })),

    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/collections/delete.yaml",
      urlPath: "/collections/{id}",
      method: "delete",
      prompt: `DELETE /collections/:id — delete collection. Forbidden (409/400) if collection has any recipes. Owner only. See spec API #5.`,
    })),

    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/collections/members-list.yaml",
      urlPath: "/collections/{id}/members",
      method: "get",
      prompt: `GET /collections/:id/members — list members of a collection (email, role, isCreator). Response: { members: CollectionMember[] }. Member (any role); validated-email rule applies (creator excepted). See spec API #6.`,
    })),

    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/collections/members-add.yaml",
      urlPath: "/collections/{id}/members",
      method: "post",
      prompt: `POST /collections/:id/members — add a member (or update role if email already exists). Body: email, role (owner|editor|viewer). Response: { member: CollectionMember }. Owner only. See spec API #7.`,
    })),

    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/collections/members-update.yaml",
      urlPath: "/collections/{id}/members/{memberId}",
      method: "put",
      prompt: `PUT /collections/:id/members/:memberId — update member role. Body: role. Response: { member: CollectionMember }. Owner only. Cannot demote creator (permanent owner). See spec API #8.`,
    })),

    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/collections/members-remove.yaml",
      urlPath: "/collections/{id}/members/{memberId}",
      method: "delete",
      prompt: `DELETE /collections/:id/members/:memberId — remove a member. Owner only. Cannot remove creator (permanent owner); return 400/409 if attempted. See spec API #9.`,
    })),

    GetFeedbackStep,
  ],
});

export default CollectionsM1SpecWorkflowDefinition;
