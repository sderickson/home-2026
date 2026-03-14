<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        {{ t(strings.title) }}
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="name"
          :label="t(strings.name_label)"
          :placeholder="t(strings.name_placeholder)"
          variant="outlined"
          class="mb-3"
        />
        <v-text-field
          v-model="optionalId"
          :label="t(strings.id_label)"
          :placeholder="t(strings.id_placeholder)"
          variant="outlined"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          {{ t(strings.cancel) }}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!name.trim()"
          :loading="saving"
          @click="handleCreate"
        >
          {{ t(strings.submit) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useCreateCollectionsMutation } from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { create_collection_dialog as strings } from "./CreateCollectionDialog.strings.ts";

const { t } = useReverseT();

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const name = ref("");
const optionalId = ref("");
const saving = ref(false);
const createMutation = useCreateCollectionsMutation();

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      name.value = "";
      optionalId.value = "";
    }
  },
);

async function handleCreate() {
  if (!name.value.trim() || saving.value) return;
  saving.value = true;
  try {
    await createMutation.mutateAsync({
      name: name.value.trim(),
      ...(optionalId.value.trim() && { id: optionalId.value.trim() }),
    });
    emit("update:modelValue", false);
    emit("success");
  } finally {
    saving.value = false;
  }
}
</script>
