<template>
  <v-form ref="formRef" @submit.prevent="onSubmit">
    <v-text-field
      v-model="form.name"
      :label="t(strings.name_label)"
      :placeholder="t(strings.name_placeholder)"
      class="mb-4"
      variant="outlined"
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
        @click="removeGrouping(index)"
      />
    </div>
    <v-btn
      type="button"
      variant="outlined"
      class="mb-4"
      prepend-icon="mdi-plus"
      @click="addGrouping"
    >
      {{ t(strings.add_grouping) }}
    </v-btn>

    <v-btn
      type="submit"
      color="primary"
      :loading="mutation.isPending.value"
    >
      {{ t(strings.submit) }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath } from "@saflib/links";
import { useCreateMenuMutation } from "@sderickson/recipes-sdk";
import { create_menu_form as strings } from "./CreateMenuForm.strings.ts";
import { buildCreateMenuPayload, type CreateMenuFormModel } from "./Create.logic.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const props = defineProps<{
  collectionId: string;
  recipes: { id: string; title: string }[];
}>();

const { t } = useReverseT();
const router = useRouter();

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const form = reactive<CreateMenuFormModel>({
  name: "",
  groupings: [],
});

const mutation = useCreateMenuMutation();

function addGrouping() {
  form.groupings.push({ name: "", recipeIds: [] });
}

function removeGrouping(index: number) {
  form.groupings.splice(index, 1);
}

async function onSubmit() {
  const { valid } = (await formRef.value?.validate()) ?? { valid: true };
  if (!valid) return;
  try {
    const result = await mutation.mutateAsync(
      buildCreateMenuPayload(form, props.collectionId),
    );
    router.push(
      constructPath(appLinks.menusDetail, {
        params: { collectionId: props.collectionId, id: result.menu.id },
      }),
    );
  } catch {
    // Mutation error surfaced by TanStack
  }
}
</script>
