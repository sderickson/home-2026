# Auth SPA — Kratos Custom UI

Vue 3 + Vuetify single-page app providing custom UI for [Ory Kratos](https://www.ory.sh/kratos/) self-service browser flows: login, registration, recovery, verification, settings, and a post-registration email-verify wall.

This document describes the **intended architecture**. When code diverges from what is described here, treat the document as correct and the code as needing a fix.

## Page structure

Each Kratos flow gets three route-level files:

| File | Role |
|---|---|
| `*Async.vue` | Lazy wrapper (`defineAsyncComponent`) |
| `*.vue` (page) | Fetches the flow, handles error states (expired, CSRF, unhandled) |
| `*FlowForm.vue` | Renders the live flow form; owns submit logic |

A page fetches the flow via a `*.loader.ts` composable and hands the resulting flow object to the form component. The form component configures `KratosFlowUi` (the universal renderer) with props and listens for `@submit`.

Routes are defined in `router.ts` using link constants from `@sderickson/hub-links`.

## File conventions

| Suffix | Purpose |
|---|---|
| `.vue` | Vue SFC (component or page) |
| `.logic.ts` | Pure, framework-free helper functions. Must be unit-testable without DOM or Vue. |
| `.logic.test.ts` | Tests for the adjacent `.logic.ts` |
| `.test.ts` | Component / integration tests (may use Vue Test Utils or Playwright) |
| `.loader.ts` | TanStack Query composable that fetches a Kratos flow |
| `.strings.ts` | UI copy as plain exported objects (keys are logical names, values are English strings) |

### Naming rules

- Files in `common/` use a `kratos` prefix for pure helpers (e.g. `kratosNodeUtils.ts`) and a `useKratos` prefix for Vue composables (e.g. `useKratosFieldModelsForNodes.ts`). Ory-specific browser glue uses an `ory` prefix (e.g. `oryWebAuthnWindow.ts`).
- Flow-specific files live in their flow directory (`login/`, `registration/`, etc.).
- General-purpose Kratos node utilities (`isKratosInputNode`, `kratosEffectiveInputType`, etc.) belong in `common/`, not in a flow-specific logic file.

## KratosFlowUi — the universal node renderer

`common/KratosFlowUi.vue` is the single component that turns a Kratos `UiContainer` into Vuetify form fields. Every flow form uses it.

### Props (should be limited to concerns used by multiple consumers)

| Prop | Type | Default | Purpose |
|---|---|---|---|
| `flow` | `KratosFlowUiModel` | required | The Kratos flow whose `ui.nodes` / `ui.messages` to render |
| `nodes` | `UiNode[]` | `flow.ui.nodes` | Override node list (settings uses this for per-group subsets) |
| `submitting` | `boolean` | required | Loading state — disables fields, hides stale errors |
| `idPrefix` | `string` | `"kratos-flow"` | Prefix for element `id` attributes |
| `hideSubmitNames` | `string[]` | `[]` | Omit specific submit buttons by `name` (recovery / verification hide `email`) |
| `messageFilter` | function | — | Return `false` to suppress a Kratos message (registration hides "Property password is missing" on step 1) |
| `interceptOryProgrammaticSubmit` | `boolean` | `false` | Patch `form.submit()` so Ory's `webauthn.js` triggers the SPA submit handler instead of a full navigation |
| `identityPasskeyDisplayFallback` | `string` | — | Fallback label for "unnamed" passkeys in settings remove buttons |

Props that only a single consumer needs (e.g. login-specific passkey merge, MFA tab layout) should **not** live on KratosFlowUi. Instead, the consuming page should use the `#node` scoped slot or its own composable to own that behavior.

### Scoped slot: `#node`

For flow-specific node customization (custom icons, merged fields, alternate layouts), KratosFlowUi exposes a `#node` scoped slot:

```vue
<KratosFlowUi :flow="flow" :submitting="submitting" @submit="onSubmit">
  <template #node="{ node, idx, defaultRender }">
    <!-- Return nothing to use default rendering -->
    <!-- Or render custom markup for specific nodes -->
  </template>
</KratosFlowUi>
```

The slot receives:
- `node` — the `UiNode` at this position
- `idx` — the node index within the display list
- `defaultRender` — a render function / component for the standard rendering of this node

This keeps flow-specific UX (e.g. merging a passkey trigger into the identifier field) in the flow's own `*FlowForm.vue` rather than adding boolean flags to the shared component.

### KratosFlowUiNodeAt

`common/KratosFlowUiNodeAt.vue` is the default per-node renderer. It receives context from `KratosFlowUi` via Vue `provide`/`inject` (see `kratosFlowUiInject.ts`).

The inject interface should contain **only** members that `KratosFlowUiNodeAt` actually reads. Internal computed values that KratosFlowUi uses for its own logic (e.g. password visibility state, intermediate filtered-node lists) stay as local variables — they do not go on the inject.

### Events

| Event | Payload | Notes |
|---|---|---|
| `submit` | `(form: HTMLFormElement, submitter: HTMLElement \| null)` | The page's `*FlowForm.vue` builds `FormData`, calls the Kratos update mutation, and handles the response |

Submit-body construction is a pure function in the flow's `.logic.ts` file (e.g. `buildLoginUpdateBodyFromFormData`), making it easy to test without a DOM.

## Ory WebAuthn / passkey integration

Kratos sends `type: "script"` nodes containing `webauthn.js`. Since we use a custom UI (not Kratos's default HTML), we must:

1. **Inject the scripts** — `useKratosOryWebAuthnScripts` appends Kratos script nodes to `document.body` when the flow nodes change, and removes them on unmount.
2. **Wire window aliases** — Ory registers implementations under `__oryPasskeyLogin` etc., while `onclickTrigger` attributes reference the unprefixed name. `oryWebAuthnWindow.ts` bridges the two.
3. **Patch `form.submit()`** — After a passkey ceremony, Ory calls `form.submit()` directly (bypassing `submit` events). `kratosFormSubmitOryPatch.ts` intercepts this so the SPA's `@submit.prevent` handler runs instead of a full-page navigation.
4. **Trigger the ceremony** — `kratosWebAuthnInputClick.ts` invokes the Ory window function named in a node's `onclickTrigger` attribute.

When a flow contains passkey or WebAuthn nodes, the consuming `*FlowForm.vue` should set `intercept-ory-programmatic-submit` to `true`.

## Adding a new auth method

1. Enable the method in `hub/dev/kratos/kratos.yml`.
2. If the method has its own submit body shape, add a builder to the relevant `.logic.ts` and cover it in `.logic.test.ts`.
3. Update `buildLoginUpdateBodyFromFormData` (or the corresponding flow's builder) to detect the new method from `FormData`.
4. If the method needs custom rendering (special icons, merged fields, etc.), implement it in the flow's `*FlowForm.vue` via the `#node` slot — not by adding props to `KratosFlowUi`.
5. If the method introduces new Vuetify field icons, add them to `kratosVuetifyFieldIcons.ts`.
6. Add UI copy to the appropriate `.strings.ts` file.

## Testing

- **Pure logic** (`*.logic.ts`): tested with Vitest in `*.logic.test.ts`. No DOM or Vue required.
- **Composables** (`use*.ts`): tested in `use*.test.ts` with Vue Test Utils where needed.
- **Components** (`*.vue`): integration tests in `*.test.ts`.
- **E2E**: Playwright config in `playwright.config.ts`.

Run unit/component tests:

```sh
npx vitest run --config hub/clients/auth/vitest.config.ts
```
