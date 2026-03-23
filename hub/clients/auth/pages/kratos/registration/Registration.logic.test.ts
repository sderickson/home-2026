import { describe, it, expect } from "vitest";
import { AxiosError } from "axios";
import type { RegistrationFlow } from "@ory/client";
import {
  buildRegistrationPasswordBody,
  isKratosInputNode,
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
    expect(postRegistrationNavigationUrl({} as RegistrationFlow)).toBe(undefined);
    expect(
      postRegistrationNavigationUrl({
        return_to: "  ",
      } as RegistrationFlow),
    ).toBe(undefined);
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
      const node = { type: "text", attributes: { text: { text: "hi" } } } as UiNode;
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
      expect(registrationSubmitErrorMessage(err, "fallback")).toBe("Request failed");
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
