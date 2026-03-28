# Auth UI refactor prompts

A series of self-contained prompts to bring the code in line with `hub/clients/auth/README.md`. Execute them in order — each builds on the previous.

Run tests after each step to verify nothing broke:

```sh
npx vitest run --config hub/clients/auth/vitest.config.ts
```

---

## 1. Move general node utilities from `Registration.logic.ts` to `common/`

The functions `isKratosInputNode`, `kratosEffectiveInputType`, and `registrationSubmitErrorMessage` in `hub/clients/auth/pages/kratos/registration/Registration.logic.ts` are used across many flow directories (login, settings, recovery, common). Per the README, general-purpose Kratos node utilities belong in `common/`.

**Task:**

1. Create `hub/clients/auth/pages/kratos/common/kratosNodeUtils.ts` and move `isKratosInputNode` and `kratosEffectiveInputType` (plus the `KratosInputAttrs` type alias they use) into it. Also create `hub/clients/auth/pages/kratos/common/kratosErrorMessage.ts` and move `registrationSubmitErrorMessage` into it, renamed to `kratosSubmitErrorMessage`.
2. In `Registration.logic.ts`, replace the moved functions with re-exports from the new locations so existing tests still pass without changes:
   ```ts
   export { isKratosInputNode, kratosEffectiveInputType } from "../common/kratosNodeUtils.ts";
   export { kratosSubmitErrorMessage as registrationSubmitErrorMessage } from "../common/kratosErrorMessage.ts";
   ```
3. Update all direct imports from `Registration.logic.ts` in `common/` files to import from the new `common/` modules instead. Files to update:
   - `common/KratosFlowUi.vue`
   - `common/KratosFlowUiNodeAt.vue`
   - `common/kratosLoginPasskeyInIdentifier.ts`
   - `common/kratosPasskeyRemoveLabel.ts`
   - `common/kratosWebAuthnInputClick.ts`
   - `common/useKratosFieldModelsForNodes.ts`
   - `common/useKratosFlowFocusAfterUiChange.ts`
4. Update imports in non-registration flow files that import `registrationSubmitErrorMessage`:
   - `login/useLoginFlow.ts`
   - `recovery/useRecoveryFlow.ts`
   - `settings/useSettingsFlow.ts`
5. Move the tests for `isKratosInputNode`, `kratosEffectiveInputType`, and `registrationSubmitErrorMessage` from `Registration.logic.test.ts` into new test files adjacent to the new modules (`common/kratosNodeUtils.test.ts` and `common/kratosErrorMessage.test.ts`). Keep the original test file working for any Registration-specific tests that remain.
6. Run the test suite and fix any breakage.

---

## 2. Remove the `includeImgNodes` prop (always true)

The `includeImgNodes` prop on `KratosFlowUi.vue` defaults to `true` and is never passed by any consumer. It adds a prop, an inject member, and a conditional in `KratosFlowUiNodeAt.vue` for no reason.

**Task:**

1. Remove the `includeImgNodes` prop from `KratosFlowUi.vue` (the prop definition and its default).
2. Remove `includeImgNodes` from the `provide()` call in `KratosFlowUi.vue`.
3. Remove `includeImgNodes` from the `KratosFlowUiInject` interface in `kratosFlowUiInject.ts`.
4. In `KratosFlowUiNodeAt.vue`, remove the `includeImgNodes` local computed and the `v-else-if="includeImgNodes && ..."` guard on the `img` template — make it just `v-else-if="node && node.type === 'img'"`.
5. Run the test suite.

---

## 3. Remove unused inject members

Four members on the `KratosFlowUiInject` interface are provided by `KratosFlowUi.vue` but never read by `KratosFlowUiNodeAt.vue`: `renderedNodes`, `passwordVisible`, `passkeyLoginTriggerNode`, and `identityPasskeyDisplayFallback`. They are only used internally by functions defined in `KratosFlowUi.vue` itself.

**Task:**

