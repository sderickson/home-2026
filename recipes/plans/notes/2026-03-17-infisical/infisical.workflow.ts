import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import {
  InitIntegrationWorkflowDefinition,
  AddCallWorkflowDefinition,
} from "@saflib/integrations/workflows";

import path from "path";

const input = [] as const;

interface InfisicalWorkflowContext {
  docFiles?: { spec: string; plan: string };
}

export const InfisicalWorkflowDefinition = defineWorkflow<
  typeof input,
  InfisicalWorkflowContext
>({
  id: "plans/infisical",
  description:
    "Infisical integration: init package (token auth, Node SDK), add getSecretByName call",
  input,
  context: ({ input }) => ({
    agentConfig: { ...input.agentConfig },
    docFiles: {
      spec: path.join(import.meta.dirname, "infisical.spec.md"),
      plan: path.join(import.meta.dirname, "infisical.plan.md"),
    },
  }),
  sourceUrl: import.meta.url,
  templateFiles: {},
  docFiles: {
    spec: path.join(import.meta.dirname, "infisical.spec.md"),
    plan: path.join(import.meta.dirname, "infisical.plan.md"),
  },

  versionControl: {
    allowPaths: [
      "../service/integrations/infisical/**",
      "notes/2026-03-17-infisical/**",
    ],
    commitEachStep: true,
  },

  steps: [
    // Create the infisical integration package (client, env schema, mock, ping). Run from recipes/plans so path is relative.
    step(
      makeWorkflowMachine(InitIntegrationWorkflowDefinition),
      ({ context }) => ({
        name: "@sderickson/recipes-infisical",
        path: "../service/integrations/infisical",
        prompt: `Create the infisical integration package. see ${context.docFiles?.spec} and ${context.docFiles?.plan} for details.`,
      }),
    ),

    // Cd into the new integration package for add-call.
    step(CdStepMachine, () => ({
      path: "../service/integrations/infisical",
    })),

    // Add the single call: get secret by name. Implement using Infisical Node SDK, token from env, map errors, respect MOCK_INTEGRATIONS.
    step(makeWorkflowMachine(AddCallWorkflowDefinition), ({ context }) => ({
      path: "./calls/get-secret-by-name.ts",
      prompt: `Implement getSecretByName per ${context.docFiles?.spec} and ${context.docFiles?.plan}. Use the Infisical Node SDK with token auth (e.g. INFISICAL_TOKEN from env). Return ReturnsError<string, InfisicalClientError>. Define InfisicalNotFoundError, InfisicalUnauthorizedError, InfisicalNetworkError and map SDK errors. When MOCK_INTEGRATIONS is set, return mock value. Export from index.`,
    })),

    GetFeedbackStep,
  ],
});

export default InfisicalWorkflowDefinition;
