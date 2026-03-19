# Doc-Driven AI

_March 27, 2025_

I expect code quality to become more important than ever when building and maintaining code with AI. Linters, tests, and modularity are key to efficient and well ~~written~~ generated code, but today I want to dive into **documentation**, which I haven't seen talked about as much.

Here's my hypothesis:

> In order to get to the next level of productivity with agentic coding, it's **necessary** to write and maintain a corpus of documentation that is accessible both to the agent and the human developer.

I think it's a bottleneck because in the (admittedly short) time I've spent working with agents, I've had to explain solutions for the same problems repeatedly. Agents spin on mocking libraries for Vue component testing, implement with patterns and interfaces and schemas inconsistent with existing implementations, and just generally build things in a not-ideal way which will come back to haunt me later, like:

* Mocking a layer of the code in tests so close to the target that it's not really testing much of anything, providing a false sense of security.
* Leaking implementation details across library boundaries, breaking separation of concerns and making it harder to change things down the line.
* Installing multiple versions of the same package, or multiple packages that serve the same need, reducing efficiency and setting the stage for weird bugs

These are the sorts of things developers and managers worry about when they see vibe coding trending. People get a high when things just magically work to begin with, but from experience we know it won't be long before there are major headaches to deal with.

For myself, I want to get to the point where most of the time when I give the agent a well-defined task (add a table to the db, add a new property to an endpoint endpoint, refactor this frontend piece), it will do it well **without any additional guidance**. If I can get it to do that, say, ~90% of the time, then I would spend less time reviewing every line of generated code, and instead focus on broader and harder-to-fix concerns like interface design, database schemas, system architecture, and what E2E tests I want. Some bugs will sneak in, but if the success rate is high enough then deep human review will glean diminishing returns.

I hope documentation can get us there, so let me share my approach.

## Overview

I have three elements to offer which should help make documentation a sustainable habit, by minimizing cost and maximizing benefit to you:

1. **Structuring Docs**: When writing documentation, it's a buzzkill if you don't even know where to put it to begin with, how to frame it, or what to include. That blank page can be rough, and there will be many to fill. I have some general ideas that you can apply when deciding what even to write and how much.
2. **Creating Docs**: This is actually the easiest part; you can generate and update documentation as a byproduct of your work. If you can incorporate automated testing into your standard practice, you can also incorporate documentation-driven development. Both are easier than ever with agents.
3. **Consuming Docs**: This is where things get tricky again. In a perfect world, the agent would know what documentation to use for every scenario, but I at least haven't figured out how to do that yet. Still, you can get some immediate benefits to your workflow by just linking to the docs you have as you create them, focusing on the tasks you do most often.

## Library and Document Structure

You're going to be making plenty of documentation, so how to keep track of it all? How do you break it down into right-size pieces? Well, here's my package-based structure:

```
# Root directory structure
/
├── clients/                
│   ├── spa1/               
│   ├── spa2/
│   └── ...
├── services/               
│   ├── service1/
│   ├── service2/
│   └── ...
├── (other-product-folders)/
│   └── ...
└── saflib/
    ├── shared-library/
    │   ├── package.json
    │   ├── src/
    │   └── docs/
    │       ├── doc1.md
    │       ├── doc2.md
    │       └── ...
    └── group-of-shared-dependencies/
    │   ├── package.json
    │   └── docs/
    └── ...
```

For context, "SAF" is my app framework, and there are these repos:

