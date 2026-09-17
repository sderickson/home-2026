<template>
  <figure class="captioned-image">
    <button
      type="button"
      class="captioned-image__trigger"
      :aria-label="expandLabel"
      @click="open = true"
    >
      <img :src="src" :alt="resolvedAlt" class="captioned-image__thumb" />
    </button>
    <figcaption v-if="caption" class="captioned-image__caption">
      {{ caption }}
    </figcaption>

    <v-dialog
      v-model="open"
      max-width="1100"
      scrim="black"
      content-class="captioned-image__dialog"
    >
      <div class="captioned-image__lightbox">
        <img :src="src" :alt="resolvedAlt" class="captioned-image__full" />
        <p v-if="caption" class="captioned-image__lightbox-caption">
          {{ caption }}
        </p>
      </div>
    </v-dialog>
  </figure>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  /** Image URL (prefer a Vite-imported asset so the file is bundled). */
  src: string;
  /** Accessible alt text. Defaults to `caption` when omitted. */
  alt?: string;
  /** Centered text shown under the thumbnail and in the dialog. */
  caption?: string;
}>();

const open = ref(false);

const resolvedAlt = computed(() => props.alt ?? props.caption ?? "");
const expandLabel = computed(() =>
  props.caption
    ? `Expand image: ${props.caption}`
    : "Expand image",
);
</script>

<style scoped>
.captioned-image {
  margin: 1.75rem auto;
  max-width: 100%;
  text-align: center;
}

.captioned-image__trigger {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: zoom-in;
  border-radius: 6px;
  overflow: hidden;
}

.captioned-image__trigger:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}

.captioned-image__thumb {
  display: block;
  width: 100%;
  height: auto;
}

.captioned-image__caption {
  margin-top: 0.85rem;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.captioned-image__lightbox {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  background: transparent;
}

.captioned-image__full {
  display: block;
  width: 100%;
  height: auto;
  max-height: min(82vh, 920px);
  object-fit: contain;
  border-radius: 4px;
}

.captioned-image__lightbox-caption {
  margin: 0;
  max-width: min(36rem, 92%);
  padding: 0.55rem 1rem;
  border-radius: 999px;
  background: #fff;
  color: #1a1a1a;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
}
</style>

<!-- Dialog content teleports outside the component; unscoped needed for content-class.
     pointer-events: none lets clicks pass through the large transparent content box to the
     scrim so click-off closes; the lightbox itself re-enables pointer events. -->
<style>
.captioned-image__dialog.v-overlay__content {
  background: transparent !important;
  box-shadow: none !important;
  overflow: visible !important;
  pointer-events: none !important;
}

.captioned-image__dialog .captioned-image__lightbox {
  pointer-events: auto;
}
</style>
