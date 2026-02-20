/**
 * Phase 8c: App client — menu list, menu create/edit.
 * Package: recipes/clients/app.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import { AddSpaViewWorkflowDefinition } from "@saflib/vue/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const RecipesInitPhase8cWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-phase-8c",
  description: "App client: menu list, menu create/edit (admin only).",
  input,
  context: ({ input }) => ({
    agentConfig: { ...input.agentConfig, resetTimeoutEachStep: true },
  }),
  sourceUrl: import.meta.url,
  templateFiles: {},
  docFiles: {
    spec: path.join(import.meta.dirname, "recipes-init.spec.md"),
    plan: path.join(import.meta.dirname, "recipes-init.plan.md"),
  },
  versionControl: { allowPaths: ["**/*"], commitEachStep: true },
  steps: [
    step(CdStepMachine, () => ({ path: "../clients/app" })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), ({ context }) => ({
      path: "./pages/menus/list",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Make sure you understand the overall plan and your part in it (Phase 8c: app client — menu list, menu create/edit). Then: Menu list: admin sees all, non-admin public; hide create for non-admin. Reuse SDK. See plan Phase 8.8.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/menus/edit",
      prompt: `Menu create/edit: name, is_public, groupings (name + ordered recipe ids). Admin only. See plan Phase 8.9.`,
    })),
  ],
});

export default RecipesInitPhase8cWorkflowDefinition;
