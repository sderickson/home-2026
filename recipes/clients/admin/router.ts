import {
  createRouter,
  createWebHistory,
  type RouterHistory,
  type RouteRecordRaw,
} from "vue-router";
import { adminLinks } from "@sderickson/recipes-links";
import { PageNotFound } from "@saflib/vue/components";
import { isDevelopmentDeployment } from "@saflib/vue";
import { CronJobsAsync } from "@saflib/cron-vue";
import { JobsAsync } from "@saflib/jobs-vue";
import { ProductEventsAsync } from "@saflib/analytics-vue";
import { MetricsAsync } from "@saflib/node-metrics-vue";
import { ErrorsAsync } from "@saflib/errors-vue";
import HomeAsync from "./pages/home/HomeAsync.vue";
import UsersAsync from "./pages/users/UsersAsync.vue";
import DevLogsAsync from "./pages/logs/DevLogsAsync.vue";

// BEGIN WORKFLOW AREA page-imports FOR vue/add-view
// END WORKFLOW AREA

const devObservabilityRoutes: RouteRecordRaw[] = isDevelopmentDeployment()
  ? [
      {
        path: adminLinks.errors.path,
        component: ErrorsAsync,
      },
      {
        path: adminLinks.logs.path,
        component: DevLogsAsync,
      },
      {
        path: adminLinks.metrics.path,
        component: MetricsAsync,
      },
      {
        path: adminLinks.events.path,
        component: ProductEventsAsync,
      },
    ]
  : [];

export const createAdminRouter = (options?: { history?: RouterHistory }) => {
  const routes: RouteRecordRaw[] = [
    {
      path: adminLinks.home.path,
      component: HomeAsync,
    },
    {
      path: adminLinks.users.path,
      component: UsersAsync,
    },
    {
      path: adminLinks.cronJobs.path,
      component: CronJobsAsync,
    },
    {
      path: adminLinks.jobs.path,
      component: JobsAsync,
    },
    ...devObservabilityRoutes,
    // BEGIN WORKFLOW AREA page-routes FOR vue/add-view
    // END WORKFLOW AREA
    { path: "/:pathMatch(.*)*", component: PageNotFound },
  ];
  return createRouter({
    history: options?.history ?? createWebHistory("/"),
    routes,
  });
};
