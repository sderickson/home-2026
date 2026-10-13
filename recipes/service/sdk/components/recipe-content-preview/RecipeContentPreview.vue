<template>
  <article
    class="recipe-content-preview"
    :class="{
      'recipe-content-preview--compact': compact,
      'recipe-content-preview--narrow': narrow,
    }"
  >
    <div class="rcp">
      <header class="rcp__head">
        <div v-if="firstImage && !compact" class="rcp__photo">
          <button
            type="button"
            class="rcp__print photo-print"
            @click="$emit('clickImage', firstImage)"
          >
            <v-img
              :src="firstImage.downloadUrl"
              :alt="firstImage.fileOriginalName"
              cover
              class="rcp__img"
            />
          </button>
        </div>
        <div class="rcp__titles">
          <component
            :is="compact ? 'h2' : 'h1'"
            v-if="recipe.title"
            class="rcp__title font-title"
          >
            {{ recipe.title }}
          </component>
          <p v-if="recipe.subtitle" class="rcp__subtitle text-ink-2">
            {{ recipe.subtitle }}
          </p>
        </div>
        <div v-if="$slots.tools" class="rcp__tools">
          <slot name="tools" />
        </div>
      </header>

      <div v-if="extraImages.length > 0" class="rcp__prints">
        <div v-for="file in extraImages" :key="file.id" class="rcp__photo">
          <button
            type="button"
            class="rcp__print rcp__print--small photo-print"
            @click="$emit('clickImage', file)"
          >
            <v-img
              :src="file.downloadUrl"
              :alt="file.fileOriginalName"
              cover
              class="rcp__img"
            />
          </button>
        </div>
      </div>

      <v-row
        v-if="hasIngredients || hasInstructions"
        no-gutters
        class="rcp__body ruled-32"
      >
        <v-col
          v-if="hasIngredients"
          tag="section"
          :cols="narrow || !hasInstructions ? 12 : 5"
          class="rcp__ingredients"
          :aria-labelledby="`${uid}-ingredients`"
        >
          <component
            :is="sectionHeading"
            :id="`${uid}-ingredients`"
            class="section-label"
          >
            {{ t(strings.ingredients) }}
          </component>
          <ul class="rcp__ingredient-list">
            <li v-for="(ing, i) in ingredientRows" :key="i">
              <span class="rcp__qty font-mono">{{ ing.amount }}</span>
              <span>{{ ing.name }}</span>
            </li>
          </ul>
        </v-col>
        <v-col
          v-if="hasInstructions"
          tag="section"
          :cols="narrow || !hasIngredients ? 12 : 7"
          class="rcp__method"
          :aria-labelledby="`${uid}-method`"
        >
          <component
            :is="sectionHeading"
            :id="`${uid}-method`"
            class="section-label"
          >
            {{ t(strings.method) }}
          </component>
          <div class="rcp__instructions" v-html="renderedInstructions" />
        </v-col>
      </v-row>

      <section
        v-if="recipe.description"
        class="rcp__notes ruled-32"
        :aria-labelledby="`${uid}-notes`"
      >
        <component
          :is="sectionHeading"
          :id="`${uid}-notes`"
          class="section-label"
        >
          {{ t(strings.notes) }}
        </component>
        <p class="text-ink-2">{{ recipe.description }}</p>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import type {
  Recipe,
  RecipeFileInfo,
  RecipeVersion,
} from "@sderickson/recipes-spec";
import { computed, useId } from "vue";
import { marked } from "marked";
import { useDisplay } from "vuetify";
import { recipe_content_preview_strings as strings } from "./RecipeContentPreview.strings.ts";
import { useReverseT } from "../../i18n.ts";

const { t } = useReverseT();
const uid = useId();

const props = withDefaults(
  defineProps<{
    recipe: Recipe;
    currentVersion?: RecipeVersion | null;
    files?: RecipeFileInfo[];
    /** Lighter rendering for dialogs: smaller title, no framed photo, always
     * one column. */
    compact?: boolean;
  }>(),
  {
    currentVersion: undefined,
    files: () => [],
    compact: false,
  },
);

defineEmits<{
  clickImage: [file: RecipeFileInfo];
}>();

/** One column below Vuetify's md breakpoint (the app bar switches there too). */
const { mdAndUp } = useDisplay();
const narrow = computed(() => props.compact || !mdAndUp.value);

const sectionHeading = computed(() => (props.compact ? "h3" : "h2"));

