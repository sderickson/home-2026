<template>
  <v-container class="root-home">
    <header class="root-home__header mb-10">
      <h1 class="text-h3 font-weight-medium mb-2">{{ t(strings.title) }}</h1>
      <p class="text-h6 text-medium-emphasis mb-3">{{ t(strings.tagline) }}</p>
      <p class="text-body-1 text-medium-emphasis" style="max-width: 42rem">
        {{ t(strings.intro) }}
      </p>
    </header>

    <section class="root-home__section mb-10">
      <h2 class="text-h5 font-weight-medium mb-3">{{ t(strings.section_what) }}</h2>
      <p class="text-body-1 text-medium-emphasis" style="max-width: 42rem">
        {{ t(strings.invite_only_prefix) }}
        <a :href="demoHref" class="text-primary">{{ t(strings.cta_demo) }}</a>
        {{ t(strings.invite_only_suffix) }}
        <a
          :href="strings.source_url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary"
        >
          {{ t(strings.cta_source) }}
        </a>
      </p>
    </section>

    <section class="root-home__section mb-10">
      <h2 class="text-h5 font-weight-medium mb-4">{{ t(strings.section_features) }}</h2>
      <ul class="root-home__features pa-0 ma-0" style="list-style: none">
        <li class="root-home__feature mb-5">
          <h3 class="text-subtitle-1 font-weight-medium mb-1">
            {{ t(strings.feature_ingredients_heading) }}
          </h3>
          <p class="text-body-2 text-medium-emphasis ma-0">
            {{ t(strings.feature_ingredients) }}
          </p>
        </li>
        <li class="root-home__feature mb-5">
          <h3 class="text-subtitle-1 font-weight-medium mb-1">
            {{ t(strings.feature_versions_heading) }}
          </h3>
          <p class="text-body-2 text-medium-emphasis ma-0">
            {{ t(strings.feature_versions) }}
          </p>
        </li>
        <li class="root-home__feature mb-5">
          <h3 class="text-subtitle-1 font-weight-medium mb-1">
            {{ t(strings.feature_notes_heading) }}
          </h3>
          <p class="text-body-2 text-medium-emphasis ma-0">
            {{ t(strings.feature_notes) }}
          </p>
        </li>
        <li class="root-home__feature mb-5">
          <h3 class="text-subtitle-1 font-weight-medium mb-1">
            {{ t(strings.feature_images_heading) }}
          </h3>
          <p class="text-body-2 text-medium-emphasis ma-0">
            {{ t(strings.feature_images) }}
          </p>
        </li>
        <li class="root-home__feature mb-5">
          <h3 class="text-subtitle-1 font-weight-medium mb-1">
            {{ t(strings.feature_menus_heading) }}
          </h3>
          <p class="text-body-2 text-medium-emphasis ma-0">
            {{ t(strings.feature_menus) }}
          </p>
        </li>
        <li class="root-home__feature mb-5">
          <h3 class="text-subtitle-1 font-weight-medium mb-1">
            {{ t(strings.feature_sharing_heading) }}
          </h3>
          <p class="text-body-2 text-medium-emphasis ma-0">
            {{ t(strings.feature_sharing) }}
          </p>
        </li>
      </ul>
    </section>

    <section class="root-home__section">
      <h2 class="text-h5 font-weight-medium mb-3">{{ t(strings.section_try) }}</h2>
      <div class="d-flex flex-wrap gap-3">
        <v-btn v-bind="registerLinkProps" color="primary">
          {{ t(strings.cta_register) }}
        </v-btn>
        <v-btn
          :href="demoHref"
          variant="outlined"
          color="primary"
          target="_self"
        >
          {{ t(strings.cta_demo) }}
        </v-btn>
        <v-btn
          :href="strings.source_url"
          variant="text"
          color="primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t(strings.cta_source) }}
        </v-btn>
      </div>
    </section>
  </v-container>
</template>

<script setup lang="ts">
import { home_page as strings } from "./Home.strings.ts";
import { useHomeLoader } from "./Home.loader.ts";
import { useReverseT } from "@sderickson/recipes-root-spa/i18n";
import { linkToProps, linkToHref, getHost } from "@saflib/links";
import { authLinks } from "@saflib/auth-links";
import { appLinks } from "@sderickson/recipes-links";

const { t } = useReverseT();
useHomeLoader();

const registerLinkProps = linkToProps(authLinks.register, {
  params: { redirect: linkToHref(appLinks.home, { domain: getHost() }) },
});

const demoHref =
  typeof window !== "undefined"
    ? linkToHref(appLinks.home, { domain: getHost() })
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
