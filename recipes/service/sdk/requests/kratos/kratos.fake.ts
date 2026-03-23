import { http, HttpResponse } from "msw";
import {
  getMockRegistrationPostResult,
  mockRegistrationFlow,
} from "./kratos-mocks.ts";

export const kratosToSessionHandler = http.get("*/sessions/whoami", () =>
  HttpResponse.json(null, { status: 401 }),
);

export const kratosRegistrationBrowserHandler = http.get(
  "*/self-service/registration/browser",
  () => HttpResponse.json(mockRegistrationFlow),
);

export const kratosRegistrationFlowByIdHandler = http.get(
  "*/self-service/registration/flows",
  ({ request }) => {
    const id = new URL(request.url).searchParams.get("flow");
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

export const kratosFakeHandlers = [
  kratosToSessionHandler,
  kratosRegistrationBrowserHandler,
  kratosRegistrationFlowByIdHandler,
  kratosUpdateRegistrationHandler,
  kratosBrowserLogoutHandler,
];
