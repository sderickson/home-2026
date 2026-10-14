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
  let menuId: string;

  test("unauthenticated GET /recipes/{id}/shared returns 200 / 404", async ({
    page,
    request,
    loginPage,
    registrationPage,
    verifyWallPage,
  }) => {
    ({ recipeId, fileId, menuId } = await seedSharedRecipeWithFile(
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

  test("unauthenticated GET /menus/{id}/shared returns 200 / 404", async ({
    request,
  }) => {
    const ok = await request.get(`${api()}/menus/${menuId}/shared`);
    expect(ok.status()).toBe(200);
    const body = await ok.json();
    expect(body.menu?.id).toBe(menuId);
    expect(body.recipes?.map((r: { id: string }) => r.id)).toEqual([recipeId]);
    // Files point at the public recipe blob path, not the authenticated one.
    expect(body.files?.[0]?.downloadUrl).toContain(
      `/recipes/${recipeId}/shared/files/${fileId}/blob`,
    );

    const missing = await request.get(`${api()}/menus/${UNKNOWN_UUID}/shared`);
    expect(missing.status()).toBe(404);
  });

  test("authenticated menu route still returns 401 without session", async ({
    request,
  }) => {
    const menu = await request.get(`${api()}/menus/${menuId}`);
    expect(menu.status()).toBe(401);
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
