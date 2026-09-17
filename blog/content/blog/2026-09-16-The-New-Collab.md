# Democratization of Ownership

_September 16, 2026_

Imagine being an engineer who is never allowed to see or edit the code. You can only describe what you want to an agent and look at the resulting product. Every tweak, every fix, every “move that two pixels left” goes through an intermediary, and you wait to see whether it came out right. And it can take quite a long time.

That’s the situation product managers, designers, analysts, and everyone else who works alongside engineering has always been in. The intermediary was the engineer. It was necessary because of two axioms: writing code takes a long time, and only engineers can make changes to the codebase. These axioms are now going away, and that changes how cross-functional teams work together.

How engineers work with each other now that coding agents are in the mix is its own topic. Here I want to focus on the people who work directly with engineering to get the thing built.

## The old process

In the classic mode of product development, product managers and designers think through everything ahead of time. They gather rough estimates, produce a thorough spec and a pixel-perfect design, get sign-off, and hand it to engineering. Engineering builds to the spec. As blockers and edge cases come up, the spec is updated. Once the product is ostensibly built, product, design, and QA use it for the first time and send back a list of fixes. Then it launches.

All that up-front articulation existed because the build was a larger investment and the people paying for it wanted to know what they were getting before they committed. It was also the only lever non-engineers had. If you couldn’t touch the code, the spec and iterative feedback was how you steered.

## The new process

With agentic coding, the collaboration I’ve been experiencing looks more like this:

- **Estimates are cheap.** Agents do the bulk of the estimation work. Engineers still sign off and own these estimates.
- **Specs and designs are rougher.** Only the critical aspects of the project are laid out. Nothing needs to be pixel-perfect or specified to every detail.
- **The engineer builds the first draft.** They follow the spec closely where it’s specific, since those were the details important enough to specify, and defer to the agent on everything else. Their attention goes toward making sure the thing is built well.
- **Partners take it from there.** Once the feature, data model, and API exist, the PM or designer runs the dev environment and makes their own changes with an agent. Most of what’s left is front-end tweaks and choices the agent made that they’d like to revisit.
- **Engineering reviews and merges.** PRs from PMs and designers get reworked as needed and merged into the codebase.

The payoff is that nobody has to hold the whole vision in their head and transfer it losslessly to someone else in an expensive game of telephone. Partners decide what they want by using an early build rather than by imagining it. Engineers aren’t the bottleneck for layout, copy, color, or even the composition of a page. And when a change is small, a PR is a more precise way to communicate it than a conversation about a PR. Let the partner get it looking and behaving how they want, and let the engineer make sure that look and behavior is reliable, performant, and maintainable.

## How it has gone so far

I’ve worked this way with a couple of PMs, both wearing the designer hat as well on a small team, and it's served us well. The changes they made were small, because I’d gotten the product most of the way there, and that’s the point: the small changes are exactly the ones where an engineer in the middle adds the least and the communication overhead can overwhelm the value. Their PRs told me precisely what they wanted in a way a Slack thread never quite does.

It was particularly exciting when a small front-end-only feature one of the PMs had added on their own was helpful in the middle of an incident. Nobody had scheduled it, nobody had estimated it, and it was there when it mattered because a customer had asked for it and the PM had been able to just make it happen.

I don’t want to oversell this. It’s a couple of people, on one team, making small changes to a product that was already in good shape. But it worked, and it's pretty promising.

## Beyond PMs and designers

I think the same shift applies to a good number of other partners. Analysts adding product events, QA fixing the bugs they find, copy editors fixing text. These changes are small enough that the cost of getting an engineer's time and describing the change to them is greater than the cost of just making them and having an engineer review the result. The mode of communication becomes the PR.

## What has to be true

This only works if a few things are in place.

**The codebase has to be ready for it.** Someone with no engineering background handing prompts to an agent inside your codebase is a stress test for everything I wrote about in [my last post](./2026-09-15-Agentic-Stacks). If the stack isn’t opinionated, if the patterns aren’t enforced, if the agent can wander, then things get messy quickly. An agentic stack constrains the agent regardless of who is driving it, and that is what makes non-engineer PRs cost-effective to review and safe to accept. It also means the dev environment has to be one-command to start, with every integration mocked so no sensitive keys are needed.

**Engineers have to be willing to review, not just build.** “Rework PRs from PMs and designers before merging” describes a job some engineers will hear as cleaning up after everyone else. The review load is real, and it lands on the same people already struggling to keep a large agent-built codebase in their heads. I think the honest answer is that the engineer’s role shifts toward the platform and the review, which can only work if there's a commensurate investment in those areas so engineers can be set up for success and not drowning in debt and risk.

**Everyone has to want to try.** Partners need to be willing to dabble with agents and PRs. Engineers need to be willing to accept changes from people who don’t write code for a living. Leadership needs to give both the room to figure it out. Not everyone will want to. Some partners are genuinely uncomfortable making direct changes to a codebase, even when the engineer in the middle is doing little more than passing their words along to an agent. That’s a normal reaction to a change in how work gets done, and it’s a reason to start with the people who are curious rather than starting with the ones who aren’t.

If you want to try this, start by increasing the odds of having those ingredients. Invest in the codebase and the shared agentic tooling so that "vibe-coded" changes come out reasonable. Find the people who are curious. Fund and provision dev environments for them. Expect some trial and error. It’s a process to overhaul a process.

## Ownership

What I’m really proposing is that every function gets the kind of direct access to their piece of the product that engineers have historically _had_ to own. That includes engineers themselves, which is why I spent the last post on tooling that gives engineers hard facts about what agents are doing in their codebase. Direct access is what lets you own something. Going through an intermediary for every change, whether that intermediary is an engineer or an agent you can’t look behind, is what keeps you from owning it.

We now have the ability for each function to build, tune, and own their own piece of the product, as long as they’re set up for success. That’s a democratization of ownership, and it can make building software a lot more collaborative than it has been.
