import { expect, test as base } from "@playwright/test";
import {
  loginPageFixture,
  registrationPageFixture,
  verifyWallPageFixture,
  type LoginPageFixture,
  type RegistrationPageFixture,
  type VerifyWallPageFixture,
} from "@saflib/ory-kratos-spa/fixtures";
import { recipesApiOrigin } from "../fixtures/http-helpers.ts";
import { sessionAsRegisteredUser } from "../fixtures/kratos-session.ts";

type AuthzFixtures = {
  loginPage: LoginPageFixture;
  registrationPage: RegistrationPageFixture;
  verifyWallPage: VerifyWallPageFixture;
};

const test = base.extend<AuthzFixtures>({
  loginPage: loginPageFixture,
  registrationPage: registrationPageFixture,
  verifyWallPage: verifyWallPageFixture,
});

const api = () => recipesApiOrigin();

test.describe("authorization (recipes API)", () => {
  test("GET /recipes without session returns 401", async ({ request }) => {
    const res = await request.get(`${api()}/recipes`);
    expect(res.status()).toBe(401);
  });

  test("GET /admin/users/by-id without session returns 401", async ({
    request,
  }) => {
    const res = await request.get(
      `${api()}/admin/users/by-id?id=00000000-0000-0000-0000-000000000001`,
    );
    expect(res.status()).toBe(401);
  });

  test("non-admin cannot GET /admin/users/by-id", async ({
    page,
    loginPage,
    registrationPage,
    verifyWallPage,
  }) => {
    await sessionAsRegisteredUser(
      page,
      registrationPage,
      verifyWallPage,
      loginPage,
    );

    const res = await page.request.get(
      `${api()}/admin/users/by-id?id=00000000-0000-0000-0000-000000000001`,
    );
    // Unverified sessions fail email check first; verified non-admins get 403.
    expect([403]).toContain(res.status());
    const body = await res.json();
    expect(JSON.stringify(body).toLowerCase()).toMatch(
      /forbidden|email.?verif|mfa|admin/,
    );
  });
});
