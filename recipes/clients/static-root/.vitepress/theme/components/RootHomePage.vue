<template>
  <div class="root-home py-8">
    <!-- Hero -->
    <v-row class="align-center mb-10" dense>
      <v-col cols="12" md="6" class="order-2 order-md-1">
        <h1 class="text-h3 text-md-h2 font-weight-medium my-8">
          Scott's Recipe List
        </h1>
        <p class="text-h6 text-medium-emphasis font-weight-regular mb-5">
          Organize, iterate, and share recipes.
        </p>
        <div class="d-flex flex-wrap ga-3 mb-4">
          <v-btn :href="demoHref" color="primary" size="large" rounded="lg">
            Try the demo
          </v-btn>
          <v-btn
            :href="registerHref"
            variant="outlined"
            color="primary"
            size="large"
            rounded="lg"
          >
            Sign up
          </v-btn>
        </div>
        <p class="text-body-2 text-medium-emphasis">
          Invite-only for friends and family.
          <a
            :href="sourceHref"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary text-decoration-none"
          >
            Browse the source on GitHub
          </a>
        </p>
      </v-col>
      <v-col cols="12" md="6" class="order-1 order-md-2">
        <v-sheet rounded="xl" class="overflow-hidden elevation-2">
          <v-img
            :src="seedKitchenSrc"
            alt="Recipe list overview (Seed Kitchen demo)"
            cover
            aspect-ratio="4/3"
          />
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Value prop strip -->
    <v-sheet
      rounded="xl"
      class="pa-6 pa-md-8 mb-10 bg-primary-lighten-5"
      border="opacity-25 sm"
    >
      <v-row dense>
        <v-col cols="12" md="4" class="text-center text-md-start mb-4 mb-md-0">
          <v-icon size="32" color="primary" class="mb-2"
            >mdi-tune-vertical</v-icon
          >
          <div class="text-subtitle-1 font-weight-medium mb-1">
            Built how I cook
          </div>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Structured for iterating and learning.
          </p>
        </v-col>
        <v-col cols="12" md="4" class="text-center mb-4 mb-md-0">
          <v-icon size="32" color="primary" class="mb-2"
            >mdi-timeline-clock</v-icon
          >
          <div class="text-subtitle-1 font-weight-medium mb-1">
            Keep a history
          </div>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Create a new version when you make major changes.
          </p>
        </v-col>
        <v-col cols="12" md="4" class="text-center text-md-end">
          <v-icon size="32" color="primary" class="mb-2"
            >mdi-share-variant-outline</v-icon
          >
          <div class="text-subtitle-1 font-weight-medium mb-1">
            Share the collection
          </div>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Let others view and edit your recipes and menus.
          </p>
        </v-col>
      </v-row>
    </v-sheet>

    <v-divider class="my-16" />
    <h2 class="text-h4 font-weight-medium mb-8">Key Features</h2>

    <!-- Feature grid -->
    <v-row dense class="mb-10">
      <v-col v-for="item in features" :key="item.title" cols="12" sm="6" lg="4">
        <v-card
          class="h-100"
          variant="outlined"
          rounded="lg"
          :prepend-icon="item.icon"
        >
          <v-card-item>
            <v-card-title class="text-wrap text-body-1 pb-2">
              {{ item.title }}
            </v-card-title>
            <v-card-subtitle class="text-wrap text-body-2 opacity-100">
              {{ item.body }}
            </v-card-subtitle>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Screenshots -->
    <h2 class="text-h5 font-weight-medium mb-5">A quick look</h2>
    <v-row dense class="mb-12">
      <v-col cols="12" md="6">
        <v-card variant="tonal" rounded="lg" class="overflow-hidden">
          <v-img
            :src="recipeSrc"
            alt="Recipe detail"
            cover
            aspect-ratio="16/10"
          />
          <v-divider class="my-4" />
          <v-card-text class="text-body-2"> Recipe page. </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card variant="tonal" rounded="lg" class="overflow-hidden">
          <v-img
            :src="menuSrc"
            alt="Menu planning"
            cover
            aspect-ratio="16/10"
          />
          <v-divider class="my-4" />
          <v-card-text class="text-body-2"> Menu page. </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Footer CTAs -->
    <v-sheet
      rounded="xl"
      class="pa-8 text-center"
      color="surface-variant"
      border="opacity-25 sm"
    >
      <h2 class="text-h5 font-weight-medium mb-2">
        Try it or peek under the hood
      </h2>
      <p
        class="text-body-2 text-medium-emphasis mb-6 mx-auto"
        style="max-width: 28rem"
      >
        Load the in-browser demo, create an account if you’re in, or read the
        code—it’s all there.
      </p>
      <div class="d-flex flex-wrap justify-center ga-3">
        <v-btn :href="registerHref" color="primary" size="large" rounded="lg">
          Sign up
        </v-btn>
        <v-btn
          :href="demoHref"
          variant="outlined"
          color="primary"
          size="large"
          rounded="lg"
        >
          Try the demo
        </v-btn>
        <v-btn
          :href="sourceHref"
          variant="text"
          color="primary"
          size="large"
          target="_blank"
          rel="noopener noreferrer"
        >
          View source on GitHub
        </v-btn>
      </div>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import { linkToHrefWithHost } from "@saflib/links";
import { useResolvedHref } from "@saflib/vue/useResolvedHref";
import { appLinks, authLinks } from "@sderickson/recipes-links";

import seedKitchenUrl from "./seed-kitchen.png";
import recipeUrl from "./recipe.png";
import menuUrl from "./menu.png";

const seedKitchenSrc = seedKitchenUrl;
const recipeSrc = recipeUrl;
const menuSrc = menuUrl;

const sourceHref = "https://github.com/sderickson/home-2026/tree/main/recipes";

const demoHref = useResolvedHref(appLinks.home);
const registerHref = useResolvedHref(() =>
  linkToHrefWithHost(authLinks.register, {
    params: { redirect: linkToHrefWithHost(appLinks.home) },
  }),
);

const features = [
  {
    icon: "mdi-format-list-bulleted",
    title: "Ingredients & instructions",
    body: "Structured ingredient lists, markdown recipe steps.",
  },
  {
    icon: "mdi-history",
    title: "Deliberate versioning",
    body: "Decide when your changes warrants being a new version.",
  },
  {
    icon: "mdi-note-text-outline",
    title: "Recipe notes",
    body: "Remind yourself what worked, what didn't, and what to try next.",
  },
  {
    icon: "mdi-camera-outline",
    title: "Images",
    body: "Use your own photos, or Unsplash shots for convenience. Both in recipes and in notes.",
  },
  {
    icon: "mdi-silverware-fork-knife",
    title: "Menus",
    body: "Group recipes into menus to decide what to cook this week—or what to put on the grocery list.",
  },
  {
    icon: "mdi-account-group-outline",
    title: "Sharing",
    body: "Share menus and recipes with friends and family: read-only, or let them make changes.",
  },
] as const;
</script>

<style scoped>
.root-home :deep(a.text-primary) {
  text-decoration: none;
}
.root-home :deep(a.text-primary:hover) {
  text-decoration: underline;
}
</style>
