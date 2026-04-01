import {
  createKratosAuthRouter,
  type CreateKratosAuthRouterOptions,
} from "@saflib/ory-kratos-spa/router";

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view
// END WORKFLOW AREA

export const createAuthRouter = (options?: CreateKratosAuthRouterOptions) => {
  return createKratosAuthRouter(options);
};
