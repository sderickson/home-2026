<template>
  <v-card variant="outlined" class="mb-3">
    <v-card-title class="text-subtitle-1">
      {{ t(strings.title) }}
    </v-card-title>
    <v-card-text>
      <v-textarea
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        :placeholder="t(strings.note_body_placeholder)"
        rows="3"
        variant="outlined"
        density="compact"
        hide-details
        class="mb-2"
      />
      <v-btn
        color="primary"
        :loading="createMutation.isPending.value"
        :disabled="!trimmedBody"
        @click="$emit('submit')"
      >
        {{ t(strings.create_note) }}
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { add_note_card as strings } from "./AddNoteCard.strings.ts";
import type { UseMutationReturnType } from "@tanstack/vue-query";

const props = defineProps<{
  modelValue: string;
  createMutation: Pick<UseMutationReturnType<unknown, Error, unknown, unknown>, "isPending">;
}>();

defineEmits<{
  "update:modelValue": [value: string];
  submit: [];
}>();

const { t } = useReverseT();

const trimmedBody = computed(() => props.modelValue.trim());
</script>
