<template>
  <div class="markdown-editor" :class="{ 'is-focused': focused }">
    <label v-if="label" class="markdown-editor__label text-caption">
      {{ label }}
    </label>
    <div
      ref="rootRef"
      class="markdown-editor__root"
      @focusin="focused = true"
      @focusout="focused = false"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * WYSIWYG editor that reads and writes markdown (Milkdown "Crepe").
 * Heavy: only import it from pages that are already lazy-loaded routes.
 * Uses CrepeBuilder with a hand-picked feature set so KaTeX/CodeMirror stay out of the bundle.
 */
import { onBeforeUnmount, onMounted, ref } from "vue";
import { CrepeBuilder } from "@milkdown/crepe/builder";
import { blockEdit } from "@milkdown/crepe/feature/block-edit";
import { cursor } from "@milkdown/crepe/feature/cursor";
import { linkTooltip } from "@milkdown/crepe/feature/link-tooltip";
import { listItem } from "@milkdown/crepe/feature/list-item";
import { placeholder } from "@milkdown/crepe/feature/placeholder";
import { toolbar } from "@milkdown/crepe/feature/toolbar";
import "@milkdown/crepe/theme/common/prosemirror.css";
import "@milkdown/crepe/theme/common/reset.css";
import "@milkdown/crepe/theme/common/block-edit.css";
import "@milkdown/crepe/theme/common/cursor.css";
import "@milkdown/crepe/theme/common/link-tooltip.css";
import "@milkdown/crepe/theme/common/list-item.css";
import "@milkdown/crepe/theme/common/placeholder.css";
import "@milkdown/crepe/theme/common/toolbar.css";

const props = defineProps<{
  modelValue: string;
  label?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const rootRef = ref<HTMLElement | null>(null);
const focused = ref(false);
let builder: CrepeBuilder | null = null;

onMounted(async () => {
  if (!rootRef.value) return;
  builder = new CrepeBuilder({
    root: rootRef.value,
    defaultValue: props.modelValue ?? "",
  })
    .addFeature(toolbar)
    .addFeature(blockEdit, {
      listGroup: { taskList: null },
      advancedGroup: null,
      // The form card clips overflow; fixed positioning lets the menu escape it.
      slashMenu: { floatingUIOptions: { strategy: "fixed" } },
    })
    .addFeature(listItem)
    .addFeature(linkTooltip)
    .addFeature(cursor)
    .addFeature(placeholder, { text: props.placeholder ?? "", mode: "doc" });
  // Only emit on real edits: loading normalizes the markdown, and we don't want
  // an untouched recipe's instructions rewritten just by opening the editor.
  builder.on((api) => {
    api.markdownUpdated((_ctx, markdown, prevMarkdown) => {
      if (markdown !== prevMarkdown) emit("update:modelValue", markdown);
    });
  });
  await builder.create();
});

onBeforeUnmount(() => {
  builder?.destroy();
  builder = null;
});
</script>

<style scoped>
.markdown-editor {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  transition: border-color 0.15s ease;
}

.markdown-editor:hover {
  border-color: rgba(var(--v-theme-on-surface), 0.6);
}

.markdown-editor.is-focused {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: inset 0 0 0 1px rgb(var(--v-theme-primary));
}

.markdown-editor__label {
  position: absolute;
  top: -0.6rem;
  left: 0.6rem;
  padding: 0 4px;
  background: rgb(var(--v-theme-surface));
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  z-index: 1;
}

.markdown-editor.is-focused .markdown-editor__label {
  color: rgb(var(--v-theme-primary));
}

.markdown-editor__root {
  flex: 1 1 auto;
  min-height: 12rem;
}

/* Crepe theme tokens mapped onto the app's Vuetify palette and fonts. */
.markdown-editor__root :deep(.milkdown) {
  --crepe-color-background: rgb(var(--v-theme-surface));
  --crepe-color-on-background: rgb(var(--v-theme-on-surface));
  --crepe-color-surface: rgb(var(--v-theme-surface));
  --crepe-color-surface-low: rgb(var(--v-theme-surface-tab));
  --crepe-color-on-surface: rgb(var(--v-theme-on-surface));
  --crepe-color-on-surface-variant: rgb(var(--v-theme-ink-2));
  --crepe-color-outline: rgba(var(--v-theme-on-surface), 0.5);
  --crepe-color-primary: rgb(var(--v-theme-primary));
  --crepe-color-secondary: rgb(var(--v-theme-primary-tint));
  --crepe-color-on-secondary: rgb(var(--v-theme-on-surface));
  --crepe-color-inverse: rgb(var(--v-theme-on-surface));
  --crepe-color-on-inverse: rgb(var(--v-theme-surface));
  --crepe-color-inline-code: rgb(var(--v-theme-error));
  --crepe-color-error: rgb(var(--v-theme-error));
  --crepe-color-hover: rgb(var(--v-theme-primary-tint));
  --crepe-color-selected: rgb(var(--v-theme-primary-tint));
  --crepe-color-inline-area: rgb(var(--v-theme-surface-tab));
  --crepe-base-font-size: 16px;
  --crepe-font-title: var(--font-title);
  --crepe-font-default: inherit;
  --crepe-font-code: var(--font-mono);
  --crepe-shadow-1:
    0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
  --crepe-shadow-2:
    0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
  height: 100%;
}

/* Pairs with the slash menu's floating-ui "fixed" strategy (see blockEdit config). */
.markdown-editor__root :deep(.milkdown .milkdown-slash-menu) {
  position: fixed;
}

/* Crepe's default page-style padding is too roomy for a form field;
   keep room on the left for the block drag/add handle. */
.markdown-editor__root :deep(.milkdown .ProseMirror) {
  padding: 16px 16px 16px 56px;
  min-height: 12rem;
}
</style>