* [saflib](https://github.com/sderickson/saflib) - shared libraries and documentation
* [saf-template](https://github.com/sderickson/saf-template) - template repo for new SAF projects
* [saf-2025](https://github.com/sderickson/saf-2025) - a demo site, and also the first place I test new SAF functionality

Each SAF project clones the `saflib` directory as a git submodule; both `saf-2025` and `saf-template` do that. By colocating shared code and docs, I can rest assured anything I write can be used across all my projects.

For example, the `drizzle-sqlite3` package encapsulates everything important around SQLite in my projects:

* [runtime dependencies](https://github.com/sderickson/saflib/blob/main/drizzle-sqlite3/package.json) (dev deps are in [`drizzle-sqlite3-dev`](https://github.com/sderickson/saflib/blob/main/drizzle-sqlite3-dev/package.json))
* [helper methods](https://github.com/sderickson/saflib/tree/main/drizzle-sqlite3/src), and of course
* [documentation](https://github.com/sderickson/saflib/tree/main/drizzle-sqlite3/docs)

I'm pretty pleased with this structure; it's usually clear where something needs to go. I'm already grouped dependencies and implementations by package, so it's natural to extend that grouping to documentation.

### Adopting a Documentation Structure

For your own codebases, I recommend grouping your docs similarly. If your codebase is disorganized (whose business critical codebase isn't?) then you might identify an existing under-utilized common space, or just create one, and start filling that out and pulling non-doc files in as you go. These packages that house documentation by theme don't *have* to have anything else in them (like my [`processes` "package"](https://github.com/sderickson/saflib/tree/main/processes) which has no code nor dependencies... for now).

At *least* store your docs in the repo so the agent can more easily find and edit them. You can probably give the agent a doc tool for some remote resource, and I haven't tried that yet, but that seems like unnecessary complexity given the agent has to edit as well as read them. But you do you.

### Document Right-sizing

Make your documents task-sized. If you'd tell your agent to "set up a stub route" then have a doc for [writing a route](https://github.com/sderickson/saflib/blob/main/node-express/docs/adding-routes.md) that always returns 200. If you tell an agent to "test this vue component" then have a doc for [testing components](https://github.com/sderickson/saflib/blob/main/vue-spa-dev/docs/component-testing.md). If you want the agent to create a new TS library, have a doc for [setting one up](https://github.com/sderickson/saflib/blob/main/monorepo/docs/ts-packages.md). This way your prompt can be pretty concise: a well-defined ask, the name of the file to edit or add, and the doc.

If a document starts to get too big, that probably means your task is getting too complex, and it needs to be broken down into smaller tasks, with smaller docs. Or you need better helpers or libraries which manage the complexity better.

That's just you engineering.

## Generating Documentation

I say "generating" documentation because I want to be clear you won't be writing it; the agent will. Don't worry about setting aside days or weeks to fill in all your docs, the way to do this is to add doc-writing to your development cycle. It should look like this:

1. Give the agent a task to do, along with any existing relevant docs and a link to the file/folder to create or edit.
2. Go back-and-forth with this one agent to get it right. For best results, try not to fix things yourself, get the agent to do it instead. If you do fix it yourself, explain to the agent what you did to solve the problem and why.
3. Once the code is good enough, tell the agent to write or update a doc based on your back-and-forth

Now all of the time spent coaching the agent goes beyond the one session. I review the docs they write, prompt them to make changes if there are large ones or make the changes myself if they are small (it's more okay to do the fixing yourself with the docs). Then I create a new agent for the next task and the loop starts again. Or, if I *really* want the next iteration to go much better, I'll trash the previous agent's perfectly good work and give the same task to a new agent with the generated docs. Repeat until an agent does everything right (enough) the first try.

In terms of how the documents themselves are written or structured, I let the agent do it how it will. I might suggest some content belongs better in a different doc, but again I'm not spending a bunch of time polishing here. I have a sneaking suspicion the agent is too profligate with its words and examples, but that feels more like an optimization than a dire issue.

### Loop Progression

One thing I've noticed is that when there *is* documentation and the agent does it wrong, **it's usually because the documentation is out of date or wrong**! Luckily, having the agent fix the documentation is just as easy; I usually tell the agent to do it based on our back-and-forth or some existing, more up-to-date code. Using that `drizzle-sqlite3` example from before, I'd started moving away from singletons, but hadn't updated the docs yet, so the agent started off the old way importing the database directly as specified in the doc examples. When it tried to add the database queries to the others, it quickly realized its mistake and refactored. Then I had it update [the doc](https://github.com/sderickson/saflib/pull/3/files#diff-839f134a6266bf815d546e9a26247227ca9fd21cfc4f22fa3adcf669b4916b21L26).

That's another benefit of explicit, accessible documentation: new best practice adoption happens organically over time. If the agent is given a doc with the latest best practices and some code to work with that was made earlier on, it can be prompted to bring that code up-to-date first before implementation. It might even do that of its own accord, which is always nice. At least for things that don't require multi-step migrations, just having docs is enough to see adoption fairly quickly, at least on active areas of the codebase. Even for those things that require multi-step migrations, documentation can help make sure they go in the right direction when they do change in the future. The doc becomes a source of truth so the agent (and the developer!) doesn't have to guess which approach it should take.

One more thing to keep the pace and motivation going: I'm honestly pretty loose about my documentation. Reading over some of the docs now, I see all sorts of things that could be better and accurate, but I'm resisting the urge to clean it all up for this post. Perfect is the enemy of the good and all that, so I'm setting a low bar because I'm more likely to fill out the docs and have a reasonable base to build on and iterate with if I don't aim to have polished output every PR. Once a doc stops getting updates as frequently through this cycle, or you're ready for wider adoption, that's probably a good time to go back and polish it.

## Consuming Documentation

This I'm still trying to figure out. In an ideal world, the agent would just find the docs it should use on its own, but so far I haven't been able to get that to happen. Mostly I've been playing around with [Cursor∂ rules](https://docs.cursor.com/context/rules-for-ai), but that really didn't work. I'd give the agent a system prompt with a list of docs, or a link to a list of docs and ask it to affirm it read the docs, and it very rarely did.

The next thing I tried was to incorporate documentation into checklists. I'd give the agent a template to generate a checklist from, with links to docs throughout the template, and the agent would just strip them out from what it generated. The agent also would tend not to follow checklists without a heavy hand... This is a tangent, so I'll go into process more in my next blog post. Suffice it to say, telling the agent to follow a checklist with "review doc" instructions sprinkled in doesn't work.

At this point, I just provide documentation to the agent manually. I still have the agent create checklists like [this one](https://github.com/sderickson/saf-2025/blob/main/notes/2025-03-28-auth-scopes/checklist.md), but I often have to insert docs into the list myself. And really, those checkboxes are for *my* benefit, so I can copy/paste them into the prompt when we get to that task so the agent is less likely to sidestep my very healthy obsession with docs.

The good news is that when the agent *does* RTFM, the output is markedly closer to what I want. The problems I see all tend to be undocumented, or wrongly documented. I have a ways to go before all the common tasks are written down, but I'm already moving faster. For example, the checklist above was a pretty cross-cutting feature that took less than a day, and much of that was spent adding docs. I estimate without them it would have taken twice that time, and I wouldn't have a bunch of new and refreshed markdown files to show for it.

## Wrapping Up

That's where I'm at right now. I'll close out this post with some questions I imagine you might have.

### What existing tools are out there?

Seems thin. I did a cursory look around and when it comes to documentation and refactoring, the tools I find tend to be fairly low-level (like [docusaurus](https://docusaurus.io/) or [vitepress](https://vitepress.dev/guide/what-is-vitepress)), built for human-only consumption (like [codescene](https://codescene.com/)), or agent-only consumption (such as [codebuddy](https://codebuddy.ca/)). I think for now you have to manage your own high-level documentation yourself, so hopefully this post gives you some ideas in that regard.

I'll keep an eye out, and update this post if I find anything that looks promising. If you find something, [let me know](mailto:sderickson@gmail.com).

### What's next?

Consuming docs is the most under-developed part of my workflow. I'm going to keep giving the agent documentation manually for now, because I'm still tuning and assessing the structure and creation. Once I'm more confident, I might try creating an [MCP](https://github.com/modelcontextprotocol) that generates prompts more automatically and piecemeal so I can just tell the agent to "do the next item the checklist tool gives you" rather than copy and pasting doc and file links, and also auditing every step of the process (did they remember to run the tests?).

Even further down the line, I'd like to set up some sort of [evaluation](https://inspect.aisi.org.uk/), both of the documentation and of the agents that use them. I'm really focused on Cursor agent right now, but it would be great to compare that to, say, Claude Code, Cline, and Windsurf, and analyze how good those tools are at using docs compared to each other. Or how effective a given agent is at making changes based on different docs.

A complementary topic which I've been alluding to is the process for agentic coding for whole features or even roadmaps. I'll write about that in my next post.

### Can I get involved?

I'd like that! Let me know what you think, or give this approach a try and see if it works for you. If you want you can try working with what I have, clone the [SAF template repo](https://github.com/sderickson/saf-template) and try to build with it. Also, watch the [saflib repo](https://github.com/sderickson/saflib) to follow along, and feel free to leave issues or PRs there.

**Thanks for reading!**

