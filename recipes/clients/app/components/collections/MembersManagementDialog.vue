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
        <v-table class="members-table">
          <thead>
            <tr>
              <th>{{ t(strings.email_label) }}</th>
              <th>{{ t(strings.role_label) }}</th>
              <th v-if="isOwner" class="text-right">
                {{ t(strings.actions_column) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in members" :key="member.id">
              <td>{{ member.email }}</td>
              <td>
                <v-select
                  v-if="isOwner && !member.isCreator"
                  class="role-select"
                  :model-value="member.role"
                  :items="roleItems"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="
                    (role: string) => handleChangeRole(member.id, role)
                  "
                />
                <span v-else>{{
                  member.isCreator
                    ? t(strings.role_creator)
                    : roleLabel(member.role)
                }}</span>
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
            <tr v-if="isOwner">
              <td>
                <v-text-field
                  v-model="newMemberEmail"
                  :label="t(strings.email_label)"
                  :placeholder="t(strings.email_placeholder)"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </td>
              <td>
                <v-select
                  v-model="newMemberRole"
                  class="role-select"
                  :label="t(strings.role_label)"
                  :items="roleItems"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </td>
              <td class="text-right">
                <v-btn
                  icon="mdi-plus"
                  variant="text"
                  size="small"
                  color="primary"
                  :disabled="!newMemberEmail.trim()"
                  :loading="addingMember"
                  :aria-label="t(strings.add_member)"
                  :title="t(strings.add_member)"
                  @click="handleAddMember()"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
        <p
          v-if="members.length === 0 && !isOwner"
          class="text-medium-emphasis mt-2"
        >
          {{ t(strings.no_members) }}
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          {{ t(strings.done) }}
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

<style scoped>
/* Align cell content with Vuetify row chrome; avoid extra margins on fields. */
.members-table :deep(tbody td) {
  vertical-align: middle;
}
.members-table :deep(tbody .v-input) {
  margin-top: 0;
  margin-bottom: 0;
}
.members-table :deep(.role-select),
.members-table :deep(.role-select .v-field) {
  width: 100%;
  max-width: 100%;
}
</style>
