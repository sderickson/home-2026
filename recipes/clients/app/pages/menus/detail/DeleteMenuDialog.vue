<template>
  <v-dialog :model-value="modelValue" max-width="400" persistent @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>{{ t(strings.delete_confirm) }}</v-card-title>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="emit('update:modelValue', false)">
          {{ t(strings.cancel) }}
        </v-btn>
        <v-btn
          color="error"
          :loading="deleteMutation.isPending.value"
          @click="onConfirm"
        >
          {{ t(strings.delete) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath } from "@saflib/links";
import { useDeleteMenuMutation } from "@sderickson/recipes-sdk";
import { delete_menu_dialog as strings } from "./DeleteMenuDialog.strings.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const props = defineProps<{
  modelValue: boolean;
  menuId: string;
  collectionId: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  deleted: [];
}>();

const { t } = useReverseT();
const router = useRouter();
const deleteMutation = useDeleteMenuMutation();

async function onConfirm() {
  await deleteMutation.mutateAsync({
    id: props.menuId,
    collectionId: props.collectionId,
  });
  emit("update:modelValue", false);
  emit("deleted");
  router.push(
    constructPath(appLinks.menusList, {
      params: { collectionId: props.collectionId },
    }),
  );
}
</script>
