import type { LinkMap } from "@saflib/links";

const subdomain = "admin.recipes";

export const adminLinks: LinkMap = {
  home: {
    subdomain,
    path: "/",
  },
  users: {
    subdomain,
    path: "/users",
  },
  cronJobs: {
    subdomain,
    path: "/cron-jobs",
  },
  jobs: {
    subdomain,
    path: "/jobs",
  },
  logs: {
    subdomain,
    path: "/logs",
  },
  metrics: {
    subdomain,
    path: "/metrics",
  },
  events: {
    subdomain,
    path: "/events",
  },
  errors: {
    subdomain,
    path: "/errors",
  },
  opsIssues: {
    subdomain,
    path: "/ops-issues",
  },
  opsAlerts: {
    subdomain,
    path: "/ops-alerts",
  },
  opsMetrics: {
    subdomain,
    path: "/ops-metrics",
  },
  opsLogs: {
    subdomain,
    path: "/ops-logs",
  },
  opsTokens: {
    subdomain,
    path: "/ops-tokens",
  },
  // BEGIN WORKFLOW AREA page-links FOR vue/add-view
  // END WORKFLOW AREA
};
