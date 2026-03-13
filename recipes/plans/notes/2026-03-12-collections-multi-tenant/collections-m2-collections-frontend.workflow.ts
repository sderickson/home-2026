/**
 * Milestone 2 — Collections frontend: SDK queries/mutations for collections
 * and members, plus the Collections page with membership dialog.
 * Packages: recipes/service/sdk, recipes/clients/app.
 * Run from recipes/plans so Cd paths resolve.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import {
  AddSdkQueryWorkflowDefinition,
  AddSdkMutationWorkflowDefinition,
} from "@saflib/sdk/workflows";
import { AddSpaViewWorkflowDefinition } from "@saflib/vue/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const CollectionsM2CollectionsFrontendWorkflowDefinition =
  defineWorkflow<typeof input, Context>({
    id: "plans/collections-m2-collections-frontend",
    description:
      "Collections frontend: SDK for collections/members + Collections page with membership dialog.",
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
      // --- SDK: queries and mutations for collections and members ---
      step(CdStepMachine, () => ({ path: "../service/sdk" })),

      step(
        makeWorkflowMachine(AddSdkQueryWorkflowDefinition),
        ({ context }) => ({
          path: "./requests/collections/list.ts",
          urlPath: "/collections",
          method: "get",
          prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand your part (Milestone 2: collections frontend — SDK + page). Then: Add query for GET /collections (list collections current user is in).`,
        }),
      ),

      step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
        path: "./requests/collections/get.ts",
        urlPath: "/collections/{id}",
        method: "get",
        prompt: `Add query for GET /collections/:id.`,
      })),

      step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
        path: "./requests/collections/create.ts",
        urlPath: "/collections",
        method: "post",
        prompt: `Add mutation POST /collections. Body includes name and optional id.`,
      })),

      step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
        path: "./requests/collections/update.ts",
        urlPath: "/collections/{id}",
        method: "put",
        prompt: `Add mutation PUT /collections/:id. Body: name.`,
      })),

      step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
        path: "./requests/collections/delete.ts",
        urlPath: "/collections/{id}",
        method: "delete",
        prompt: `Add mutation DELETE /collections/:id.`,
      })),

      step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
        path: "./requests/collections/members-list.ts",
        urlPath: "/collections/{id}/members",
        method: "get",
        prompt: `Add query for GET /collections/:id/members (list members).`,
      })),

      step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
        path: "./requests/collections/members-add.ts",
        urlPath: "/collections/{id}/members",
        method: "post",
        prompt: `Add mutation POST /collections/:id/members. Body: email, role.`,
      })),

      step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
        path: "./requests/collections/members-update.ts",
        urlPath: "/collections/{id}/members/{memberId}",
        method: "put",
        prompt: `Add mutation PUT /collections/:id/members/:memberId. Body: role.`,
      })),

      step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
        path: "./requests/collections/members-remove.ts",
        urlPath: "/collections/{id}/members/{memberId}",
        method: "delete",
        prompt: `Add mutation DELETE /collections/:id/members/:memberId.`,
      })),

      // --- App: Collections page ---
      step(CdStepMachine, () => ({ path: "../clients/app" })),

      step(
        makeWorkflowMachine(AddSpaViewWorkflowDefinition),
        ({ context }) => ({
          path: "./pages/collections/list",
          urlPath: "/collections",
          prompt: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 2). Create the Collections page:
- List all collections the user is a member of (name, user's role).
- Each collection row links to /c/:collectionId/recipes/list (the collection-scoped recipe list, coming in M4; for now the link can just exist).
- "Create collection" button: opens a form/dialog to POST /collections with name and optional id, then refreshes list.
- For collections where user is owner: a button to open a members management dialog. The dialog shows current members (email, role, isCreator badge), lets the owner add a member (email + role picker), change a member's role, or remove a member. Creator cannot be removed or demoted (disable those actions for the creator row).
- Use SDK queries and mutations for collections and members.`,
        }),
      ),

      GetFeedbackStep,
    ],
  });

export default CollectionsM2CollectionsFrontendWorkflowDefinition;
