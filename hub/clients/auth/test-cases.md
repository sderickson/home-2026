# Auth SPA — test cases & user stories

Generic Ory Kratos flows shared by **hub**, **recipes**, **notebook**, and other clients. Product clients send users to the auth subdomain with a full `redirect` URL (`return_to`); after login, registration, verification, or recovery, the browser should land on the app that initiated the flow when that URL is still known.

Use this doc for manual QA, Playwright scenarios, and aligning behavior when something is wrong.

---

## Cross-cutting conventions

- **`?redirect=`** — Full URL used as Kratos `return_to` where supported (see `hub/clients/links/auth-links.ts` per route).
- **`?flow=`** — Kratos flow id after a browser flow is created (refresh-safe).
- **Auth “home” `/`** — Redirects to `/login` and preserves query params (`router.ts`).

---

## Entry from a logged-out product

1. **As a visitor on a product’s logged-out root**, when I choose sign in or register, I am taken to the auth app on the correct route (login or registration) and the URL includes a `redirect` parameter pointing at that product’s post-auth destination (e.g. hub app home, recipes home).

2. **As a visitor who lands on auth without a `redirect`**, I can still complete login or registration; the app should send me to a sensible default when no `return_to` is available (intended: **hub** as the product-neutral home — verify against current behavior, which may still default to another app in some flows).

---

## Login

3. **As a user with a valid session who opens the login page** (e.g. bookmarked), I am not stuck on the form: existing session handling sends me toward the appropriate place (per `Login` loader / page behavior).

4. **As a user who signs in successfully with email already verified**, I am redirected to the URL from `redirect` / flow `return_to`, or the configured fallback when none was provided.

5. **As a user who signs in successfully but email is not verified**, I am sent to the verify wall (or equivalent) with `redirect` preserved so that after verification I can reach the product I came from.

---

## Registration

6. **As a new user completing registration**, after success I follow the same redirect / fallback rules as login (including verify wall if the identity is not verified yet).

---

## Email verification

7. **As a user completing verification in the browser** (code flow), after success I land on `return_to` from the flow or the fallback when absent.

8. **As a user who opens a verification link from email** (`?flow=` from courier), the flow loads and completion redirects consistently with the browser flow.

---

## Verify wall (signed in, email not verified)

9. **As a signed-in user with unverified email**, I see the verify wall and paths to finish verification; **`redirect`** is preserved for when I am allowed into the product.

10. **As a user who becomes verified** (e.g. after submitting the code), I am sent to `redirect` when present, or the fallback when not.

---

## Recovery (password reset)

11. **As a user using recovery from email or the browser**, I can complete the flow and end up at `redirect` / `return_to` or the fallback.

---

## Settings (authenticated)

12. **As a signed-in user on settings**, I can manage profile/password per Kratos configuration; session loss redirects me to login with a way to return to settings (`useSettingsRouteSync` / related).

---

## Logout

13. **As a signed-in user who hits the auth logout route**, I am sent through Kratos logout and then land on the URL in `?redirect=` when provided.

14. **As a user who logs out without a `redirect`**, I land on the **logged-out root** default (auth SPA uses hub home as `return_to` when `redirect` is missing — see `LogoutAsync.vue`).

---

## Deep links & resilience

15. **As a user or email client that drops query params**, if `redirect` is lost mid-flow, the completed flow should still send me somewhere safe (intended: **hub**); treat mismatches here as bugs to fix.

16. **As a user hitting unknown paths on the auth app**, I see the global not-found page (`/:pathMatch(.*)*`).

---

## Notes for automation

- Prefer asserting **final `window.location` or navigation** for flows that assign location after Kratos success.
- Matrix worth covering later: **hub vs recipes vs notebook** entry points × **login | register | verify | recovery | logout** × **with vs without `redirect`**.

When you add or change a story, link to the route (`authLinks.*`) and any composable or loader that owns the behavior so fixes stay localized.
