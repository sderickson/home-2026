import {
  createWebHistory,
  createRouter,
  type RouteRecordRaw,
} from "vue-router";
import { StubComponent } from "@saflib/vue/components";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("./LayoutDemo.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
