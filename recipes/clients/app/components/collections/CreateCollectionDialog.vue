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
        <v-alert
          v-if="submitError"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="submitError = null"
        >
          {{ submitError }}
        </v-alert>
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
import { TanstackError, getTanstackErrorMessage } from "@saflib/sdk";
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
const submitError = ref<string | null>(null);
const createMutation = useCreateCollectionsMutation();

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      name.value = "";
      optionalId.value = "";
      submitError.value = null;
    }
  },
);

async function handleCreate() {
  if (!name.value.trim() || saving.value) return;
  submitError.value = null;
  saving.value = true;
  try {
    await createMutation.mutateAsync({
      name: name.value.trim(),
      ...(optionalId.value.trim() && { id: optionalId.value.trim() }),
    });
    emit("update:modelValue", false);
    emit("success");
  } catch (e) {
    if (e instanceof TanstackError && e.status === 403) {
      submitError.value = t(strings.forbidden_create_collection);
    } else if (e instanceof TanstackError) {
      submitError.value = getTanstackErrorMessage(e);
    } else {
      submitError.value = t(strings.unexpected_error);
    }
  } finally {
    saving.value = false;
  }
}
</script>
