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

    <v-dialog v-model="open" max-width="1100" scrim="black">
      <v-card rounded="lg">
        <v-card-text class="pa-2 pa-sm-4">
          <img :src="src" :alt="resolvedAlt" class="captioned-image__full" />
        </v-card-text>
        <v-card-text
          v-if="caption"
          class="text-center text-medium-emphasis pt-0"
        >
          {{ caption }}
        </v-card-text>
        <v-card-actions class="justify-end px-4 pb-4">
          <v-btn variant="text" @click="open = false">Close</v-btn>
        </v-card-actions>
      </v-card>
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
  border-radius: 8px;
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
  border-radius: 8px;
  box-shadow: var(--vp-shadow-2);
}

.captioned-image__caption {
  margin-top: 0.85rem;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.captioned-image__full {
  display: block;
  width: 100%;
  height: auto;
  max-height: min(80vh, 900px);
  object-fit: contain;
  border-radius: 6px;
}
</style>
