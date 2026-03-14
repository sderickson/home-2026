<template>
  <v-form ref="formRef" @submit.prevent="onSubmit">
    <v-text-field
      v-model="form.name"
      :label="t(strings.name_label)"
      variant="outlined"
      class="mb-4"
    />
    <v-switch
      v-model="form.isPublic"
      :label="t(strings.is_public_label)"
      class="mb-4"
    />
    <div class="text-subtitle-1 mb-2">{{ t(strings.groupings_label) }}</div>
    <div
      v-for="(grouping, index) in form.groupings"
      :key="index"
      class="d-flex flex-wrap align-center gap-2 mb-4"
    >
      <v-text-field
        v-model="grouping.name"
        :placeholder="t(strings.grouping_name_placeholder)"
        variant="outlined"
        density="comfortable"
        class="flex-grow-1"
        style="max-width: 240px"
      />
      <v-select
        v-model="grouping.recipeIds"
        :items="recipes"
        item-title="title"
        item-value="id"
        :label="t(strings.select_recipes)"
        multiple
        variant="outlined"
        density="comfortable"
        class="flex-grow-1"
        style="min-width: 200px"
      />
      <v-btn
        type="button"
        variant="text"
        color="error"
        icon="mdi-minus"
        :aria-label="t(strings.remove_grouping)"
        @click="emit('removeGrouping', index)"
      />
    </div>
    <v-btn
      type="button"
      variant="outlined"
      class="mb-4"
      prepend-icon="mdi-plus"
      @click="emit('addGrouping')"
    >
      {{ t(strings.add_grouping) }}
    </v-btn>
    <v-btn
      type="submit"
      color="primary"
      :loading="updateMutation.isPending.value"
    >
      {{ t(strings.submit) }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { MenuEditFormModel } from "./Detail.logic.ts";
import { buildUpdateMenuPayload } from "./Detail.logic.ts";
import { useUpdateMenuMutation } from "@sderickson/recipes-sdk";
import { menu_edit_form as strings } from "./MenuEditForm.strings.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const props = defineProps<{
  form: MenuEditFormModel;
  recipes: { id: string; title: string }[];
  menuId: string;
  collectionId: string;
}>();

const emit = defineEmits<{
  saved: [];
  addGrouping: [];
  removeGrouping: [index: number];
}>();

const { t } = useReverseT();
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const updateMutation = useUpdateMenuMutation();

async function onSubmit() {
  const { valid } = (await formRef.value?.validate()) ?? { valid: true };
  if (!valid) return;
  const payload = buildUpdateMenuPayload(
    props.form,
    props.menuId,
    props.collectionId,
  );
  await updateMutation.mutateAsync({
    id: payload.id,
    collectionId: payload.collectionId,
    name: payload.name,
    isPublic: payload.isPublic,
    groupings: payload.groupings,
  });
  emit("saved");
}
</script>
