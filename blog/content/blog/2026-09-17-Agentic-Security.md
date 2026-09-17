Security is big in the news lately. Lots of stories of agents going wild and hacking into places, so this seems as good a time as any to go over some basic steps one can take in the era of AI-driven software development. The fact of the matter is the bar of what’s acceptable to deploy has gotten higher because the bar to smatter any given product with attempted infiltration has gotten so much lower. And agents themselves create so much more opportunity to build things in ways that are eminently hackable! What are we to do.

This is my list of things I think every project that takes security seriously should do to do good by the users and businesses that rely on them.

# Don’t Let Agents Push to Prod

Agents have a lot of power over our computer, especially the more we push on the accelerator and give them the freedom to move faster and gain more and more access. At the very least, there should be a wall between your agent and your production deploy. With CI/CD often meaning changes to the main branch automatically getting deployed, you can’t let an agent have direct access to main.

There are a few ways to do this. You can use branch rules to prevent _anyone_ from merging into the main branch without going through a PR (as long as your agent doesn’t also have PR-merge capabilities). Another option is to use a tool like 1Password to host an SSH key which is the only way to push anything from your machine to remote (just make sure you’re not logged into gh on the command line).

# Be Judicious with Agent Access to Third Party Services

It’s very useful to have an API key on your computer when testing out third party integrations. Try to minimize its presence, and how much access it has in development. Use a dedicated test account or, if the service provides it, a sandbox key. This just ensures that there’s a limited amount of things the agent (or you) can do, to minimize damage.

The best thing to do for integrations really is, once you’ve tested the live integration, to implement a mock client. This will run by default in tests and in development, enabling building things without needing sensitive keys. Better yet, if the integration involves things like webhooks, build even a UI that allows you to, in development, mock activity happening on the third party. The more you can enable development without sensitive keys, the better. Making tests and test helpers is cheap.

# Keep a Threat Model, and Update It

At some point early on in product development, ideally leading up to launch, take a look at what you have and write a threat model document. Do an honest assessment of everything you have, both inside and outside the codebase. Give it to an agent and have them write out a threat model for you, taking what you have and whatever it can find in the codebase. Read that document _thoroughly_ and fix anything that’s incorrect or missing. Fix large and easy-to-fill gaps along the way. Share it around.

As part of whatever standard process for making major changes to the codebase, include updates to the security model. This can be as simple as asking an agent to review the PRs of the new feature and recommending changes to the security model if it thinks there’s something warranted. Most features should not require updating, but it’s good to make it a habit to check each time. This helps keep security top of mind.

# Build Verification and Trust Into the Platform

Let’s say you build an endpoint which absolutely under no circumstances should anyone but those employed at the company should have access to, or maybe even a subset of those. There are a few ways you could go about this:

- Add a check somewhere in the implementation of the endpoint handler itself.
- Add middleware or some other mechanism which lives beside where the handler is registered.
- Add a tag to the API specification which a global middleware or config uses to enforce the rule.

Each option is better than the last, but it still can get better! What if the tag you add is “siteadmin” but the tag the global middleware depends on is “site-admin”, so your tag looks like it does something but doesn’t actually. So an additional system should be in place to disallow adding tags which do nothing, or are not listed somewhere is allowed.

And this is just the mechanism for enforcing the rule, there should also be unit, integration, and end-to-end tests which ensure the mechanism continues to work indefinitely.

Make the setup easy to audit, and easy to trust.

# Make Updating Versions Super Easy

As much as possible, automate the process of opening and fixing PRs to update to new versions, especially when they address security issues. Make it as easy as opening the page, reviewing the changes, and merging them in.

Part of making dependency management easy is also keeping the number of them under control. Build in a regular review cycle considering if each of the dependencies being used is actually necessary or they can be removed. If the dependency is large and the features used are small, consider just replacing it with your own implementation. And always take a second look whenever an agent recommends installing any given package; it might not be trustworthy.

# Limit Exposure

Do you really need to gather all this information about your user? Do you really need to send all this information to your product analytics service? Does the data provided need to be retained after it’s been processed? Do you need to ask for all of those scopes from users setting up an integration? Don’t proactively gather, propagate, or store data until it’s been determined necessary, and worth a probable update to the threat model. You owe it to your users to be considerate of their information and copying it to a dozen different places where it’s not really needed is not doing right by them.

# Etc.

There are of course plenty of other best practices, such as a variety of web-specific methods for guarding against bad actors, making sure services have MFA set up, having security trainings and audits within your organization, and a laundry list of other things. The ones above I would say are newly or more important in a world where agents pose new threats as well as new opportunities. Even if you’re early on as a business, a threat model document is useful. Be mindful of what capabilities you are giving agents within your systems.
