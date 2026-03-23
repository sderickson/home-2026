import type { LoginFlow, RegistrationFlow } from "@ory/client";
import { LoginFlowState, RegistrationFlowState } from "@ory/client";

/** Mutable registration flow returned by browser / get-by-id handlers. */
export let mockRegistrationFlow: RegistrationFlow = createDefaultMockRegistrationFlow();

/** Mutable login flow for MSW (post-registration sign-in). */
export let mockLoginFlow: LoginFlow = createDefaultMockLoginFlow();

export type KratosRegistrationPostResult = "success" | "validation_error";

/** How `POST /self-service/registration` responds in fake handlers. */
let mockRegistrationPostResult: KratosRegistrationPostResult = "success";

export function getMockRegistrationPostResult(): KratosRegistrationPostResult {
  return mockRegistrationPostResult;
}

export function setMockRegistrationPostResult(r: KratosRegistrationPostResult) {
  mockRegistrationPostResult = r;
}

export function resetKratosFlowMocks() {
  mockRegistrationFlow = createDefaultMockRegistrationFlow();
  mockLoginFlow = createDefaultMockLoginFlow();
  mockRegistrationPostResult = "success";
}

export function createDefaultMockLoginFlow(): LoginFlow {
  return {
    id: "mock-login-flow",
    type: "browser",
    state: LoginFlowState.ChooseMethod,
    expires_at: new Date(Date.now() + 3_600_000).toISOString(),
    issued_at: new Date().toISOString(),
    request_url: "http://auth.localhost/login",
    ui: {
      action: "http://kratos.localhost/self-service/login?flow=mock-login-flow",
      method: "POST",
      nodes: [
        {
          type: "input",
          group: "default",
          attributes: {
            node_type: "input",
            name: "csrf_token",
            type: "hidden",
            value: "mock-login-csrf",
          },
          meta: {},
        },
        {
          type: "input",
          group: "default",
          attributes: {
            node_type: "input",
            name: "identifier",
            type: "text",
            required: true,
          },
          meta: {
            label: { type: "text", text: "Email", id: 1 },
          },
        },
        {
          type: "input",
          group: "password",
          attributes: {
            node_type: "input",
            name: "password",
            type: "password",
            required: true,
          },
          meta: {
            label: { type: "text", text: "Password", id: 2 },
          },
        },
        {
          type: "input",
          group: "password",
          attributes: {
            node_type: "input",
            name: "method",
            type: "submit",
            value: "password",
          },
          meta: {},
        },
      ],
      messages: [],
    },
  } as unknown as LoginFlow;
}

export function createDefaultMockRegistrationFlow(): RegistrationFlow {
  return {
    id: "mock-registration-flow",
    type: "browser",
    state: RegistrationFlowState.ChooseMethod,
    expires_at: new Date(Date.now() + 3_600_000).toISOString(),
    issued_at: new Date().toISOString(),
    request_url: "http://auth.localhost/registration",
    ui: {
      action:
        "http://kratos.localhost/self-service/registration?flow=mock-registration-flow",
      method: "POST",
      nodes: [
        {
          type: "input",
          group: "default",
          attributes: {
            node_type: "input",
            name: "csrf_token",
            type: "hidden",
            value: "mock-csrf",
          },
          meta: {},
        },
        {
          type: "input",
          group: "default",
          attributes: {
            node_type: "input",
            name: "traits.email",
            type: "email",
            required: true,
          },
          meta: {
            label: { type: "text", text: "Email", id: 1 },
          },
        },
        {
          type: "input",
          group: "password",
          attributes: {
            node_type: "input",
            name: "password",
            type: "password",
            required: true,
          },
          meta: {
            label: { type: "text", text: "Password", id: 2 },
          },
        },
        {
          type: "input",
          group: "password",
          attributes: {
            node_type: "input",
            name: "method",
            type: "submit",
            value: "password",
          },
          meta: {},
        },
      ],
      messages: [],
    },
  } as unknown as RegistrationFlow;
}
