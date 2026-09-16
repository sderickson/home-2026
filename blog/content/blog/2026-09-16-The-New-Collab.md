# The New Collab

_September 16, 2026_

One of the things that I enjoy most about work is the collaboration. The sort of work I want to do is solving problems that no single person can solve, where you need multiple perspectives and skillsets involved and they all need to be on point in order to succeed as a group. Whenever I’m on a team like this I know it’s temporary and I try to enjoy it while it lasts, since the only constant is change!

So, with the advent of LLMs in all aspects of business, one of the things I’m most keenly interested in is how this changes the nature of our collaborations, especially across functions. Of course how engineers work together with coding agents thrown in the mix is its own whole topic, but for now I want to focus on where non-coding needs are involved: the PMs, designers, analysts, leadership, and everyone else who work directly with engineering to get the thing built.

Here’s how I imagine various collaboration roles changing over time.

# Engineer / PM / Designer

The big trifecta! PMs and designers are the most common participants in an engineering standup because they are typically the closest collaborators with engineering.

## The Old Process

In the classic mode of product development, collaboration would look something like this:

- Product managers explore what sorts of projects the team might do, gathering rough estimates from engineers to get rough ROIs.
- Once projects are green-lit, product managers and designers build a spec and a design. These (ideally) have light engineering input, to continue providing cost and feasibility guidance.
- A thorough spec and a pixel-perfect design are produced, reviewed, signed-off, and handed to engineering. They go about building the product according to the spec and design.
- As things come up (they invariably do), the design or spec are updated based on blockers or unforeseen edge cases.
- Once the product is ostensibly built, product and design (as well as QA) use it for the first time and give fixes and changes for engineering to do.
- Finally, the product is launched!

This process was designed on two no-longer-so-true axioms: 1. writing the code takes a long time, and 2. only engineers can affect change on the codebase. Designers and PMs had to think through and articulate everything ahead of time because the project was a large investment and it was desirable to know roughly how much of an investment it was and what you were getting for that investment ahead of time.

## The New Process

With agentic coding available now, the collaboration I expect will look more like this:

- Estimations made for projects can take a great deal less time, letting agents do the bulk of the work. Engineers should still sign off on them, though.
- Once the high-level project is approved, product specs and designs are provided but can be rougher. They don’t need to be pixel-perfect or specified to every detail. Only the critical aspects of the project are laid out.
- The engineer creates the product according to the spec, deferring to the agent to fill in any details, and focusing on making sure what _is_ specified in the spec is adhered to since those were the details important enough to be specified, as well as making sure it is built well.
- Once the first draft of the product is built, the PM and designer can run the development server locally and vibe-code their changes. Since the underlying feature, data model, API, etc have been built, the remaining work should be mostly front-end tweaks. They can also decide if any of the decisions the agent made should be changed.
- Engineering takes PRs provided by PMs and designers and reworks them as needed before merging them into the codebase.

A collaboration like this has the following benefits:

- PMs and designers don’t have to fill in the details in their head. They can work directly with an early build to see the details and one of the options first hand, and decide what they prefer through experience.
- PMs and designers don’t have to transfer an entire vision to an engineer, and the engineer doesn’t have to understand and transform that entire vision to code. By leaning on agents to fill in the decisions, engineers are also not left with additional responsibilities of having to make the decisions themselves or hunt down the decision-maker to make a decision.
- Engineers are not the bottleneck for simple changes to the codebase. Making tweaks to the layout or color or copy or even larger things like the composition of pages or overall user experience can be done handily by agents, and it’s simpler to fix issues made by vibe coding small changes than it is to play a game of telephone between the cross-functional partner and the code. Let the partners get it to look and behave they want, and have the engineer focus on making sure that look and behavior is reliable, performant, and maintainable.

# Other Cross-Functional Partners

I’m focused on PM/design here, but I think collaborations with a good number of other cross-functional partners will take a similar shift. Analysts submitting PRs to add product events, QA submitting PRs to fix bugs, and copy editors submitting PRs to fix text. These are small enough changes that the cost of communicating the change to an engineer and having them do it is greater than the cost of just making the change and having the engineer manage incorporating the change into the codebase. The mode of communication of what needs to be changed becomes a PR, which is more precise.

# Required Ingredients

This new mode of collaboration requires a few things to succeed, however:

- Codebase and infrastructure support. An agent in non-engineering hands needs to do a reasonably good job, spinning up the dev environment with an agent needs to be reasonably accessible to a non-technical user, and the dev environment needs to have all integrations mocked so no sensitive keys are required to develop. What this looks like is a codebase with an agentic stack running on something like GitHub codespaces, made available to any non-technical contributor.
- Support from all parties involved. Partners need to be willing to dabble in using agents and making PRs, engineers need to be willing to accept changes made from non-technical partners, and leadership need to give both the space and time to explore, figure out, and assess the new possibilities for collaboration.

For those looking to explore new modes of working, I would look for and try to increase the odds of having these essential ingredients. Invest in the codebase and shared agentic tooling so that agentic changes are reasonable. Look for people who are curious and want to try out new technologies. Fund and give dev environment access to the folks who are willing to try. Know that it will probably require some trial and error and see what learnings can be gathered. It’s a process to overhaul a process.

# Democratization of Ownership

One final thought: what I’m proposing here is to enable the sort of experience for cross-functional partners that I think needs to also be kept for engineers themselves, and that is the ability to affect more _direct_ control on their field of responsibility. As I lay out in my previous post, I think engineers need direct information into how a codebase is structured and works, what changes are being affected by agents, and just hard facts to dig into and manage. Having to go _through_ an engineer for every possible change and tweak to the codebase is like being an engineer who can only make changes through an agent and is not allowed to view or edit code themselves, just the resulting product. We now have the ability for each function, through developer environments, to build, tune, and own their own piece of the product, as long as they are set up for success. It’s a democratization of ownership, and can make creating software a more collaborative process.
