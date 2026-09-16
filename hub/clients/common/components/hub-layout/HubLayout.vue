<template>
  <v-app>
    <!-- Events are rendered here for playwright tests to assert on -->
    <pre class="d-none" data-testid="events">{{ events }}</pre>

    <v-app-bar height="90" class="px-4" flat>
      <!-- Logo -->
      <v-app-bar-title>
        <SpaLink :link="{ subdomain: 'root', path: '/' }" class="logo-link">
          {{ t(hub_layout.nav_title) }}
        </SpaLink>
      </v-app-bar-title>

      <!-- Desktop Navigation Links (hidden on mobile) -->
      <v-toolbar-items class="d-none d-md-block">
        <v-btn
          v-for="link in links"
          :key="`${link.subdomain}:${link.path}`"
          variant="text"
          class="text-uppercase font-weight-regular"
          :href="getNavHref(link)"
        >
          {{ link.name }}
        </v-btn>
      </v-toolbar-items>

      <!-- Mobile Menu Button (hidden on desktop) -->
      <template #append>
        <v-app-bar-nav-icon class="d-md-none mr-4" @click="drawer = !drawer">
          <v-icon v-if="!drawer">mdi-menu</v-icon>
          <v-icon v-else>mdi-close</v-icon>
        </v-app-bar-nav-icon>
      </template>
    </v-app-bar>

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      disable-resize-watcher
      location="top"
      :width="drawer ? '285' : '0'"
    >
      <v-list-item
        v-for="link in links"
        :key="link.name"
        :title="link.name"
        class="text-uppercase text-center py-4"
        :href="getNavHref(link)"
      />
    </v-navigation-drawer>

    <v-navigation-drawer v-if="hasSidebar" permanent width="200">
      <v-list nav>
        <v-list-item
          v-for="link in sidebarLinks"
          :key="`${link.subdomain}:${link.path}`"
          :href="linkToHrefWithHost(link)"
          :title="link.name"
          variant="text"
        />
        <template v-if="devSidebarLinks && devSidebarLinks.length > 0">
          <v-divider class="my-2" />
          <v-list-subheader>{{ t(hub_layout.dev_sidebar_title) }}</v-list-subheader>
          <v-list-item
            v-for="link in devSidebarLinks"
            :key="`${link.subdomain}:${link.path}`"
            :href="linkToHrefWithHost(link)"
            :title="link.name"
            variant="text"
          />
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <ContentWidth v-if="!disableContainer" :variant="contentWidth">
        <slot />
      </ContentWidth>
      <slot v-else />
    </v-main>

    <SnackbarQueue />
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { hub_layout } from "./HubLayout.strings.ts";
import { useReverseT } from "../../i18n.ts";
import {
  linkToHref,
  linkToHrefWithHost,
  getHost,
  type Link,
} from "@saflib/links";
import { events } from "@saflib/vue";
import {
  ContentWidth,
  SnackbarQueue,
  SpaLink,
  type ContentWidthVariant,
} from "@saflib/vue/components";
import { useSiteAdmin } from "../../composables/useSiteAdmin.ts";

import {
  rootLinks,
  appLinks,
  authLinks,
  adminLinks,
  accountLinks,
} from "@sderickson/hub-links";

type SidebarLink = Link & { name: string };

const props = withDefaults(
  defineProps<{
    loggedIn?: boolean;
    /** Passed to {@link ContentWidth} when the layout owns the container. */
    contentWidth?: ContentWidthVariant;
    /** When true, skip the layout ContentWidth so the page owns its own shell. */
    disableContainer?: boolean;
    sidebarLinks?: SidebarLink[];
    /** Development-only observability links. */
    devSidebarLinks?: SidebarLink[];
  }>(),
  { contentWidth: "wide", disableContainer: false },
);

const { t } = useReverseT();
const { isSiteAdmin } = useSiteAdmin();

const route = useRoute();
const disableContainer = computed(() => {
  return props.disableContainer || route.meta?.disableContainer === true;
});

const hasSidebar = computed(
  () =>
    (props.sidebarLinks?.length ?? 0) > 0 ||
    (props.devSidebarLinks?.length ?? 0) > 0,
);

const drawer = ref(false);

type LinkWithName = Link & { name: string };

const links = computed<LinkWithName[]>(() => {
  if (props.loggedIn) {
    return [
      { ...appLinks.home, name: t(hub_layout.nav_app) },
      { ...accountLinks.home, name: t(hub_layout.nav_account) },
      ...(isSiteAdmin.value
        ? [{ ...adminLinks.home, name: t(hub_layout.nav_admin) }]
        : []),
      { ...authLinks.logout, name: t(hub_layout.nav_logout) },
    ];
  }
  return [
    { ...rootLinks.home, name: t(hub_layout.nav_home) },
    { ...authLinks.newRegistration, name: t(hub_layout.nav_sign_up) },
  ];
});

function getNavHref(link: LinkWithName) {
  if (link.subdomain !== "auth") {
    return linkToHrefWithHost(link);
  }
  let returnTo: string | undefined;
  if (link.path === "/new-login" || link.path === "/new-verification") {
    returnTo = linkToHref(appLinks.home, { domain: getHost() });
  } else if (link.path === "/logout") {
    returnTo = linkToHref(rootLinks.home, { domain: getHost() });
  }
  return linkToHrefWithHost(
    link,
    returnTo != null ? { params: { return_to: returnTo } } : undefined,
  );
}
</script>
