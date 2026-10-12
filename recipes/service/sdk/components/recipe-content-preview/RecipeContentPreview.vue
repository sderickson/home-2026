<template>
  <article
    class="recipe-content-preview"
    :class="{ 'recipe-content-preview--compact': compact }"
  >
    <div class="rcp">
      <div v-if="$slots.tools" class="rcp__tools">
        <slot name="tools" />
      </div>

      <header class="rcp__head">
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
          <v-btn
            v-if="showImageActions"
            icon="mdi-close"
            width="28"
            height="28"
            color="error"
            class="rcp__image-delete"
            :aria-label="t(strings.remove_image)"
            :disabled="imageDeleteDisabled"
            @click="$emit('deleteImage', firstImage)"
          />
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
          <v-btn
            v-if="showImageActions"
            icon="mdi-close"
            width="28"
            height="28"
            color="error"
            class="rcp__image-delete"
            :aria-label="t(strings.remove_image)"
            :disabled="imageDeleteDisabled"
            @click="$emit('deleteImage', file)"
          />
        </div>
      </div>

      <div
        v-if="content.ingredients.length > 0 || hasInstructions"
        class="rcp__body ruled-32"
      >
        <section
          v-if="content.ingredients.length > 0"
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
        </section>
        <section
          v-if="hasInstructions"
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
        </section>
      </div>

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
import { recipe_content_preview_strings as strings } from "./RecipeContentPreview.strings.ts";
import { useReverseT } from "../../i18n.ts";

const { t } = useReverseT();
const uid = useId();

const props = withDefaults(
  defineProps<{
    recipe: Recipe;
    currentVersion?: RecipeVersion | null;
    files?: RecipeFileInfo[];
    showImageActions?: boolean;
    imageDeleteDisabled?: boolean;
    /** Lighter rendering for dialogs: smaller title, no framed photo. */
    compact?: boolean;
  }>(),
  {
    currentVersion: undefined,
    files: () => [],
    showImageActions: false,
    imageDeleteDisabled: false,
    compact: false,
  },
);

defineEmits<{
  clickImage: [file: RecipeFileInfo];
  deleteImage: [file: RecipeFileInfo];
}>();

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

/** First image is the framed print in the header (not in compact mode). */
const firstImage = computed(() => imageFiles.value[0]);
const extraImages = computed(() =>
  props.compact ? imageFiles.value : imageFiles.value.slice(1),
);

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
 * multiples of it, so it sits on the lines. Layout follows the container
 * width (it is also used inside dialogs). */
.recipe-content-preview {
  container-type: inline-size;
}

/* Inner wrapper: container queries can't restyle the container itself. */
.rcp {
  --pad: 56px;
  --gutter: 32px;
  --body-size: 16px;
  --step-size: 17px;
  position: relative;
}

.rcp__tools {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  display: flex;
  gap: 2px;
}

/* ---------- Header ---------- */
.rcp__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--gutter);
  padding: var(--pad) var(--pad) 18px;
  border-bottom: 2px solid rgb(var(--v-theme-card-red-line));
}

.rcp__titles {
  flex: 999 1 380px;
  min-width: 0;
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
  flex: 0 0 220px;
  margin-bottom: 4px;
}

.rcp__print {
  width: 220px;
  height: 160px;
  border-width: 6px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
  transform: rotate(-1.2deg);
  cursor: zoom-in;
}

.rcp__img {
  width: 100%;
  height: 100%;
}

.rcp__image-delete {
  position: absolute;
  top: -8px;
  right: -8px;
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
  width: 120px;
  height: 88px;
  border-width: 4px;
}

.rcp__prints .rcp__photo:nth-child(even) .rcp__print {
  transform: rotate(0.8deg);
}

/* ---------- Ruled body ---------- */
.rcp__body {
  display: flex;
  flex-wrap: wrap;
  padding: 14px 0 46px;
  background-position: 0 14px;
}

.rcp__ingredients {
  flex: 1 1 380px;
  padding: 0 var(--gutter) 0 var(--pad);
  border-right: 1.5px solid rgb(var(--v-theme-card-red-line-soft));
}

.rcp__method {
  flex: 999 1 440px;
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

/* ---------- Narrow (phones): one column, photo across the top ---------- */
@container (max-width: 599.98px) {
  .rcp {
    --pad: 18px;
    --gutter: 18px;
    --body-size: 18px;
    --step-size: 18px;
  }

  .rcp__head {
    padding-top: 18px;
    padding-bottom: 12px;
  }

  .rcp__title {
    font-size: 32px;
    line-height: 1.05;
  }

  .rcp__subtitle {
    margin-top: 6px;
    font-size: 17px;
  }

  /* First image spans the card above the title. */
  .rcp__head .rcp__photo {
    order: -1;
    flex: 0 0 calc(100% + 2 * var(--pad));
    margin: calc(-1 * var(--pad)) calc(-1 * var(--pad)) 0;
  }

  .rcp__head .rcp__print {
    width: 100%;
    height: 200px;
    border: 0;
    box-shadow: none;
    transform: none;
  }

  .rcp__head .rcp__image-delete {
    top: 8px;
    right: 8px;
  }

  .rcp__prints {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .rcp__body {
    flex-direction: column;
    padding-bottom: var(--rule);
  }

  .rcp__ingredients,
  .rcp__method {
    flex: none;
    padding: 0 var(--pad);
    border-right: 0;
  }

  .rcp__method {
    padding-top: var(--rule);
  }

  .rcp__instructions :deep(ol) {
    padding-inline-start: 38px;
  }

  .rcp__notes {
    padding-bottom: 0;
  }
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

@container (min-width: 600px) {
  .recipe-content-preview--compact .rcp__ingredients {
    flex-basis: 280px;
  }

  .recipe-content-preview--compact .rcp__method {
    flex-basis: 320px;
  }
}

.recipe-content-preview--compact .rcp__print--small {
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
