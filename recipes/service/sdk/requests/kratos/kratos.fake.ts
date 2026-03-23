import { http, HttpResponse } from "msw";
import {
  getMockRegistrationPostResult,
  mockLoginFlow,
  mockRegistrationFlow,
} from "./kratos-mocks.ts";

export const kratosToSessionHandler = http.get("*/sessions/whoami", () =>
  HttpResponse.json(null, { status: 401 }),
);

export const kratosRegistrationBrowserHandler = http.get(
  "*/self-service/registration/browser",
  ({ request }) => {
    const returnTo = new URL(request.url).searchParams.get("return_to") ?? undefined;
    return HttpResponse.json({
      ...mockRegistrationFlow,
      return_to: returnTo ?? mockRegistrationFlow.return_to,
    });
  },
);

export const kratosRegistrationFlowByIdHandler = http.get(
  "*/self-service/registration/flows",
  ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id") ?? url.searchParams.get("flow");
    if (id && id === mockRegistrationFlow.id) {
      return HttpResponse.json(mockRegistrationFlow);
    }
    return new HttpResponse(null, { status: 404 });
  },
);

export const kratosUpdateRegistrationHandler = http.post(
  "*/self-service/registration",
  async () => {
    if (getMockRegistrationPostResult() === "success") {
      return HttpResponse.json({
        identity: {
          id: "mock-identity",
          schema_id: "default",
          schema_url: "",
          traits: { email: "user@example.com" },
        },
        session: { id: "mock-session", active: true },
      });
    }
    const body = {
      ...mockRegistrationFlow,
      ui: {
        ...mockRegistrationFlow.ui,
        messages: [
          ...(mockRegistrationFlow.ui.messages ?? []),
          { type: "error" as const, text: "Validation failed (fake)" },
        ],
      },
    };
    return HttpResponse.json(body, { status: 400 });
  },
);

export const kratosBrowserLogoutHandler = http.get(
  "*/self-service/logout/browser",
  () =>
    HttpResponse.json({
      logout_token: "mock-logout-token",
      logout_url: "http://kratos.localhost/self-service/logout?token=mock",
    }),
);

export const kratosLoginBrowserHandler = http.get(
  "*/self-service/login/browser",
  ({ request }) => {
    const returnTo = new URL(request.url).searchParams.get("return_to") ?? undefined;
    return HttpResponse.json({
      ...mockLoginFlow,
      return_to: returnTo ?? mockLoginFlow.return_to,
    });
  },
);

export const kratosUpdateLoginHandler = http.post("*/self-service/login", () =>
  HttpResponse.json({
    session: { id: "mock-session-after-login", active: true },
    identity: {
      id: "mock-identity",
      schema_id: "default",
      traits: { email: "register@test.dev" },
    },
  }),
);

export const kratosFakeHandlers = [
  kratosToSessionHandler,
  kratosRegistrationBrowserHandler,
  kratosRegistrationFlowByIdHandler,
  kratosUpdateRegistrationHandler,
  kratosLoginBrowserHandler,
  kratosUpdateLoginHandler,
  kratosBrowserLogoutHandler,
];
