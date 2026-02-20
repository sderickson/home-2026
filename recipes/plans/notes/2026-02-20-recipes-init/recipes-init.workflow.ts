import {
  defineWorkflow,
  // step,
  // makeWorkflowMachine,
  // CdStepMachine,
  // CommandStepMachine,
} from "@saflib/workflows";

// TODO: Import workflows from the appropriate packages

import path from "path";

const input = [] as const;

interface RecipesInitWorkflowContext {}

export const RecipesInitWorkflowDefinition = defineWorkflow<
  typeof input,
  RecipesInitWorkflowContext
>({
  id: "plans/recipes-init",
  description: "Project recipes-init workflow",
  input,
  context: ({ input }) => ({
    agentConfig: {
      ...input.agentConfig,
      // So this workflow can be arbitrarily long.
      resetTimeoutEachStep: true,
    },
  }),
  sourceUrl: import.meta.url,
  templateFiles: {},
  docFiles: {
    spec: path.join(import.meta.dirname, "recipes-init.spec.md"),
  },

  versionControl: {
    allowPaths: ["**/*"], // TODO: Make this more specific if you can. You only need to specify changes made in this specific workflow (e.g. prompt steps, command steps, etc), not other workflows which you invoke.
    commitEachStep: true,
  },

  steps: [
    // TODO: Add steps here for implement the spec.
    // Mostly it should be Cd steps to move into the appropriate directory, then
    // makeWorkflowMachine calls to the appropriate workflows to implement the spec.

    // step(CdStepMachine, () => ({
    //   path: "./secrets/secrets-db",
    // })),

    // TODO: For each workflow, include a prompt which guides the agent doing the implementation.
    // step(makeWorkflowMachine(UpdateSchemaWorkflowDefinition), () => ({
    //   path: "schemas/foo.ts",
    //   prompt: `...`,
    // })),
  ],
});

export default RecipesInitWorkflowDefinition;