const content = computed(
  () =>
    props.currentVersion?.content ?? {
      ingredients: [],
      instructionsMarkdown: "",
    },
);

const imageFiles = computed(() =>
  (props.files ?? []).filter((f) => (f.mimetype ?? "").startsWith("image/")),
);

/** Full mode shows only the first image, as a print beside the title (the
 * host's image viewer can page through the rest). Compact mode shows them all
 * as small prints instead. */
const firstImage = computed(() => imageFiles.value[0]);
const extraImages = computed(() => (props.compact ? imageFiles.value : []));

const hasIngredients = computed(() => content.value.ingredients.length > 0);

const hasInstructions = computed(() => {
  const md = content.value.instructionsMarkdown?.trim() ?? "";
  return md.length > 0;
});

/** Quantity + unit (mono column) and name for each ingredient. */
const ingredientRows = computed(() =>
  content.value.ingredients.map((ing) => ({
    amount: [ing.quantity, ing.unit].filter(Boolean).join(" ").trim(),
    name: ing.name,
  })),
);

const renderedInstructions = computed(() =>
  content.value.instructionsMarkdown
    ? (marked(content.value.instructionsMarkdown, { async: false }) as string)
    : "",
);
</script>

<style scoped>
/* One index card's contents: header → ingredients | method → notes.
 * Text in ruled areas uses line-height var(--rule) and vertical spacing in
 * multiples of it, so it sits on the lines. Below md (and in compact mode) it
 * is one column: the --narrow rules near the end. */
.rcp {
  --pad: 56px;
  --gutter: 32px;
  --body-size: 16px;
  --step-size: 17px;
  position: relative;
}

/* ---------- Header ---------- */
/* [photo] [title + subtitle] [tools]. The title block alone sets the header's
 * height: the photo fills that height and the tools sit in the top corner. */
.rcp__head {
  display: flex;
  align-items: stretch;
  gap: 24px;
  padding: 28px 16px 18px var(--pad);
  border-bottom: 2px solid rgb(var(--v-theme-card-red-line));
}

.rcp__titles {
  flex: 1 1 auto;
  align-self: center;
  min-width: 0;
}

.rcp__tools {
  flex: none;
  align-self: flex-start;
  margin-top: -12px;
}

/* No tools: keep the right padding symmetric. */
.rcp__head:not(:has(.rcp__tools)) {
  padding-right: var(--pad);
}

.rcp__title {
  margin: 0;
  font-weight: 600;
  font-size: 52px;
  line-height: 1.02;
  overflow-wrap: break-word;
}

.rcp__subtitle {
  margin: 10px 0 0;
  font-size: 20px;
}

.rcp__photo {
  position: relative;
  flex: 0 0 auto;
}

/* The print is out of flow so it never makes the header taller: it fills the
 * title block's height (capped, and centred against a long title). */
.rcp__head .rcp__photo {
  flex-basis: 136px;
}

.rcp__head .rcp__print {
  position: absolute;
  inset: 0;
  max-height: 136px;
  margin: auto 0;
  border-width: 4px;
}

.rcp__print {
  border-width: 6px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
  transform: rotate(-1.2deg);
  cursor: zoom-in;
}

.rcp__img {
  width: 100%;
  height: 100%;
}

.rcp__prints {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px var(--pad) 4px;
}

.rcp__prints .rcp__photo {
  flex: 0 0 auto;
  margin: 0;
}

.rcp__print--small {
  position: static;
  width: 120px;
  height: 88px;
  border-width: 4px;
}

.rcp__prints .rcp__photo:nth-child(even) .rcp__print {
  transform: rotate(0.8deg);
}

/* ---------- Ruled body ---------- */
/* Columns come from v-row / v-col (no gutters, so text stays on the rules). */
.rcp__body {
  padding: 14px 0 46px;
  background-position: 0 14px;
}

.rcp__ingredients {
  padding: 0 var(--gutter) 0 var(--pad);
}

.rcp__ingredients:not(:last-child) {
  border-right: 1.5px solid rgb(var(--v-theme-card-red-line-soft));
}

.rcp__method {
  min-width: 0;
  padding: 0 var(--pad) 0 var(--gutter);
}

