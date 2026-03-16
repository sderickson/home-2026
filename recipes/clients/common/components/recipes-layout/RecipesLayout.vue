<template>
  <v-app>
    <!-- Events are rendered here for playwright tests to assert on -->
    <pre class="d-none" data-testid="events">{{ events }}</pre>

    <v-app-bar height="90" class="px-4">
      <!-- Logo -->
      <v-app-bar-title>
        <SpaLink :link="rootLinks.home" class="logo-link">
          {{ t(recipes_layout.nav_title) }}
        </SpaLink>
      </v-app-bar-title>

      <!-- Desktop Navigation Links (hidden on mobile) -->
      <v-toolbar-items class="d-none d-md-block">
        <v-btn
          v-for="link in links"
          :key="link.name"
          variant="text"
          class="text-uppercase font-weight-regular"
          v-bind="linkToProps(link, link.options)"
        >
          {{ link.name }}
        </v-btn>
      </v-toolbar-items>

      <!-- Demo mode indicator + dialog trigger -->
      <template #append>
        <v-btn
          v-if="demo.isDemoMode.value"
          color="warning"
          variant="flat"
          prepend-icon="mdi-exclamation"
          class="text-uppercase font-weight-regular mr-2"
          @click="demoDialogOpen = true"
        >
          {{ t(recipes_layout.demo_mode) }}
        </v-btn>
        <v-app-bar-nav-icon class="d-md-none mr-4" @click="drawer = !drawer">
          <v-icon v-if="!drawer">mdi-menu</v-icon>
          <v-icon v-else>mdi-close</v-icon>
        </v-app-bar-nav-icon>
      </template>
    </v-app-bar>

    <v-dialog v-model="demoDialogOpen" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center">
          <span>{{ t(recipes_layout.demo_dialog_title) }}</span>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="demoDialogOpen = false"
          />
        </v-card-title>
        <v-card-text>
          {{ t(recipes_layout.demo_banner_message) }}
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="demoDialogOpen = false">
            {{ t(recipes_layout.demo_cancel) }}
          </v-btn>
          <v-spacer />
          <v-btn
            variant="text"
            @click="
              onResetDemo();
              demoDialogOpen = false;
            "
          >
            {{ t(recipes_layout.demo_reset) }}
          </v-btn>
          <v-btn color="primary" variant="flat" @click="demo.exitDemoMode()">
            {{ t(recipes_layout.demo_exit) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
        v-bind="linkToProps(link, link.options)"
      />
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <slot />
      </v-container>
    </v-main>

    <SnackbarQueue />
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { recipes_layout } from "./RecipesLayout.strings.ts";
import { useReverseT } from "../../i18n.ts";
import { authLinks } from "@saflib/auth-links";
import {
  type Link,
  linkToProps,
  linkToHrefWithHost,
  type LinkOptions,
} from "@saflib/links";
import { events } from "@saflib/vue";
import { SnackbarQueue } from "@saflib/vue/components";
import { SpaLink } from "@saflib/vue/components";
import {
  accountLinks,
  adminLinks,
  appLinks,
  rootLinks,
} from "@sderickson/recipes-links";
import { useQueryClient } from "@tanstack/vue-query";
import { useDemoMode } from "../../composables/useDemoMode.ts";
import { useSeedData } from "../../seed/useSeedData.ts";

const props = defineProps<{
  loggedIn?: boolean;
  isAdmin?: boolean;
}>();

const { t } = useReverseT();
const demo = useDemoMode();
const queryClient = useQueryClient();
const { runSeed } = useSeedData({
  getSuccessMessage: () => t(recipes_layout.demo_reset_done),
});

async function onResetDemo() {
  const { clearMocks } = await import("@sderickson/recipes-sdk/fakes");
  clearMocks();
  queryClient.invalidateQueries();
  await runSeed();
  queryClient.invalidateQueries();
}

const drawer = ref(false);
const demoDialogOpen = ref(false);

type LinkWithName = Link & { name: string; options?: LinkOptions };

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
