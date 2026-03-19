<template>
  <v-container class="root-home">
    <header class="root-home__header mb-10">
      <h1 class="text-h3 font-weight-medium mb-2">Scott's Recipe List</h1>
      <p class="text-h6 text-medium-emphasis mb-3">
        A place to organize, iterate on, and share recipes.
      </p>
      <p class="text-body-1 text-medium-emphasis" style="max-width: 42rem">
        Built to suit the way I organize and iterate on my recipes. It's available for
        friends and family by invite. If you're not signed in, you can try the demo or
        browse the source.
      </p>
    </header>

    <section class="root-home__section mb-10">
      <h2 class="text-h5 font-weight-medium mb-3">What it is</h2>
      <p class="text-body-1 text-medium-emphasis" style="max-width: 42rem">
        Access is invite-only for friends and family. Others can
        <a :href="demoHref" class="text-primary">try the demo</a>
        or
        <a :href="sourceHref" target="_blank" rel="noopener noreferrer" class="text-primary">
          view source on GitHub
        </a>
      </p>
    </section>

    <section class="root-home__section mb-10">
      <h2 class="text-h5 font-weight-medium mb-4">Features</h2>
      <ul class="root-home__features pa-0 ma-0" style="list-style: none">
        <li class="root-home__feature mb-5">
          <h3 class="text-subtitle-1 font-weight-medium mb-1">Ingredients & instructions</h3>
          <p class="text-body-2 text-medium-emphasis ma-0">
            Structured ingredient lists and markdown recipe instructions.
          </p>
        </li>
        <li class="root-home__feature mb-5">
          <h3 class="text-subtitle-1 font-weight-medium mb-1">Version history</h3>
          <p class="text-body-2 text-medium-emphasis ma-0">
            See how a recipe evolved over time. Every edit is kept so you can compare or
            revert.
          </p>
        </li>
        <li class="root-home__feature mb-5">
          <h3 class="text-subtitle-1 font-weight-medium mb-1">Recipe notes</h3>
          <p class="text-body-2 text-medium-emphasis ma-0">
            Add notes to a recipe - what you'd do differently, substitutions that worked -
            so you can look back next time.
          </p>
        </li>
        <li class="root-home__feature mb-5">
          <h3 class="text-subtitle-1 font-weight-medium mb-1">Images</h3>
          <p class="text-body-2 text-medium-emphasis ma-0">
            Upload your own photos, or drop in Unsplash images as quick filler until you
            take your own.
          </p>
        </li>
        <li class="root-home__feature mb-5">
          <h3 class="text-subtitle-1 font-weight-medium mb-1">Menus</h3>
          <p class="text-body-2 text-medium-emphasis ma-0">
            Group recipes into menus to decide what to cook or what to shop for.
          </p>
        </li>
        <li class="root-home__feature mb-5">
          <h3 class="text-subtitle-1 font-weight-medium mb-1">Sharing</h3>
          <p class="text-body-2 text-medium-emphasis ma-0">
            Share recipes and collections with friends and family - view-only or with edit
            access.
          </p>
        </li>
      </ul>
    </section>

    <section class="root-home__section">
      <h2 class="text-h5 font-weight-medium mb-3">Try it</h2>
      <div class="d-flex flex-wrap ga-3">
        <v-btn :href="registerHref" color="primary">Sign up</v-btn>
        <v-btn :href="demoHref" variant="outlined" color="primary">Try the demo</v-btn>
        <v-btn :href="sourceHref" variant="text" color="primary" target="_blank" rel="noopener noreferrer">
          View source on GitHub
        </v-btn>
      </div>
    </section>
  </v-container>
</template>

<script setup lang="ts">
import { authLinks } from "@saflib/auth-links";
import { appLinks } from "@sderickson/recipes-links";
import { getHost, linkToHref } from "@saflib/links";

const sourceHref = "https://github.com/sderickson/home-2026/tree/main/recipes";
const demoHref =
  typeof window !== "undefined" ? linkToHref(appLinks.home, { domain: getHost() }) : "#";
const registerHref =
  typeof window !== "undefined"
    ? linkToHref(authLinks.register, {
        domain: getHost(),
        params: { redirect: linkToHref(appLinks.home, { domain: getHost() }) },
      })
    : "#";
</script>

<style scoped>
.root-home__features {
  max-width: 42rem;
}

.root-home a {
  text-decoration: none;
}

.root-home a:hover {
  text-decoration: underline;
}
</style>
