import type { LoginFlow, RegistrationFlow, VerificationFlow } from "@ory/client";
import { LoginFlowState, RegistrationFlowState, VerificationFlowState } from "@ory/client";

/** Mutable registration flow returned by browser / get-by-id handlers. */
export let mockRegistrationFlow: RegistrationFlow = createDefaultMockRegistrationFlow();

/** Mutable login flow for MSW (post-registration sign-in). */
export let mockLoginFlow: LoginFlow = createDefaultMockLoginFlow();

/** Mutable verification flow for MSW. */
export let mockVerificationFlow: VerificationFlow = createDefaultMockVerificationFlow();

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
  mockVerificationFlow = createDefaultMockVerificationFlow();
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

export function createDefaultMockVerificationFlow(): VerificationFlow {
  return {
    id: "mock-verification-flow",
    type: "browser",
    state: VerificationFlowState.SentEmail,
    expires_at: new Date(Date.now() + 3_600_000).toISOString(),
    issued_at: new Date().toISOString(),
    request_url: "http://auth.localhost/verification",
    ui: {
      action:
        "http://kratos.localhost/self-service/verification?flow=mock-verification-flow",
      method: "POST",
      nodes: [
        {
          type: "input",
          group: "default",
          attributes: {
            node_type: "input",
            name: "csrf_token",
            type: "hidden",
            value: "mock-verification-csrf",
          },
          meta: {},
        },
        {
          type: "input",
          group: "code",
          attributes: {
            node_type: "input",
            name: "code",
            type: "text",
            required: true,
          },
          meta: {
            label: { type: "text", text: "Verification code", id: 1 },
          },
        },
        {
          type: "input",
          group: "code",
          attributes: {
            node_type: "input",
            name: "method",
            type: "submit",
            value: "code",
          },
          meta: {},
        },
      ],
      messages: [],
    },
  } as unknown as VerificationFlow;
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
