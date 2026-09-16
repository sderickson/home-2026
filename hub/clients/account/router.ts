import {
  createRouter,
  createWebHistory,
  type RouterHistory,
  type RouteRecordRaw,
} from "vue-router";
import { accountLinks } from "@sderickson/hub-links";
import { PageNotFound } from "@saflib/vue/components";
import HomeAsync from "./pages/home/HomeAsync.vue";
import AccountSettingsSection from "./pages/account-settings/AccountSettingsSection.vue";

// BEGIN SORTED WORKFLOW AREA page-imports FOR vue/add-view
// END WORKFLOW AREA

function accountPathSegment(path: string): string {
  return path.replace(/^\//, "");
}

export const createAccountRouter = (options?: {
  history?: RouterHistory;
}) => {
  const routes: RouteRecordRaw[] = [
    {
      path: accountLinks.home.path,
      component: HomeAsync,
      children: [
        {
          path: "",
          redirect: accountLinks.profile.path,
        },
        {
          path: accountPathSegment(accountLinks.profile.path),
          component: AccountSettingsSection,
          props: { section: "profile" },
        },
        {
          path: accountPathSegment(accountLinks.email.path),
          component: AccountSettingsSection,
          props: { section: "email" },
        },
        {
          path: accountPathSegment(accountLinks.password.path),
          component: AccountSettingsSection,
          props: { section: "password" },
        },
        {
          path: accountPathSegment(accountLinks.mfa.path),
          component: AccountSettingsSection,
          props: { section: "totp" },
        },
        {
          path: accountPathSegment(accountLinks.sessions.path),
          component: AccountSettingsSection,
          props: { section: "sessions" },
        },
      ],
    },
    // BEGIN WORKFLOW AREA page-routes FOR vue/add-view
    // END WORKFLOW AREA
    { path: "/:pathMatch(.*)*", component: PageNotFound },
  ];
  return createRouter({
    history: options?.history ?? createWebHistory("/"),
    routes,
  });
};
