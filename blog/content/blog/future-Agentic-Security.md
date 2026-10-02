# Agentic Security

_tbd_

In July, OpenAI's internal evaluation agents broke out of their sandbox, harvested credentials, and compromised parts of Hugging Face's production infrastructure. Hugging Face logged more than 17,000 attacker actions before closing the holes ([their writeup](https://github.com/huggingface/blog/blob/main/security-incident-july-2026.md), [OpenAI's](https://openai.com/index/hugging-face-incident-and-the-road-ahead/)). In September, [Reuters reported](https://www.reuters.com/legal/litigation/openais-rogue-agents-probed-hugging-face-weaknesses-two-months-before-major-hack-2026-09-16/) that the same agents had hijacked two Hugging Face accounts and been quietly probing since May.

This story and others that have been coming out have brought security in the era of agentic development into focus. There are three novel problems software maintainers now need to grapple with:

1. Agents ostensibly under your control can take unintended and undesirable actions, either on their own or because someone tricked them.
2. In order to be secure, systems you own need to be able to withstand an agentic swarm attack, not just script kiddies or human hackers.
3. The increased volume of code changes provided by coding agents makes it easier to introduce vulnerabilities.

Taken together, building secure applications and services requires an updated approach. Having spent some time considering how to develop agentic products safely, here are the things I do now for every project going forward, to meet the raised bar.

## Your own coding agent

### Don't let agents push to prod, or take other privileged actions

At minimum, there should be a wall between the agent and any production deployment or resources. With CI/CD often automatically deploying a merge to main, that means no credential on the machine the agent runs on should allow the agent to independently either push code directly to main, or access production hosts and storage. There are multiple ways to do this:

- Add branch protection to your repository, requiring a PR for every merge to main, and making sure the agent's identity can't approve or merge one.
- Require approval for any production access or pushes to a repository. For example, I use the [1Password SSH agent](https://developer.1password.com/docs/ssh/) configured so that every push and ssh login requires a biometric approval.
- Never give the agent access to production database credentials.

To really control what an agent can do, you can also run it inside a container on your machine, or better yet a separate host outside your network if you have the resources. This cleanly separates the agent's capabilities from your own, which is ideal.

### Be judicious with agent access to production third-party services

An API key on your dev machine is convenient for testing a new integration, but it is often unnecessary to keep around and adds risk. Minimize how many keys are present where the agent works. Use a dedicated test account or, if the service offers one, a sandbox key, so there's a ceiling on the damage the agent (or you or anyone working on the codebase) can do.

Better still, once you've tested the live integration, write a mock client and make it the default in tests and development. In my stack every third-party integration has one so a dev environment needs no sensitive keys at all. For integrations with inbound webhooks, go a step further and build a small dev-only UI that fakes activity on the third party's side, so you can exercise all product flows without integrating and using a live service. This is also what makes it safe to provide dev environments to [non-engineers](./2026-09-23-Redistributed-Ownership): they can't leak a key that isn't there. Mocks and test helpers are cheap to generate now, so make them a habit and expectation.

## Code the agent writes

### Build security into the platform

Say you have an endpoint that under no circumstances should be reachable by anyone outside the company. You could:

1. Add a check inside the handler code.
2. Add middleware in front of where the handler is registered.
3. Add a tag to the API specification, and have a global middleware enforce access.

Each is better than the last, because each moves the rule further from the code an agent is most likely to write incorrectly, and closer to a place where it's enforced consistently for everything. It's also more transparent; the easier it is to review and audit the easier it is to catch mistakes.

### Have platform security fail loudly

For security measures especially (and as a general rule), it's important to have the system error if anything is unexpected or out of place. In the previous example, a typo in the tag could make it look to the casual reviewer like the route is secure when it actually isn't. To prevent that from happening, there needs to be some check. The middleware which enforces tags can return an error if there's an unrecognized tag, or a static analysis test which runs on all code changes can prevent PR merges for any unrecognized tag. This is just one example; look for opportunities like this to add checks which increase confidence in security measures.

### Maintain a threat model

Early in a product's life, ideally before launch, write a threat model document and store it in or close to the codebase. Take an honest inventory of everything you have, inside and outside the codebase, hand it to an agent, and have it draft the document. Then read the draft _thoroughly_, fix what's wrong or missing, close the large and easy gaps as you go, and share it. Mine live in the repo next to the security tests: [the starter version](https://github.com/sderickson/saflib/blob/main/base/security/threat-model.md) ships with my framework, and each product replaces it with its own.

The document is only useful if it stays current, and the way to keep it current is to make checking it part of the process rather than a separate exercise; as such my [project spec workflow](https://docs.saf-demo.online/processes/docs/workflows/spec-project.html) now includes a **Security Model Updates** section in every spec so updates are considered and proposed automatically. Most features don't change the model, but the updates that do happen help keep product security top of mind and guide investments.

### Elevate review of sensitive files

Some files deserve a human's full attention every time they change, no matter how large the PR they arrive in. I've personally seen it happen a couple of times where an agent updated a docker-compose file which would have led to a major security issue if I hadn't caught it. Make sure humans review all changes to files that have the potential to break security measures if changed incorrectly, such as:

- Infra-as-code files which specify what resources there are and what they can do
- Dependency lists and lock files
- Configurations like CSP allowlists or (non-secret-bearing) checked-in env files
- Bootstrapping logic such as how the web server starts

Within a larger team, [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) files or something similar will automatically flag changes to sensitive files for review by the appropriate people, and can be configured to be required. These tools now make sense for solo or small-team projects too, to make sure maintainers notice changes to these files made by agents in larger commits and PRs. Structure your files and platforms to isolate and declare security-critical components so they can be reviewed separately from the rest of the codebase.

## Agents attacking you

### Make updating versions manageable

Automate opening dependency update PRs, especially the ones that address security advisories, so that staying current is (mostly) quick and painless. Use services like [Dependabot](https://docs.github.com/en/code-security/tutorials/secure-your-dependencies/dependabot-quickstart) or [Renovate](https://docs.renovatebot.com/) to open these PRs automatically and build a robust CI test suite so changes can be reviewed and merged in quickly and safely.

Part of making updates easy is keeping the dependency count down. Review your dependencies periodically and ask whether each is still necessary. If a dependency is large and you use a small slice of it, consider replacing it with your own implementation. And of course look twice at every package an agent suggests installing, since each one is a potential attack surface.

### Treat everything an agent reads as input

Everything an agent reads is a potential instruction. A dependency's README, a GitHub issue, an MCP server response, documentation from a website, really anything that comes from outside your organization can be a path for an outsider to try and trick your agent into doing something it shouldn't. This makes building powerful, flexible tools fraught with risk.

As a starting measure, when an agent will automatically handle content from outside, give them the least access and information you can. An agent that triages issues submitted by the public automatically could be effective given only the power to read, tag, and close them. For an agent to actually be given the resources to investigate or create a PR, such as read access to the codebase or production logs, there needs to be some mechanism (I'd suggest human review) to ensure nefarious submissions don't get to those more powerful agents. And much like the threat model maintained for securing the product, it's also useful to keep track of what agents there are, what systems they have access to, and how you're protecting them.

### Limit data collection

Consider what information you really _need_ to collect about your users, and how many places it needs to live, because every bit you collect, everywhere it lives, needs to be protected. Do you need to send all of it to your analytics vendor? Does it need to be retained after it's processed? Which scopes do you need when a user sets up an integration? Don't gather, propagate, or store data or privileges until it's been determined necessary and the threat model has been updated to account for it. Knowing and managing where your customers' data lives is more important than ever.

If you can, never put user-submitted strings into logs of any kind. If there's a JSON schema validation error, log the error but not the input that triggered it. Log the user's id, not their name or email. Doing so serves a double purpose: it limits how much sensitive information can leak and how, and keeps logs safe for agents to consume when debugging so you don't even have to worry about it.

## An evolving security model

Regardless of the changes brought by coding agents, the fundamentals of security haven't changed. I've been focused on addressing what _has_ changed, but everything that was important before is still important (if not more so) now. Use MFA on every service login, scan for secrets added to code, adopt security HTTP headers, keep audit logs, do security training, keep credentials short-lived... these are some of the many tried-and-true security measures that help protect against longstanding threats.

But there are new threats that come along with all the new opportunities brought by agents, in software development, in internal workflows, and in products brought to market. As an industry we're still figuring out how to manage the various risks they bring. As we go about grappling with this new reality, the most important thing is to be aware of and on the lookout for new threats, by having a security mindset throughout your work as an engineer.
