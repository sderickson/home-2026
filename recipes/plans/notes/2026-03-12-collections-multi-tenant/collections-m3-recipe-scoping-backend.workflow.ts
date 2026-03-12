/**
 * Milestone 3 — Recipe scoping backend: require collectionId on all recipe
 * (and nested) endpoints; enforce collection membership and permissions.
 * Packages: recipes/service/spec, recipes/service/http.
 * Run from recipes/plans so Cd paths resolve.
 */
import {
  defineWorkflow,
  step,
  CdStepMachine,
  PromptStepMachine,
} from "@saflib/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const CollectionsM3RecipeScopingBackendWorkflowDefinition =
  defineWorkflow<typeof input, Context>({
    id: "plans/collections-m3-recipe-scoping-backend",
    description:
      "Recipe scoping backend: required collectionId on recipe endpoints, collection membership + permission enforcement.",
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

      step(PromptStepMachine, ({ context }) => ({
        promptText: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 3).

Only two recipe routes need collectionId as a request parameter:

- **GET /recipes** (list): Add required query parameter \`collectionId\` (string) — there is no recipe ID yet, so the caller must specify which collection to list.
- **POST /recipes** (create): Add required \`collectionId\` property to the request body — the recipe does not exist yet, so the caller must specify which collection to create it in.

All other recipe endpoints (GET/PUT/DELETE /recipes/:id, versions, notes, files, note-files) already have a recipe ID. The backend will look up \`recipe.collection_id\` from the DB to determine the collection. Do NOT add collectionId params to those routes.`,
      })),

      step(CdStepMachine, () => ({ path: "../service/http" })),

      step(PromptStepMachine, ({ context }) => ({
        promptText: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 3).

Add collection-based permission enforcement to all recipe (and nested resource) HTTP handlers. The approach differs based on whether the endpoint already has a recipe ID:

**Endpoints WITH a recipe ID** (GET/PUT/DELETE /recipes/:id, versions, notes, files, note-files):
1. Look up the recipe from the DB by its ID.
2. Read \`recipe.collection_id\` from the row.
3. Look up the caller's collection_member row (by collection_id + caller email). Return 403 if not a member.
4. Enforce roles: viewers can only read; editor/owner can mutate. Return 403 for insufficient role.
5. Validated-email rule: non-creator members must have a validated email. Return 403 if unvalidated (creator always has access).

**GET /recipes** (list — no recipe ID):
1. Extract \`collectionId\` from query params. Return 400 if missing.
2. Steps 3-5 above using the provided collectionId.
3. Filter recipes by collection_id.

**POST /recipes** (create — recipe does not exist yet):
1. Extract \`collectionId\` from request body. Return 400 if missing.
2. Steps 3-5 above (require editor/owner) using the provided collectionId.
3. Set \`recipe.collection_id\` on the new row.

Extract a shared middleware or helper (e.g. \`requireCollectionMembership\`) that takes a collection_id and the caller's email, checks membership + role + validated-email, and returns the member row. Handlers that have a recipe ID call it after looking up the recipe; list/create call it after extracting collectionId from the request. Apply to all recipe, version, note, file, and note-file handlers.`,
      })),

      GetFeedbackStep,
    ],
  });

export default CollectionsM3RecipeScopingBackendWorkflowDefinition;
