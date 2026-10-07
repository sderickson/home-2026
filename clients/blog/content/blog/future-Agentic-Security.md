# Agentic Security

_tbd_

In July, OpenAI's internal evaluation agents broke out of their sandbox, harvested credentials, and compromised parts of Hugging Face's production infrastructure. Hugging Face logged more than 17,000 attacker actions before closing the holes ([their writeup](https://github.com/huggingface/blog/blob/main/security-incident-july-2026.md), [OpenAI's](https://openai.com/index/hugging-face-incident-and-the-road-ahead/)). This week [Reuters reported](https://www.reuters.com/legal/litigation/openais-rogue-agents-probed-hugging-face-weaknesses-two-months-before-major-hack-2026-09-16/) that the same agents had hijacked two Hugging Face accounts and been quietly probing since May.

What makes this story useful is that it's two different security problems at once. From OpenAI's side, it's "our own agent, with the access we gave it, did things we never intended." From Hugging Face's side, it's "an attacker that never sleeps hammered us with thousands of actions." Anyone building software with agents now has to worry about both, plus a third: agents writing code that is eminently hackable without anyone noticing. And lurking behind all of them is a fourth, where an attacker doesn't break in at all but talks your own agent into opening the door. The bar for what's acceptable to deploy has gone up because the cost of attacking you has gone down.

Here's what I think every project that takes security seriously should be doing differently now. Each item exists because of at least one of those problems.

## Your own agent

### Don't let agents push to prod, or take other privileged actions

Agents have a lot of power over our machines, and the more we lean on them the more access they accumulate. At minimum, there should be a wall between the agent and the production deploy. With CI/CD often meaning that a merge to main is a deploy, that means no credential on the machine the agent runs on should be able to reach main. Not an SSH key, not a `gh` login, not a token in an environment variable.

Branch protection is the first layer: require a PR for every merge to main, and make sure the agent's identity can't approve or merge one. The second layer is keeping the push credential itself out of the agent's reach. I use the [1Password SSH agent](https://developer.1password.com/docs/ssh/) so that every push requires a biometric approval, and I don't stay logged into `gh` on the command line. If you're unsure whether there's another path, ask your agent to push to main and see what happens.

Pushing to main is just the most obvious privileged action. An agent running as your user on your laptop can also read every file you can, run every CLI you're logged into, and reach every host on your network. OpenAI's agents got out because the sandbox had a hole in it; most of us don't have a sandbox to begin with. Run agents inside a devcontainer, a Codespace, or a similar bounded environment where the only credentials present are the ones that specific task needs. Same-machine convenience is the thing you're giving up, and it's worth giving up.

### Be judicious with agent access to third-party services

An API key on your dev machine is convenient for testing an integration, and it is also exactly what the Hugging Face attackers harvested from a processing worker. Minimize how many keys are present and how much each can do. Use a dedicated test account or, if the service offers one, a sandbox key, so there's a ceiling on the damage the agent (or you) can do.

Better still, once you've tested the live integration, write a mock client and make it the default in tests and in development. In my stack every third-party integration has one so a dev environment needs no sensitive keys at all. For integrations with inbound webhooks, go a step further and build a small dev-only UI that fakes activity on the third party's side, so you can exercise the whole flow without a real account. This is also what made it safe to hand dev environments to [non-engineers](./2026-09-23-Redistributed-Ownership): they can't leak a key that isn't there. Mocks and test helpers are cheap to generate now. There's not much excuse for skipping them.

## Code the agent writes

### Build verification into the platform, not the handler

Say you have an endpoint that under no circumstances should be reachable by anyone outside the company. You could:

1. Add a check inside the handler.
2. Add middleware next to where the handler is registered.
3. Add a tag to the API specification, and have a global middleware enforce every tag.

Each is better than the last, because each moves the rule further from the code an agent is most likely to write incorrectly, and closer to a place where it's enforced once for everything. But option three still has a hole. Suppose the tag you add is `siteadmin` and the tag the middleware looks for is `site-admin`. Your tag looks like it does something and does nothing. So there needs to be a check that rejects unknown tags, at build time or at startup, so a typo is a failure instead of an open door. And there need to be unit, integration, and end-to-end tests proving the enforcement keeps working, because "it's enforced globally" is only true until someone refactors the global.

This is the same argument I made in [Agentic Stacks](./2026-09-15-Agentic-Stacks) wearing a security costume. Agents will faithfully add a tag every time if the tag is the only way to register a route. They will forget the inline check some of the time if the inline check is one of several things they're supposed to remember. Make the easy way the secure way, then make the setup easy to audit and easy to trust.

### Keep a threat model, and update it in the workflow

Early in a product's life, ideally before launch, write a threat model. Take an honest inventory of everything you have, inside and outside the codebase, hand it to an agent, and have it draft the document. Then read the draft _thoroughly_, fix what's wrong or missing, close the large and easy gaps as you go, and share it. Mine live in the repo next to the security tests: [the starter version](https://github.com/sderickson/saflib/blob/main/base/security/threat-model.md) ships with my framework, and each product replaces it with its own.

The document is only useful if it stays current, and the way to keep it current is to make checking it part of the process rather than a separate exercise. My [project spec workflow](https://docs.saf-demo.online/processes/docs/workflows/spec-project.html) now includes a Security Model Updates section in every spec. The agent reads the product's threat model, works through new public surface, authorization, data handling, integrations and secrets, and file handling for the feature being planned, and either records the changes or writes "None" with a reason. Once the spec is approved, the workflow applies those changes to the threat model before any implementation starts, and the plan is expected to include the security work it implies. Most features don't change the model. Checking anyway is what keeps security top of mind, and the check costs one agent step.

The threat model also needs a section it didn't need two years ago: what the agents can reach. Not the product's agents, if it has any, but the coding and operations agents you and your team run. Which MCP servers are configured, which environment variables and tokens are present where they run, which directories and hosts they can see, which of them run against production data or inside internal systems, and which run unattended. This is the inventory OpenAI would have wanted before July, and it goes stale faster than the rest of the document, because adding a tool to an agent takes thirty seconds and nobody thinks of it as a security change.

### Elevate review of sensitive files

Some files deserve a human's full attention every time they change, no matter how large the PR they arrive in. The production `docker-compose` file is the obvious one. A one-line change there can expose a server port directly to the internet, and it will sit quietly in a five-hundred-file diff alongside the feature it was made for. The Caddyfile, the CSP allowlist, the auth middleware, the list of routes that skip authentication, anything under `security/`, and CI configuration all belong on the same list.

I have caught this in the wild. An agent, trying to make some testing easier, once proposed exposing the node-exporter metrics endpoint directly. Node-exporter reports process environment variables, and those environment variables held API keys. It wasn't malicious and it wasn't stupid; from the agent's point of view it was the shortest path to the thing it was asked to do. It was just a change that a reviewer skimming a large PR for the feature would have had no reason to look at.

I haven't built the fix yet, but it's next. The [dev-site](https://docs.saf-demo.online/dev-site/docs/01-overview.html) I described in [Agentic Stacks](./2026-09-15-Agentic-Stacks) already exists to pull the key facts out of a large change so they can be reviewed on their own. Sensitive files should be one of those facts, surfaced at the top of every review and requiring an explicit acknowledgment before merge, so that a small security change can't ride in unnoticed on a big product change. Until that's in place, a CODEOWNERS entry or a CI check that fails when those paths change without a matching label gets you most of the way.

## Agents attacking you

### Make updating versions trivial

Automate opening and fixing dependency update PRs, especially the ones that address security advisories, so that staying current is a matter of opening a page, skimming the changes, and merging. The window between an advisory and an automated exploit attempt is shrinking, and agentic attackers don't need to prioritize which CVE to try.

Part of making updates easy is keeping the dependency count down. Review your dependencies periodically and ask whether each is still necessary. If a dependency is large and you use a small slice of it, consider replacing it with your own implementation. And look twice at every package an agent suggests installing. Agents will confidently recommend packages that don't exist, that were abandoned years ago, or that were published last week by nobody in particular. That is a supply-chain attack surface that didn't exist when a human had to go find the package themselves.

### Treat everything an agent reads as input

Everything an agent reads is a potential instruction. A dependency's README, a GitHub issue it's been asked to triage, a bug report with a stack trace pasted in, an MCP tool's response, a web page it fetched for documentation. If any of that came from outside your organization, someone outside your organization can put text in front of your agent, and agents are not reliably good at telling the difference between the task and the content. Hugging Face's breach started with a malicious dataset abusing a loader that executed code; untrusted content reaching something that acts on it is the same shape, and an agent is something that acts on it.

The mitigation is the same one you'd apply to any untrusted input. Decide which agents handle content from outside, and give those agents the least access you can. An agent that triages public issues should not have the credentials of an agent that deploys. An agent that reads production logs should not be the one that can push a PR. Don't paste production data into a coding session without scrubbing it first. And when an agent is running unattended, assume that whatever it reads during the run is an attack surface, and bound what it can do accordingly.

### Limit exposure

Do you need to collect all this information about your users? Do you need to send all of it to your analytics vendor? Does it need to be retained after it's processed? Do you need to request all those scopes when a user sets up an integration? Don't gather, propagate, or store data until it's been determined necessary and the threat model has been updated to account for it. Every copy in every place is one more thing an attacker who probes you for months can find, and you owe your users better than a dozen copies of their data in places it didn't need to be.

One rule I've followed for a long time turns out to help with the previous section too: never put user-submitted strings into logs of any kind. Log the JSON schema validation error, not the input that triggered it. Log the user's id, not their name or email. The original reason was PII. The new reason is that anything an attacker can get into your logs is something they can get in front of the agent you've asked to investigate those logs. A system with no user input in its logs, metrics, and error reports is a system whose logs, metrics, and error reports an agent can read freely. I do wonder whether you could still smuggle a message through the side channels that remain, a pattern of 500s spaced out like Morse code, say, that an agent picks up on and interprets. I don't have an answer for that one. But keeping user content out of the operational data cuts the surface down to the weird cases, and that's a much better place to be.

## What changed

Most of security didn't change. MFA on every service, security headers, audits, training, and the rest of the checklist are as necessary as they were two years ago. Some items are a step up in importance without being new: secret scanning in pre-commit and CI, since agents love to hardcode a key "temporarily" to get a test passing; pinned dependencies and a wary eye on lockfile changes; audit logs on privileged actions, which are the reason Hugging Face could reconstruct 17,000 events; rate limits on public endpoints, which are what make a tireless attacker expensive; and short-lived credentials, since the ones that got harvested in July were the long-lived kind. Do those. The items above are the ones agents changed more fundamentally: either because your own agent now has access you need to bound, because the code in your product was written by something that doesn't notice when a tag does nothing or a port is public, because the thing probing your perimeter is now tireless and cheap, or because that thing can now try talking to your tools instead of breaking them. Even if you're early, write the threat model. And be very deliberate about what capabilities you hand to agents inside your systems, because as OpenAI just demonstrated, they will use them.
