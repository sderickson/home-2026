<template>
  <v-app>
    <!-- Breadcrumb bar (app SPA): trail on the left, everything else in a menu -->
    <v-app-bar v-if="mounted && !bare && breadcrumbBar" class="px-1 px-md-4">
      <nav
        class="breadcrumb-bar d-none d-md-flex"
        :aria-label="recipes_layout.breadcrumb_label"
      >
        <v-breadcrumbs class="breadcrumb-bar__trail">
          <template v-for="(crumb, i) in crumbs" :key="i">
            <v-breadcrumbs-divider v-if="i > 0" />
            <v-breadcrumbs-item
              :to="i < crumbs.length - 1 ? crumb.to : undefined"
              :disabled="i === crumbs.length - 1"
              :aria-current="i === crumbs.length - 1 ? 'page' : undefined"
              :class="{ 'breadcrumb-bar__root font-title': i === 0 }"
            >
              {{ crumb.title }}
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>
      </nav>

      <!-- Phones: back to the parent page -->
      <div class="breadcrumb-bar d-flex d-md-none align-center">
        <template v-if="parentCrumb">
          <v-btn
            :to="parentCrumb.to"
            exact
            icon="mdi-chevron-left"
            variant="text"
            :aria-label="`${recipes_layout.back_to} ${parentCrumb.title}`"
          />
          <span
            class="breadcrumb-bar__parent font-mono text-muted text-truncate"
          >
            {{ parentCrumb.title }}
          </span>
        </template>
        <router-link
          v-else
          :to="crumbs[0]!.to!"
          class="breadcrumb-bar__root font-title ml-3"
        >
          {{ crumbs[0]!.title }}
        </router-link>
      </div>

      <template #append>
        <slot name="app-bar-append" />
        <v-menu location="bottom end">
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              icon="mdi-menu"
              variant="text"
              :aria-label="recipes_layout.open_menu"
            />
          </template>
          <v-list density="comfortable" min-width="200">
            <v-list-item
              v-for="link in links"
              :key="`${link.subdomain}:${link.path}:${link.name}`"
              :title="link.name"
              :href="toHref(link, link.options)"
            />
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-app-bar v-else-if="mounted && !bare" class="px-md-4">
      <v-app-bar-title>
        <a :href="toHref(rootLinks.home)" class="brand font-title">
          <span class="brand__mark" aria-hidden="true" />
          {{ recipes_layout.nav_title }}
        </a>
      </v-app-bar-title>

      <!-- Desktop Navigation Links (hidden on mobile) -->
      <nav
        class="d-none d-md-flex align-center"
        :aria-label="recipes_layout.nav_label"
      >
        <v-btn
          v-for="link in links"
          :key="`${link.subdomain}:${link.path}:${link.name}`"
          variant="text"
          :color="isCurrent(link) ? undefined : 'muted'"
          :class="{ 'font-weight-semibold': isCurrent(link) }"
          :aria-current="isCurrent(link) ? 'page' : undefined"
          :href="toHref(link, link.options)"
        >
          {{ link.name }}
        </v-btn>
      </nav>

      <template #append>
        <slot name="app-bar-append" />
        <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer">
          <v-icon v-if="!drawer">mdi-menu</v-icon>
          <v-icon v-else>mdi-close</v-icon>
        </v-app-bar-nav-icon>
      </template>
    </v-app-bar>

    <!-- Mobile drawer also waits for mount: SSG hrefs are path-only and VitePress
         treats same-origin /new-login as an in-app route → /new-login.html 404. -->
    <v-navigation-drawer
      v-if="mounted && !bare && !breadcrumbBar"
      v-model="drawer"
      disable-resize-watcher
      location="top"
      :width="drawer ? '285' : '0'"
    >
      <v-list-item
        v-for="link in links"
        :key="`${link.subdomain}:${link.path}:${link.name}`"
        :title="link.name"
        class="text-uppercase text-center py-4"
        :href="toHref(link, link.options)"
      />
    </v-navigation-drawer>

    <v-navigation-drawer v-if="hasSidebar" permanent width="200">
      <v-list nav>
        <v-list-item
          v-for="link in sidebarLinks"
          :key="`${link.subdomain}:${link.path}`"
          :href="toHref(link)"
          :title="link.name"
          variant="text"
        />
        <template v-if="devSidebarLinks && devSidebarLinks.length > 0">
          <v-divider class="my-2" />
          <v-list-subheader>{{
            recipes_layout.dev_sidebar_title
          }}</v-list-subheader>
          <v-list-item
            v-for="link in devSidebarLinks"
            :key="`${link.subdomain}:${link.path}`"
            :href="toHref(link)"
            :title="link.name"
            variant="text"
          />
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <!-- Fluid up to a cap, so the width grows smoothly instead of stepping
           at each breakpoint. Pages narrow it further with max-width. -->
      <v-container fluid max-width="1200">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { recipes_layout } from "./RecipesLayout.strings.ts";
