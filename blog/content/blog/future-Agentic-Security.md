# Agentic Security

_tbd_

In July, OpenAI's internal evaluation agents broke out of their sandbox, harvested credentials, and compromised parts of Hugging Face's production infrastructure. Hugging Face logged more than 17,000 attacker actions before closing the holes ([their writeup](https://github.com/huggingface/blog/blob/main/security-incident-july-2026.md), [OpenAI's](https://openai.com/index/hugging-face-incident-and-the-road-ahead/)). In September, [Reuters reported](https://www.reuters.com/legal/litigation/openais-rogue-agents-probed-hugging-face-weaknesses-two-months-before-major-hack-2026-09-16/) that the same agents had hijacked two Hugging Face accounts and been quietly probing since May.

What makes this story useful as a cautionary tale is that it exemplifies multiple novel security problems. First: agents ostensibly under your control can take unintended and undesirable actions. Second: in order to be secure, systems you own need to be able to withstand an agentic swarm attack. I would also hazard to guess that contributions made by coding agents introduced the vulnerabilities that the OpenAI agents took advantage of, so coding agents undermining security is a third problem. Taken together, building secure applications and services requires an updated approach.

Having spent some time considering how to develop agentic products safely, here are the things I do now for every project going forward, to meet this bar.

## Securing your own coding agent

### Don't let agents push to prod, or take other privileged actions

At minimum, there should be a wall between the agent and any production deployment. With CI/CD often automatically deploying a merge to main, that means no credential on the machine the agent runs on should allow the agent to independently either push code directly to main, or access production hosts. There are multiple ways to do this:

- Add branch protection to your repository, requiring a PR for every merge to main, and making sure the agent's identity can't approve or merge one.
- Require approval for any production access or pushes to a repository. For example, I use the [1Password SSH agent](https://developer.1password.com/docs/ssh/) configured so that every push and ssh login requires a biometric approval.

To really control what an agent can do, you can also run it inside a container on your machine, or better yet a separate host outside your network if you have the resources. This cleanly separates the agent's capabilities from your own, which is ideal.

### Be judicious with agent access to production third-party services

An API key on your dev machine is convenient for testing an integration, but it is often unnecessary to keep around and only increases the attack surface. Minimize how many keys are present and how much each can do. Use a dedicated test account or, if the service offers one, a sandbox key, so there's a ceiling on the damage the agent (or you) can do.

Better still, once you've tested the live integration, write a mock client and make it the default in tests and development. In my stack every third-party integration has one so a dev environment needs no sensitive keys at all. For integrations with inbound webhooks, go a step further and build a small dev-only UI that fakes activity on the third party's side, so you can exercise all product flows without a real account. This is also what made it safe to hand dev environments to [non-engineers](./2026-09-23-Redistributed-Ownership): they can't leak a key that isn't there. Mocks and test helpers are cheap to generate now, so there's not much reason to skip them.

## Code the agent writes

### Build security into the platform

Say you have an endpoint that under no circumstances should be reachable by anyone outside the company. You could:

1. Add a check inside the handler.
2. Add middleware next to where the handler is registered.
3. Add a tag to the API specification, and have a global middleware enforce every tag.

Each is better than the last, because each moves the rule further from the code an agent is most likely to write incorrectly, and closer to a place where it's enforced consistently for everything. The more transparent the behavior is, the easier it is to review and audit and catch mistakes.

### Have platform security fail loudly

For security measures especially (and as a general rule), it's important to have the system error if anything is unexpected or out of place. In the previous example, a typo in the tag could make it look to the casual reviewer like the route is secure when it actually isn't. To prevent that from happening, there needs to be some check. The middleware which enforces tags can return an error if there's an unrecognized tag, or a static analysis test which runs on all code changes can prevent PR merges for any unrecognized tag.

### Maintain a threat model

Early in a product's life, ideally before launch, write a threat model document and store it in or close to the codebase. Take an honest inventory of everything you have, inside and outside the codebase, hand it to an agent, and have it draft the document. Then read the draft _thoroughly_, fix what's wrong or missing, close the large and easy gaps as you go, and share it. Mine live in the repo next to the security tests: [the starter version](https://github.com/sderickson/saflib/blob/main/base/security/threat-model.md) ships with my framework, and each product replaces it with its own.

The document is only useful if it stays current, and the way to keep it current is to make checking it part of the process rather than a separate exercise; as such my [project spec workflow](https://docs.saf-demo.online/processes/docs/workflows/spec-project.html) now includes a **Security Model Updates** section in every spec so updates are considered and proposed automatically. Most features don't change the model, but the updates that do happen help keep product security top of mind and guide investments.

### Elevate review of sensitive files

Some files deserve a human's full attention every time they change, no matter how large the PR they arrive in. These are files that have the potential to break security measures if changed incorrectly:

- Infra files like `docker-compose` and `Caddyfile`
- Dependency lists like package.json files
- Configurations like CSP allowlists or (non-secret-bearing) checked-in env variables
- Bootstrapping logic such as what starts your web server

Within a larger team, [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) files or something similar will automatically flag changes to sensitive files for review by the appropriate people. These tools are actually now also appropriate for solo or small-team projects, to make sure maintainers notice changes to these files made by agents in larger commits and PRs.

## Agents attacking you

### Make updating versions manageable

Automate opening and merging dependency update PRs, especially the ones that address security advisories, so that staying current is (mostly) quick and painless. Use services like [Dependabot](https://docs.github.com/en/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically/about-dependabot-alerts) or [Renovate](https://docs.renovatebot.com/) to open these PRs automatically.

Part of making updates easy is keeping the dependency count down. Review your dependencies periodically and ask whether each is still necessary. If a dependency is large and you use a small slice of it, consider replacing it with your own implementation. And of course look twice at every package an agent suggests installing, since each one is a potential attack surface.

### Treat everything an agent reads as input

Everything an agent reads is a potential instruction. A dependency's README, a GitHub issue it's been asked to triage, a bug report with a stack trace pasted in, an MCP tool's response, a web page it fetched for documentation. If any of that came from outside your organization, then an outsider can use that to try and trick your agent into doing something it shouldn't.

To start, when an agent will automatically handle content from outside, give them the least access and information you can. An agent that triages issues submitted by the public automatically might only have the power to read, tag, and close them. For an agent to actually have the resources to investigate or create a PR, there needs to be some mechanism (I'd suggest human review) to ensure nefarious submissions don't get to them.

### Limit exposure

Consider what information you really _need_ to collect about your users, and how many places it needs to live, because every location where every bit you collect needs to be protected. Do you need to send all of it to your analytics vendor? Does it need to be retained after it's processed? Which scopes do you need when a user sets up an integration? Don't gather, propagate, or collect data or privileges until it's been determined necessary and the threat model has been updated to account for it. Knowing and managing where your customers' data lives is more important than ever.

If you can, never put user-submitted strings into logs of any kind. If there's a JSON schema validation error, log the error but not the input that triggered it. Log the user's id, not their name or email. Doing so serves a double purpose: it limits the amount and ways sensitive information can be exfiltrated, and keeps logs safe for agents to consume when debugging so you don't even have to worry about it.

## What changed

Most of security didn't change. The important things still matter: use MFA on every service, scan for secrets added to code, adopt security HTTP headers, keep audit logs, do security training, keep credentials short-lived, and the rest of the tried-and-true best practices remain useful and important. The items above are the ones agents changed more fundamentally: either because your own agent now has access you need to bound, because the code in your product was written by something that doesn't notice when a tag does nothing or a port is public, because the thing probing your perimeter is now tireless and cheap, or because that thing can now try talking to your tools instead of breaking them. Even if you're early, write the threat model. And be very deliberate about what capabilities you hand to agents inside your systems, because as OpenAI just demonstrated, they will use them.
