<template>
  <v-app>
    <v-app-bar height="90" class="px-4">
      <!-- Logo -->
      <v-app-bar-title>
        <a :href="linkToHrefWithHost(rootLinks.home)" class="logo-link">
          {{ recipes_layout.nav_title }}
        </a>
      </v-app-bar-title>

      <!-- Desktop Navigation Links (hidden on mobile) -->
      <v-toolbar-items class="d-none d-md-block">
        <v-btn
          v-for="link in links"
          :key="link.name"
          variant="text"
          class="text-uppercase font-weight-regular"
          :href="toHref(link, link.options)"
        >
          {{ link.name }}
        </v-btn>
      </v-toolbar-items>

      <template #append>
        <slot name="app-bar-append" />
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
        :href="toHref(link, link.options)"
      />
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { recipes_layout } from "./RecipesLayout.strings.ts";
import { authLinks } from "@saflib/auth-links";
import {
  type Link,
  linkToHrefWithHost,
  type LinkOptions,
} from "@saflib/links";
import {
  accountLinks,
  adminLinks,
  appLinks,
  rootLinks,
} from "@sderickson/recipes-links";

const props = defineProps<{
  loggedIn?: boolean;
  isAdmin?: boolean;
}>();

const drawer = ref(false);

type LinkWithName = Link & { name: string; options?: LinkOptions };
const toHref = (link: Link, options?: LinkOptions) =>
  linkToHrefWithHost(link, options);

const links = computed<LinkWithName[]>(() => {
  if (props.loggedIn) {
    return [
      { ...appLinks.home, name: "App" },
      { ...accountLinks.home, name: "Account" },
      ...(props.isAdmin ? [{ ...adminLinks.admin, name: "Admin" }] : []),
      {
        ...authLinks.logout,
        name: "Logout",
        options: { params: { redirect: linkToHrefWithHost(rootLinks.home) } },
      },
    ];
  }
  return [
    { ...rootLinks.home, name: "Home" },
    {
      ...authLinks.login,
      name: "Login",
      options: { params: { redirect: linkToHrefWithHost(appLinks.home) } },
    },
  ];
});
</script>
