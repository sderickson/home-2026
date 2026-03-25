import { describe, it, expect } from "vitest";
import { AxiosError } from "axios";
import type { LoginFlow, RegistrationFlow } from "@ory/client";
import {
  buildLoginPasswordBody,
  buildRegistrationPasswordBody,
  csrfTokenFromUiFlow,
  isKratosInputNode,
  kratosEffectiveInputType,
  postRegistrationNavigationUrl,
  registrationSubmitErrorMessage,
  traitsEmailFromFormData,
} from "./Registration.logic.ts";
import type { UiNode } from "@ory/client";

describe("postRegistrationNavigationUrl", () => {
  it("returns trimmed return_to when set", () => {
    expect(
      postRegistrationNavigationUrl({
        return_to: "  https://app.example/  ",
      } as RegistrationFlow),
    ).toBe("https://app.example/");
  });

  it("returns undefined when missing or blank", () => {
    expect(postRegistrationNavigationUrl({} as RegistrationFlow)).toBe(
      undefined,
    );
    expect(
      postRegistrationNavigationUrl({
        return_to: "  ",
      } as RegistrationFlow),
    ).toBe(undefined);
  });
});

describe("buildLoginPasswordBody", () => {
  it("uses CSRF from the login flow and password method", () => {
    const loginFlow = {
      ui: {
        nodes: [
          {
            type: "input",
            attributes: {
              node_type: "input",
              name: "csrf_token",
              value: "csrf-xyz",
            },
          },
        ],
      },
    } as LoginFlow;
    expect(
      buildLoginPasswordBody(loginFlow, "u@example.com", "secret"),
    ).toEqual({
      method: "password",
      csrf_token: "csrf-xyz",
      identifier: "u@example.com",
      password: "secret",
    });
  });
});

describe("csrfTokenFromUiFlow", () => {
  it("returns empty when no csrf node", () => {
    expect(
      csrfTokenFromUiFlow({
        ui: { nodes: [], action: "https://example.com", method: "POST" },
      } as unknown as LoginFlow),
    ).toBe("");
  });
});

describe("Registration.logic", () => {
  describe("traitsEmailFromFormData", () => {
    it("prefers traits.email", () => {
      const fd = new FormData();
      fd.set("traits.email", "  a@b.co  ");
      fd.set("email", "other@x.co");
      expect(traitsEmailFromFormData(fd)).toBe("a@b.co");
    });

    it("falls back to email and traits[email]", () => {
      const fd1 = new FormData();
      fd1.set("email", "one@test.dev");
      expect(traitsEmailFromFormData(fd1)).toBe("one@test.dev");

      const fd2 = new FormData();
      fd2.set("traits[email]", "two@test.dev");
      expect(traitsEmailFromFormData(fd2)).toBe("two@test.dev");
    });
  });

  describe("buildRegistrationPasswordBody", () => {
    it("builds password method payload from FormData", () => {
      const fd = new FormData();
      fd.set("csrf_token", "tok");
      fd.set("password", "secret");
      fd.set("traits.email", "u@example.com");
      expect(buildRegistrationPasswordBody(fd)).toEqual({
        method: "password",
        csrf_token: "tok",
        password: "secret",
        traits: { email: "u@example.com" },
      });
    });
  });

  describe("isKratosInputNode", () => {
    it("narrows input nodes", () => {
      const node = {
        type: "input",
        attributes: { node_type: "input", name: "x", type: "text" },
      } as UiNode;
      expect(isKratosInputNode(node)).toBe(true);
    });

    it("rejects non-input nodes", () => {
      const node = {
        type: "text",
        attributes: { text: { text: "hi" } },
      } as UiNode;
      expect(isKratosInputNode(node)).toBe(false);
    });
  });

  describe("registrationSubmitErrorMessage", () => {
    it("uses axios message for object response bodies", () => {
      const err = new AxiosError("Request failed");
      err.response = {
        status: 500,
        data: { foo: 1 },
      } as AxiosError["response"];
      expect(registrationSubmitErrorMessage(err, "fallback")).toBe(
        "Request failed",
      );
    });

    it("stringifies primitive axios response data", () => {
      const err = new AxiosError("fail");
      err.response = { status: 500, data: "plain" } as AxiosError["response"];
      expect(registrationSubmitErrorMessage(err, "fallback")).toBe("plain");
    });

    it("uses Error message or fallback", () => {
      expect(registrationSubmitErrorMessage(new Error("e"), "f")).toBe("e");
      expect(registrationSubmitErrorMessage(null, "f")).toBe("f");
    });
  });
});

describe("kratosEffectiveInputType", () => {
  it("masks password fields when Kratos sends type text", () => {
    expect(kratosEffectiveInputType({ name: "password", type: "text" })).toBe("password");
    expect(kratosEffectiveInputType({ name: "traits.password", type: "text" })).toBe("password");
  });

  it("preserves submit and hidden", () => {
    expect(kratosEffectiveInputType({ name: "x", type: "submit" })).toBe("submit");
    expect(kratosEffectiveInputType({ name: "csrf_token", type: "hidden" })).toBe("hidden");
  });
});
