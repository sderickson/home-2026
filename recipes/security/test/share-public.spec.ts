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
import {
  seedSharedRecipeWithFile,
  UNKNOWN_UUID,
} from "../fixtures/seed-shared-recipe.ts";

type SharePublicFixtures = {
  loginPage: LoginPageFixture;
  registrationPage: RegistrationPageFixture;
  verifyWallPage: VerifyWallPageFixture;
};

const test = base.extend<SharePublicFixtures>({
  loginPage: loginPageFixture,
  registrationPage: registrationPageFixture,
  verifyWallPage: verifyWallPageFixture,
});

const api = () => recipesApiOrigin();

/**
 * Caddy `@public_monolith` allowlists share GETs; authenticated recipe/file
 * routes must still require a Kratos session (401 without cookies).
 */
test.describe.serial("public share surface (recipes API)", () => {
  let recipeId: string;
  let fileId: string;

  test("unauthenticated GET /recipes/{id}/shared returns 200 / 404", async ({
    page,
    request,
    loginPage,
    registrationPage,
    verifyWallPage,
  }) => {
    ({ recipeId, fileId } = await seedSharedRecipeWithFile(
      page,
      registrationPage,
      verifyWallPage,
      loginPage,
      request,
    ));

    const ok = await request.get(`${api()}/recipes/${recipeId}/shared`);
    expect(ok.status()).toBe(200);
    const body = await ok.json();
    expect(body.recipe?.id).toBe(recipeId);

    const missing = await request.get(
      `${api()}/recipes/${UNKNOWN_UUID}/shared`,
    );
    expect(missing.status()).toBe(404);
  });

  test("unauthenticated GET shared blob returns 200", async ({ request }) => {
    const res = await request.get(
      `${api()}/recipes/${recipeId}/shared/files/${fileId}/blob`,
    );
    expect(res.status()).toBe(200);
    const bytes = await res.body();
    expect(bytes.toString()).toBe("share-probe-bytes");
  });

  test("authenticated recipe routes still return 401 without session", async ({
    request,
  }) => {
    const recipe = await request.get(`${api()}/recipes/${recipeId}`);
    expect(recipe.status()).toBe(401);

    const blob = await request.get(
      `${api()}/recipes/${recipeId}/files/${fileId}/blob`,
    );
    expect(blob.status()).toBe(401);
  });
});