/* Quantity column sizes to the longest quantity (at least 72px). */
.rcp__ingredient-list {
  display: grid;
  grid-template-columns: minmax(72px, max-content) 1fr;
  column-gap: 10px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.rcp__ingredient-list li {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  font-size: var(--body-size);
  line-height: var(--rule);
}

.rcp__qty {
  font-size: calc(var(--body-size) - 1px);
  color: rgb(var(--v-theme-primary));
}

/* Rendered markdown: everything on the 32px rhythm, one blank line between blocks. */
.rcp__instructions {
  font-size: var(--step-size);
  line-height: var(--rule);
}

.rcp__instructions
  :deep(:is(p, ol, ul, blockquote, pre, h1, h2, h3, h4, h5, h6)) {
  margin: 0 0 var(--rule);
  font-size: inherit;
  line-height: var(--rule);
}

.rcp__instructions :deep(:is(h1, h2, h3, h4, h5, h6)) {
  margin-bottom: 0;
  font-weight: 600;
}

.rcp__instructions > :deep(:last-child) {
  margin-bottom: 0;
}

.rcp__instructions :deep(li) {
  margin-bottom: var(--rule);
}

.rcp__instructions :deep(li:last-child) {
  margin-bottom: 0;
}

.rcp__instructions :deep(ul) {
  padding-inline-start: 1.25em;
}

/* Ordered lists keep native list semantics; the marker is styled as a mono
 * zero-padded step number ("01") in its own column. */
.rcp__instructions :deep(ol) {
  padding-inline-start: 48px;
  list-style: decimal-leading-zero;
  list-style: rcp-step;
}

.rcp__instructions :deep(ol li::marker) {
  font-family: var(--font-mono);
  font-size: 14px;
  color: rgb(var(--v-theme-primary));
}

.rcp__instructions :deep(ol ol) {
  margin: 0;
  list-style: lower-alpha;
}

.rcp__instructions :deep(ol ol li) {
  margin-bottom: 0;
}

/* ---------- Notes ---------- */
.rcp__notes {
  padding: 0 var(--pad) 28px;
}

.rcp__notes p {
  margin: 0;
  font-size: var(--body-size);
  line-height: var(--rule);
  white-space: pre-line;
}

/* ---------- Narrow (below md, and compact): one column ---------- */
.recipe-content-preview--narrow .rcp {
  --pad: 18px;
  --gutter: 18px;
  --body-size: 18px;
  --step-size: 18px;
}

.recipe-content-preview--narrow .rcp__head {
  gap: 14px;
  padding-top: 16px;
  padding-bottom: 12px;
}

.recipe-content-preview--narrow .rcp__tools {
  margin-top: -8px;
}

.recipe-content-preview--narrow .rcp__title {
  font-size: 32px;
  line-height: 1.05;
}

.recipe-content-preview--narrow .rcp__subtitle {
  margin-top: 6px;
  font-size: 17px;
}

.recipe-content-preview--narrow .rcp__head .rcp__photo {
  flex-basis: 84px;
}

.recipe-content-preview--narrow .rcp__head .rcp__print {
  max-height: 96px;
  border-width: 3px;
}

.recipe-content-preview--narrow .rcp__prints {
  flex-wrap: nowrap;
  overflow-x: auto;
}

.recipe-content-preview--narrow .rcp__body {
  padding-bottom: var(--rule);
}

.recipe-content-preview--narrow .rcp__ingredients,
.recipe-content-preview--narrow .rcp__method {
  padding: 0 var(--pad);
  border-right: 0;
}

.recipe-content-preview--narrow .rcp__ingredients + .rcp__method {
  padding-top: var(--rule);
}

.recipe-content-preview--narrow .rcp__instructions :deep(ol) {
  padding-inline-start: 38px;
}

.recipe-content-preview--narrow .rcp__notes {
  padding-bottom: 0;
}

/* ---------- Compact (dialogs) ---------- */
.recipe-content-preview--compact .rcp {
  --pad: 24px;
  --gutter: 24px;
  --body-size: 15px;
  --step-size: 15px;
}

.recipe-content-preview--compact .rcp__head {
  padding-top: 20px;
  padding-bottom: 12px;
}

.recipe-content-preview--compact .rcp__title {
  font-size: 28px;
  line-height: 1.1;
}

.recipe-content-preview--compact .rcp__subtitle {
  margin-top: 4px;
  font-size: 16px;
}

.recipe-content-preview--compact .rcp__print--small {
  position: static;
  transform: none;
}
</style>

<style>
/* Mono step numbers without the trailing "." (falls back to decimal-leading-zero). */
@counter-style rcp-step {
  system: extends decimal-leading-zero;
  suffix: "  ";
}
</style>