1. Remove `renderedNodes`, `passwordVisible`, `passkeyLoginTriggerNode`, and `identityPasskeyDisplayFallback` from the `KratosFlowUiInject` interface in `kratosFlowUiInject.ts`.
2. Remove these four keys from the `provide()` call in `KratosFlowUi.vue`. The local `const`/`computed` declarations for these values stay — they are still used by other functions in the same file.
3. Run the test suite.

---

## 4. Remove the dead `.kratos-flow-form__qr` style from `KratosFlowUi.vue`

After the node rendering was moved to `KratosFlowUiNodeAt.vue`, the `.kratos-flow-form__qr` CSS rule in `KratosFlowUi.vue`'s `<style scoped>` is unreachable (img nodes are rendered in the child component, which has its own copy of the style).

**Task:**

1. Delete the `.kratos-flow-form__qr` rule (lines 446-450) from `KratosFlowUi.vue`'s `<style scoped>` block. Keep the other styles.
2. Verify `KratosFlowUiNodeAt.vue` still has its own `.kratos-flow-form__qr` rule.

---

## 5. Add a `#node` scoped slot to `KratosFlowUi`

Per the README, flow-specific node customization should use a scoped slot rather than boolean props on the generic component.

**Task:**

1. In `KratosFlowUi.vue`'s template, wrap each `<KratosFlowUiNodeAt>` invocation in a slot:
   ```vue
   <slot name="node" :node="displayNodes[idx]" :idx="idx">
     <KratosFlowUiNodeAt :idx="idx" />
   </slot>
   ```
   Do this for all three places `KratosFlowUiNodeAt` appears (the flat list, the default-group list, and the per-tab list). The slot fallback is the existing `KratosFlowUiNodeAt` — so all current consumers that don't use the slot get identical behavior.
2. No changes to consumers yet. All existing `<KratosFlowUi>` usages should continue working identically since the slot fallback is the default rendering.
3. Run the test suite.

---

## 6. Extract passkey-merge-into-identifier out of `KratosFlowUi` into `LoginFlowForm`

The props `mergePasskeyTriggerIntoIdentifier`, the computed `passkeyLoginTriggerNode`, `displayNodes` filtering via `filterOutMergedLoginTriggerButton`, and the functions `appendInnerIcon` / `identifierPasskeyFieldClass` / `onAppendInnerClick` (the parts that branch on passkey trigger) are login-specific. Only `LoginFlowForm.vue` uses them.

After Prompt 5 added the `#node` slot, the login page can own this UX itself.

**Task:**