import { type Link, linkToHrefWithHost, type LinkOptions } from "@saflib/links";
import {
  adminLinks,
  appLinks,
  authLinks,
  rootLinks,
} from "@sderickson/recipes-links";
import { accountLinks as hubAccountLinks } from "@sderickson/hub-links";
import { useSiteAdmin } from "../../composables/useSiteAdmin.ts";
import {
  type Breadcrumb,
  useCurrentBreadcrumbs,
} from "../../composables/useBreadcrumbs.ts";

type SidebarLink = Link & { name: string };

const props = defineProps<{
  loggedIn?: boolean;
  sidebarLinks?: SidebarLink[];
  /** Development-only observability links. */
  devSidebarLinks?: SidebarLink[];
  /** Replace the logo and nav links with the page's breadcrumbs (see useBreadcrumbs) and a menu. */
  breadcrumbBar?: boolean;
  /** Skip app bars and nav drawer chrome (e.g. public share page). */
  bare?: boolean;
}>();

const pageCrumbs = useCurrentBreadcrumbs();
const crumbs = computed<Breadcrumb[]>(() => [
  { title: recipes_layout.breadcrumb_root, to: appLinks.home.path },
  ...pageCrumbs.value,
]);
const parentCrumb = computed(() =>
  crumbs.value.length > 1 ? crumbs.value[crumbs.value.length - 2] : undefined,
);

const { isSiteAdmin } = useSiteAdmin();

const hasSidebar = computed(
  () =>
    (props.sidebarLinks?.length ?? 0) > 0 ||
    (props.devSidebarLinks?.length ?? 0) > 0,
);

const drawer = ref(false);

// Forces a re-render after SSG hydration so links recompute with the real domain.
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

type LinkWithName = Link & { name: string; options?: LinkOptions };
const toHref = (link: Link, options?: LinkOptions) => {
  void mounted.value;
  return linkToHrefWithHost(link, options);
};
/** The nav link for the app this page is in (same origin), e.g. "App". */
const isCurrent = (link: Link) => {
  if (!mounted.value) return false;
  return (
    new URL(toHref(link), window.location.href).origin ===
    window.location.origin
  );
};
const links = computed<LinkWithName[]>(() => {
  if (props.loggedIn) {
    return [
      { ...appLinks.home, name: "App" },
      { ...hubAccountLinks.home, name: "Account" },
      ...(isSiteAdmin.value ? [{ ...adminLinks.home, name: "Admin" }] : []),
      {
        ...authLinks.logout,
        name: "Logout",
        options: { params: { return_to: linkToHrefWithHost(rootLinks.home) } },
      },
    ];
  }
  return [
    { ...rootLinks.home, name: "Home" },
    {
      ...authLinks.newLogin,
      name: "Login",
      options: { params: { return_to: linkToHrefWithHost(appLinks.home) } },
    },
  ];
});
</script>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 20px;
  color: rgb(var(--v-theme-on-surface));
  text-decoration: none;
}

/* Index-card mark: outlined rectangle with a red top line. */
.brand__mark {
  width: 22px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 2px;
  border: 1.5px solid currentColor;
  box-shadow: inset 0 4px 0 -2.5px rgb(var(--v-theme-demo));
}

.breadcrumb-bar {
  flex: 1 1 auto;
  min-width: 0;
}

.breadcrumb-bar__trail {
  flex-wrap: nowrap;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
}

.breadcrumb-bar__root {
  font-family: var(--font-title);
  font-weight: 600;
  font-size: 20px;
  color: rgb(var(--v-theme-on-surface));
  text-decoration: none;
}

.breadcrumb-bar__root :deep(a) {
  color: inherit;
  text-decoration: none;
}

.breadcrumb-bar__parent {
  font-size: 13px;
}

/* Below Vuetify md (matches the d-md-* classes above). */
@media (max-width: 839.98px) {
  .brand {
    gap: 8px;
    font-size: 17px;
  }
  .brand__mark {
    width: 18px;
    height: 13px;
  }
}
</style>
