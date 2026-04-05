<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    persistent
    scroll-strategy="none"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="d-flex flex-column" style="max-height: 90vh">
      <v-card-title class="d-flex align-center">
        {{ t(strings.title) }} — {{ collectionName }}
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>
      <v-card-text class="flex-grow-1 overflow-auto">
        <div v-if="isOwner" class="mb-4">
          <v-label class="text-body-2 mb-1">{{ t(strings.add_member) }}</v-label>
          <div class="d-flex gap-2 align-center flex-wrap">
            <v-text-field
              v-model="newMemberEmail"
              :label="t(strings.email_label)"
              :placeholder="t(strings.email_placeholder)"
              variant="outlined"
              density="compact"
              hide-details
              class="flex-grow-1"
              style="min-width: 180px"
            />
            <v-select
              v-model="newMemberRole"
              :label="t(strings.role_label)"
              :items="roleItems"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              hide-details
              style="min-width: 100px"
            />
            <v-btn
              color="primary"
              variant="tonal"
              :disabled="!newMemberEmail.trim()"
              :loading="addingMember"
              @click="handleAddMember()"
            >
              {{ t(strings.add_member) }}
            </v-btn>
          </div>
        </div>

        <v-table>
          <thead>
            <tr>
              <th>{{ t(strings.email_label) }}</th>
              <th>{{ t(strings.role_label) }}</th>
              <th v-if="isOwner" class="text-right">{{ t(strings.actions_column) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in members" :key="member.id">
              <td>
                {{ member.email }}
                <v-chip
                  v-if="member.isCreator"
                  size="x-small"
                  color="primary"
                  variant="flat"
                  class="ml-1"
                >
                  {{ t(strings.creator_badge) }}
                </v-chip>
              </td>
              <td>
                <v-select
                  v-if="isOwner && !member.isCreator"
                  :model-value="member.role"
                  :items="roleItems"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="mt-1"
                  style="max-width: 120px"
                  @update:model-value="(role: string) => handleChangeRole(member.id, role)"
                />
                <span v-else>{{ roleLabel(member.role) }}</span>
              </td>
              <td v-if="isOwner" class="text-right">
                <v-btn
                  v-if="!member.isCreator"
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  @click="handleRemoveMember(member.id)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
        <p v-if="members.length === 0" class="text-medium-emphasis mt-2">
          {{ t(strings.no_members) }}
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          {{ t(strings.cancel) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useMembersManagementFlow } from "./useMembersManagementFlow.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { members_management_dialog as strings } from "./MembersManagementDialog.strings.ts";

const { t } = useReverseT();

const props = defineProps<{
  modelValue: boolean;
  collectionId: string;
  collectionName: string;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const {
  members,
  isOwner,
  newMemberEmail,
  newMemberRole,
  addingMember,
  handleAddMember,
  handleChangeRole,
  handleRemoveMember,
} = useMembersManagementFlow(
  computed(() => props.collectionId),
  computed(() => props.modelValue),
);

const roleItems = computed(() => [
  { value: "owner" as const, label: t(strings.role_owner) },
  { value: "editor" as const, label: t(strings.role_editor) },
  { value: "viewer" as const, label: t(strings.role_viewer) },
]);

function roleLabel(role: string) {
  if (role === "owner") return t(strings.role_owner);
  if (role === "editor") return t(strings.role_editor);
  return t(strings.role_viewer);
}
</script>
