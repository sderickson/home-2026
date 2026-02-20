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
          :key="link.path"
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

    <v-main>
      <TopLevelContainer v-if="!disableContainer">
        <slot />
      </TopLevelContainer>
      <slot v-else />
    </v-main>

    <SnackbarQueue />
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { TopLevelContainer } from "@saflib/vue/components";
import { hub_layout } from "./HubLayout.strings.ts";
import { useReverseT } from "../../i18n.ts";
import { linkToHref, linkToHrefWithHost, getHost, type Link } from "@saflib/links";
import { events } from "@saflib/vue";
import { SnackbarQueue } from "@saflib/vue/components";
import { SpaLink } from "@saflib/vue/components";

import {
  rootLinks,
  appLinks,
  accountLinks,
  authLinks,
  adminLinks,
} from "@sderickson/hub-links";

const props = defineProps<{
  loggedIn?: boolean;
  isAdmin?: boolean;
}>();

const { t } = useReverseT();

const route = useRoute();
const disableContainer = computed(() => {
  return route.meta?.disableContainer ?? false;
});

const drawer = ref(false);

type LinkWithName = Link & { name: string };

const links = computed<LinkWithName[]>(() => {
  if (props.loggedIn) {
    return [
      { ...appLinks.home, name: t(hub_layout.nav_app) },
      { ...accountLinks.home, name: t(hub_layout.nav_account) },
      { ...authLinks.logout, name: t(hub_layout.nav_logout) },
      ...(props.isAdmin ? [{ ...adminLinks.admin, name: t(hub_layout.nav_admin) }] : []),
    ];
  }
  return [
    { ...rootLinks.home, name: t(hub_layout.nav_home) },
    { ...authLinks.register, name: t(hub_layout.nav_sign_up) },
  ];
});

function getNavHref(link: LinkWithName) {
  if (link.subdomain !== "auth") {
    return linkToHrefWithHost(link);
  }
  let redirect: string | undefined;
  if (link.path === "/login" || link.path === "/register") {
    redirect = linkToHref(appLinks.home, { domain: getHost() });
  } else if (link.path === "/logout") {
    redirect = linkToHref(rootLinks.home, { domain: getHost() });
  }
  return linkToHrefWithHost(link, redirect != null ? { params: { redirect } } : undefined);
}
</script>
