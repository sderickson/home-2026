# Planning and Execution

_April 4, 2025_

[Last time](./2025-03-27-Doc-Driven-AI.md) I talked about one of the key things I do differently when doing a given task with AI (I use, generate, and update docs for that kind of task). This time I want to talk about how I do a series of tasks that ladder up to a feature, how to work with AI at the next highest level.

For each feature now, I do a pretty consistent and industry-standard process:

1. Generate a spec. Template [here](https://github.com/sderickson/saflib/blob/main/processes/feature-spec-template.md).
2. Generate a checklist based on the spec. Guide [here](https://github.com/sderickson/saflib/blob/main/processes/checklist-generation.md).
3. Do one task at a time in the checklist, with unit/integration tests
4. Add e2e tests and any other cross-cutting work
5. Squash into one commit in a PR with thorough commentary

Some examples below. "Lib PRs" have the business logic additions, while "Demo PRs" use/test/demonstrate them.

| Feature | Spec | Checklist | Demo PR | Lib PR |
|---------|------|-----------|---------|--------|
| Email Verification | [Spec](https://github.com/sderickson/saf-2025/blob/main/notes/2025-04-02-add-verify-email/spec.md) | [Checklist](https://github.com/sderickson/saf-2025/blob/main/notes/2025-04-02-add-verify-email/checklist.md) | [Demo PR](https://github.com/sderickson/saf-2025/pull/25) | [Lib PR](https://github.com/sderickson/saflib/pull/6) |
| Password Reset | [Spec](https://github.com/sderickson/saf-2025/blob/main/notes/2025-03-31-add-forgot-email-flow/spec.md) | [Checklist](https://github.com/sderickson/saf-2025/blob/main/notes/2025-03-31-add-forgot-email-flow/checklist.md) | [Demo PR](https://github.com/sderickson/saf-2025/pull/24) | [Lib PR](https://github.com/sderickson/saflib/pull/5) |
| Auth Scopes | [Spec](https://github.com/sderickson/saf-2025/blob/main/notes/2025-03-28-auth-scopes/spec.md) | [Checklist](https://github.com/sderickson/saf-2025/blob/main/notes/2025-03-28-auth-scopes/checklist.md) | [Demo PR](https://github.com/sderickson/saf-2025/pull/22) | [Lib PR](https://github.com/sderickson/saflib/pull/3) |

Each feature takes [about a day](https://github.com/sderickson/saflib/commits/81dfe5d1c88af3c4f65b24724e030eacb17f076d/), if the feature is scoped well, and I spend a normal amount of time in tandem investing in the framework and documentation. I don't bother with the spec & checklist if the work I'm doing is exploratory, refactoring, or structural; just for things like adding a bit of UI, adding or updating an endpoint or two to serve that UI, and updating the database and/or 3rd party integration to serve those endpoints. Basic product work. Once the framework matures and I'm spending less time on it, I suspect I can knock out two features a day.

## Why bother ever?

Arguably, creating lists and specs is busywork. It certainly can be if the work is more creative or exploratory where what you end up doing is mostly improvisational; I only use the checklist/spec when I think I'll benefit. And it provides a variety of benefits:

* **Get aligned up-front**. When I give the agent a three-or-four sentence prompt and ask them to generate a complete spec from that, they make assumptions that are revealing and I can correct (or adopt) ahead of time. I can fix those before I get into the thick of things, and the agent will tend to not go off the rails as much.
* **Provide context to each agent**. I usually use at least a half-dozen agents to build a feature (per [Cursor](https://www.cursor.com/)'s recommendation to start a new chat for better results), and being able to start with "here's the checklist" and "here's the spec" gets new agents up to speed quickly.
* **Ready-made prompts**. As well as linking the docs, I'll tend to grab three or four lines of the checklist and give them to a fresh agent to do. Then I can stay in execution mode to just grab whatever's next. I do find pasting the actual lines seems to be better than just telling them "do whatever's next"; I suspect the agent (or Cursor?) weights what you tell them directly over what's in any file that you provide as context, or at least that's how it seems.
* **Consistent execution (by the agent)**. The agent will make the same kind of mistake repeatedly, such as building something the wrong way, creating a feature when it already exists, or forgetting to run tests. So the checklist can include things like the documentation to use, the file to update, and the command to run tests, and I don't have to remember to tell them each time.
* **Consistent execution (by me)**. What I include in each prompts evolves as I try new things, and so it's easy to forget what to include in my current iteration. There are also some things which I just don't have the agent do, and so it's a reminder to myself to do them.

There's actually just one thing above that I'm not sure about: how much the spec really helps the agent during execution. I haven't actually seen any compelling evidence that it makes a difference. To be sure of that I'll need some analysis and testing, or at least purposefully skip providing it. That'll be a good future experiment to try with an AI eval.

Otherwise, it's hard to imagine it being better to go without these two documents, at least for routine work. It just makes each feature easier to do if I have a high-level plan and a detailed checklist as I go through. And it frees me to spend more time thinking about things like how to improve the framework and best practices for the codebase, such as [the appropriate scope of API tests](https://github.com/sderickson/saflib/pull/6/files#diff-4f4eb19fb01e045d35bfb22f2531f8206afbda7af28dcced248aba058a46e80e). I don't plan *those* things, I do them opportunistically driven by feature work and what's bothering me the most at the time.

So they're good! But they could be better.

## Friction Areas

For one, checklists could be faster and more consistent to make. It's a negotiation to get Claude to make them consistently in the format I want. And it's a one-step-forward, two-steps-back experience sometimes where I'll ask them to update the checklist, only for them to strip out a bunch of stuff at the same time.

It probably doesn't make sense to generate the checklist, anyway; I could use an *actual* programmatic tool for creating, updating, and following task lists. Perhaps I can define a TypeScript interface or JSON schema (or a typed JSON schema?) which the agent has to stick to during planning, and/or a tool which the agent uses to get the next task during execution. Then it *has* to include things like tests in the checklist, and it *has* to run them before moving on.

It's important not to be too presecriptive, either. The agent has sometimes provided too-detailed specs and checklists, in terms of what files to write and what should go in them, and then when the executing agent gets there it gets confused, but tries to follow the guidance blindly anyway, sometimes making code that just doesn't get used. Better to provide general guidance and hints (add "interface" to "/saflib/package/") than specific instructions (add "function" to "path/to/file.ts"). Point to an area and the executing agent should be able to figure out the specifics, and better to anchor on interfaces than implementation details.

## Areas of Opportunity

I could build the tool I described above, but it would be a bit of an upfront cost and I'd rather nail down the process more first. But there are other things I can try more easily:

* **Different models for different roles**. It's been a while since I've tried new models, and it may be that some are better for planning and some are better for execution.
* **Better system prompts**. There are a handful of things I'd like models to do differently. For example, if something is unclear, doesn't make sense, or just doesn't match reality, they should speak up. And they don't have to comment every third line. And they should verify my words as much as I do theirs. This and perhaps some of the things I mentioned above, like actually running tests, could be part of a system prompt, say, in a Cursor rule.

Though I will continue to improve the spec/checklist part of the process iteratively, this is not currently my main focus, because it's not really the best use of time. I want to focus on something more basic: getting tasks to happen correctly more reliably. More on that later.

Thanks for reading!