1. Remove the `mergePasskeyTriggerIntoIdentifier` prop from `KratosFlowUi.vue`.
2. Simplify `displayNodes` — it should now just be `renderedNodes` (no filtering). Remove the `filterOutMergedLoginTriggerButton` call. The import of `filterOutMergedLoginTriggerButton`, `shouldMergePasskeyTriggerIntoIdentifier`, and `findPasskeyOrWebAuthnLoginTrigger` from `kratosLoginPasskeyInIdentifier.ts` can be removed from `KratosFlowUi.vue`.
3. Remove the `passkeyLoginTriggerNode` computed from `KratosFlowUi.vue`.
4. Simplify `appendInnerIcon` to just return `appendPasswordIcon(node, idx)` — remove the passkey `mdi-cloud-key` branch.
5. Remove `identifierPasskeyFieldClass` from `KratosFlowUi.vue`.
6. Simplify `onAppendInnerClick` to just handle the password visibility toggle — remove the passkey trigger branch.
7. Update `KratosFlowUiInject`: remove `identifierPasskeyFieldClass` and update `appendInnerIcon` / `onAppendInnerClick` if their signatures changed. (They shouldn't change — only the implementation narrows.)
8. In `KratosFlowUiNodeAt.vue`, remove the `:class="ctx.identifierPasskeyFieldClass(node)"` binding (it will always return `undefined` now, but cleaner to remove). Remove the import/usage if the function is gone from the inject.
9. In `LoginFlowForm.vue`:
   - Import `findPasskeyOrWebAuthnLoginTrigger`, `isPasskeyLoginTriggerButton`, `isWebAuthnLoginTriggerButton` from `kratosLoginPasskeyInIdentifier.ts`.
   - Import `runKratosWebAuthnInputClick` from `kratosWebAuthnInputClick.ts`.
   - Import `KratosFlowUiNodeAt` from `common/KratosFlowUiNodeAt.vue`.
   - Compute `passkeyLoginTriggerNode` locally from `flow.ui.nodes`.
   - Compute a `filteredNodes` list that excludes the trigger button (same logic that was in `filterOutMergedLoginTriggerButton`, but owned here).
   - Pass `:nodes="filteredNodes"` to `KratosFlowUi` (so the trigger button is excluded from the generic render).
   - Use the `#node` slot to customize the identifier field: when the node is the identifier text input and a passkey trigger exists, render a `<KratosFlowUiNodeAt>` wrapper that adds the `mdi-cloud-key` append-inner icon and a click handler calling `runKratosWebAuthnInputClick`. For all other nodes, fall through to the default slot content.
   - Move the `.kratos-flow-form__identifier-with-passkey` CSS rule from `KratosFlowUi.vue` to `LoginFlowForm.vue`.
10. Remove the `merge-passkey-trigger-into-identifier` attribute from the `<KratosFlowUi>` usage in `LoginFlowForm.vue`.
11. Run the test suite. The passkey trigger tests in `kratosLoginPasskeyInIdentifier.test.ts` should still pass since those are pure function tests.

---

## 7. Extract MFA tab logic out of `KratosFlowUi` into `LoginFlowForm`

The props `splitLoginSecondFactorGroupsIntoTabs` and `resolveGroupTabLabel`, plus the computed values `nonDefaultGroupsInOrder`, `defaultNodeIndices`, `useMfaGroupTabs`, the `mfaTab` ref, the `groupTabTitle` function, and the template branch for `v-tabs`/`v-window` are all login-specific (only `LoginFlowForm` uses them).

**Task:**

1. Remove `splitLoginSecondFactorGroupsIntoTabs` and `resolveGroupTabLabel` props from `KratosFlowUi.vue`.
2. Remove the `useMfaGroupTabs` computed, `nonDefaultGroupsInOrder` computed, `defaultNodeIndices` computed, `mfaTab` ref, the `flowId` watch that resets `mfaTab`, and `groupTabTitle` function from `KratosFlowUi.vue`.
3. Simplify the template: remove the `v-if="!useMfaGroupTabs"` / `v-else` branching in the fieldset. The fieldset should always render the flat list:
   ```vue
   <fieldset class="kratos-flow-form__fieldset">
     <template v-for="idx in allNodeIndices" :key="'node-' + idx">
       <slot name="node" :node="displayNodes[idx]" :idx="idx">
         <KratosFlowUiNodeAt :idx="idx" />
       </slot>
     </template>
   </fieldset>
   ```
4. In `LoginFlowForm.vue`, implement the MFA tab layout using the `#node` slot (or by wrapping `KratosFlowUi` in a component that handles the tab logic). The approach:
   - Create a composable `useKratosMfaGroupTabs(nodes)` in `login/` (or inline in `LoginFlowForm.vue` if small enough) that computes `nonDefaultGroupsInOrder`, `defaultNodeIndices`, `mfaTab`, and `useMfaGroupTabs`.
   - When MFA tabs are active, `LoginFlowForm` renders `KratosFlowUi` once for each tab's node subset using the `:nodes` prop, or uses the slot to conditionally hide nodes not in the active tab. Choose whichever approach is simpler.
   - Move `groupTabTitle` and the `resolveLoginGroupTabLabel` function into `LoginFlowForm.vue` or a `login/` composable.
5. Remove `allNodeIndices` from `KratosFlowUi.vue` if it is no longer used (it may still be needed for the flat render).
6. Run the test suite.

---

## Notes

- After all prompts, `KratosFlowUi.vue` should have ~8 props, a flat node-rendering loop with a `#node` slot, and the inject should contain only what `KratosFlowUiNodeAt` reads.
- The `kratosLoginPasskeyInIdentifier.ts` and `kratosPasskeyRemoveLabel.ts` utility files remain in `common/` — they are pure functions that any flow might use in the future.
- See `hub/clients/auth/README.md` for the target architecture these prompts align to.
