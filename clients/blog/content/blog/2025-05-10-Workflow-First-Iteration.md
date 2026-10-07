# Workflow First Iteration

_May 10, 2025_

Last time I wrote, I described [a roadmap](https://scotterickson.info/blog/2025-04-25-dx-eval-roadmap) to prove or disprove various elements of [my DX theory](https://scotterickson.info/blog/2025-04-18-theory-of-dx). This helped clarify for myself what I needed to build on the way: a workflow tool. I went ahead and built a prototype soon after that blog post, and have since played around with it. Now can lay out more elements for a sufficiently comprehensive workflow tool.

## The Prototype

If you're interested in the particulars of this tool, read on, otherwise skip ahead.

### Source

It's [not very complicated](https://github.com/sderickson/saflib/tree/main/workflows). The key bits are:

- [An abstract workflow class](https://github.com/sderickson/saflib/blob/24ec28406218f43c66a433502db10ffc6a1138e0/workflows/src/workflow.ts#L26).
- [A CLI setup](https://github.com/sderickson/saflib/blob/24ec28406218f43c66a433502db10ffc6a1138e0/workflows/src/workflow-cli.ts).

An example workflow, and the first workflow I built, is a [workflow for creating workflows](https://github.com/sderickson/saflib/blob/main/workflows/workflows/add-workflow.ts). It has common elements for the others:

- A name and description for the CLI
- A param which gets passed in via CLI
- Stub code generation that happens at kickoff
- Computed values
- A series of steps: names and prompts

### Integration

I wanted each project to have control what workflows are available, so the workflows package doesn't put anything in the `bin` package property directly. Instead, the project monorepo (which houses `saflib` as a git submodule) will add a `bin` command which imports the workflows to include and runs the CLI code with the selection.

My integration (the project side of things) looks like this:

```ts
// tools/workflows/list.ts
import metaWorkflows from "@saflib/workflows/workflows";
// import more...

const workflowClasses: ConcreteWorkflow[] = [
  ...metaWorkflows,
  // etc.
];

export const workflows: WorkflowMeta[] = workflowClasses.map(
  concreteWorkflowToMeta,
);
```

```ts
#!/usr/bin/env node --experimental-strip-types --disable-warning=ExperimentalWarning
// tools/workflows/workflow-cli.ts

import { runWorkflowCli } from "@saflib/workflows";
import { workflows } from "./list.ts";
runWorkflowCli(workflows);
```

```json
// tools/workflows/package.json
{
  ...
  "bin": {
    "saf-workflow": "./workflow-cli.ts"
  },
}
```

### Usage

A developer can use the workflow tool by running the command in the terminal.

```
% npm exec saf-workflow help kickoff
Usage: saf-workflow kickoff [options] [command]

Kick off a workflow. Takes a workflow name and then any arguments for the
workflow. Example:

npm exec saf-workflow kickoff add-tests ./path/to/file.ts

Options:
  -h, --help                    display help for command

Commands:
  add-tests <path>              Given a file, add tests to the file.
  split-file <path> <item>      Split a file into multiple files, one for each item.
  add-workflow <name>           Create a new workflow
  ...
```

```
% npm exec saf-workflow kickoff add-queries

The "add-queries" workflow has been kicked off.

You are adding queries to a database built off the drizzle-sqlite3 package. This
is how consumers of the database will access and edit the data there; this is
effectively the database interface.

Read the project spec and the reference documentation for the
@saflib/drizzle-sqlite3 package. If they haven't already, ask the user for the
project spec.

Also, read the guidelines for queries in the doc:
/Users/scotterickson/src/vendata/saflib/drizzle-sqlite3/docs/03-queries.md

To continue, run "npm exec saf-workflow next"
```

```
% npm exec saf-workflow next

The workflow has moved to step "Create the Query Folder".

You are adding queries to a database built off the drizzle-sqlite3 package. This
is how consumers of the database will access and edit the data there; this is
effectively the database interface.

Queries for a given table should live in the path "queries/table-name". The
"table-name" doesn't have to be the full table name. Create this folder if it
doesn't exist, as well as an "index.ts" file.
```

Each prompt starts with what the command did, a system prompt, and then finally the task prompt.

Many `npm exec saf-workflow next` calls later when the workflow has run out of steps...

```
% npm exec saf-workflow next

The workflow has been completed.
```

If I were getting someone oriented on a codebase, having them use this tool manually wouldn't be a bad way to do it. But the most frequent user will be agents. I usually prompt them like this:

```
Hey, I need a new db query to dbs/main/queries/scheduled-calls. To add a query,
navigate to dbs/main and run “npm exec saf-workflow kickoff add-queries” and then
run the commands it gives you.

The file to add will be: delete.ts. This takes a "scheduled call" id and deletes it
from the database.
```

Then I put Cursor in "YOLO Mode" so the agent can run without confirmation from me for every bash command. The agent goes to town, running the CLI tool, follows the prompt, then repeats until it gets the "workflow has been completed" message.

### State and Packages

Since the workflow is executed through a series of `npm exec` commands, the state needs to be loaded, run, and saved during each run so subsequent executions work the way you'd expect. To do that, the CLI tool [loads from and saves to a file in the `cwd`](https://github.com/sderickson/saflib/blob/24ec28406218f43c66a433502db10ffc6a1138e0/workflows/src/file-io.ts#L7), which in Node monorepos, is the nearest folder with a `package.json`. So you can only have one workflow running in a given package at a time, and workflow instances are associated with a specific package.

I find this is a good scope for workflows as a rule of thumb. I don't want individual workflows to get too grand and so scoping them to activities which would only happen in one package (add a db query, add a route, add a page, etc) keeps them pretty focused and limits the amount of context required.

It does sometimes confuse the AI, though, getting different results in different folders. It will occasionally `cd` to another location, run `npm exec saf-workflow next`, and then it doesn't work because of the changed context. They figure out the situation on their own pretty consistently, though.

I _could_ make things simpler by filtering workflows based on `cwd` dependencies. Even with the few workflows I've created, it's getting a bit much to look through them for the one I want. Say I'm looking for a "Vue" workflow command in a frontend package, I don't want to have to sift through a bunch of non-applicable "OpenAPI", "Node/Express", and "Drizzle/SQLite" workflows. But one thing I _can_ do is have the workflow tool find all the dependencies of the `cwd()`'s package.json, and only list workflows provided by those dependencies. Then the list of available commands that show up in the CLI are only those that make sense to run in your current location. I'll probably add that feature in the not-too-distant future.

## Experience So Far

The workflow tool already shows promise for smaller workflows. I've used [this database query workflow](https://github.com/sderickson/saflib/blob/main/drizzle-sqlite3/workflows/add-queries.ts) a bunch of times and I've been perfectly happy with the results each time. It takes five minutes for each of them to be written, tested, reviewed, and committed. They require a single Cursor "request" because it typically requires fewer than Cursor's 25-tool-call-per-request limit. I'd say compared to writing them by hand, it's definitely 2-4x faster, and it seems reliable enough.

I've had a bit more trouble with larger changes, in particular refactoring. My [SAF library repo](https://github.com/sderickson/saflib), which houses all the shared code between my projects, undergoes pretty frequent and major changes right now, so there are lots of opportunities to run refactoring workflows. For example, with database libraries, I changed how queries are written and, to try and get adoption to go faster, wrote an extensive workflow to switch over from one pattern to another.

It didn't go great. Here are some of the problems I ran into:

1. It was a lengthy workflow so I think eventually the agent got a bit confused.
2. The workflow directed the agent to create a completely new package and gradually copy/edit code over from the old, and I think switching between two packages (because of how the tool is designed) didn't go great. It was also hard to compare new and old code to make sure undesirable changes weren't working their way in.
3. At some point the agent just went off the rails, and though it had done a handful of quality changes, it then made a whole bunch of bad changes with no Cursor checkpoint or Git commit to return to. It was simpler to just throw out both good and bad and do the work manually (or semi-manually, leveraging Cursor's tab complete feature).
4. The agent skipped ahead and couldn't go back. It kept trying to do the future steps and push the workflow forward though the previous steps were nowhere near done.

I somehow managed to lose the workflow in some git commit (I blame submodules, I'll spare you the details) but I didn't bother trying to recover it as I know I want to start over from scratch on that one. Refactoring is probably one of the most useful routines agents can do so I'd very much like to figure that one out... I have some ideas.

Well, the refactoring workflow notwithstanding, I definitely want to add more workflows and extend this tool more to fix deficiencies.

## Features to Add

Based on the refactoring workflow experience and others, these are the features I think would be needed for a more complete product:

- **Gates**. If an agent isn't done with a step, or something is broken due to a change in that step, then the tool should block the agent from moving to the next step. Gates may be specific to a step, or should run on every step of the workflow. This will make sure certain steps happen correctly, and provide assurance that the workflow is truly done when the agent says it is.
- **Auto Transitions**. Some workflows are sort of "upserts", where the first thing that might need to happen is just adding a new folder with its own index file and hooking together imports and such. But oftentimes the workflow just adds to an existing folder. The workflow should be able to identify when something already exists and skip a step in that case, or go down a different path, just to save on unnecessary agent prompting and work.
- **Inputs**. Sometimes there needs to be a decision made and it would be good for the actor to be able to provide it. This might choose the next step, the value of something, or just confirm (or prove via pop quiz?) that the agent has read a document.
- **Child Workflows**. This will be necessary to string together smaller package-specific workflows into a monorepo-spanning effort. Or to dynamically execute another workflow when the agent (or human!) realizes the current workflow is blocked on some change that wasn't planned for.
- **Agent Configs**. I think for each workflow, it'll probably be sufficient for there to be one model that does that entire workflow. Along with other settings such as system prompts, available tools, and values for whatever settings the model API provides. If a workflow _really_ needs to involve more than one agent, then best to spawn child workflows which are run by other agents. This will be something to determine with evals.
- **Observability**. As an owner of libraries and tools to be used by other developers and paid for by the business, I'm going to want to know how often the workflow successfully completes, how much it costs, and how long it takes to run, for example.

These are quite a few features. Luckily I think I've found just the thing which will cover my needs: [XState](https://stately.ai/docs/xstate). I've been digging through the docs and it seems like it maps well.

| Workflow Feature | XState Feature                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| Gates            | [Guards](https://stately.ai/docs/guards)                                                                       |
| Auto Transitions | [Raise Action](https://stately.ai/docs/actions#raise-action)                                                   |
| Inputs           | [Event Payload](https://stately.ai/docs/transitions#event-objects)                                             |
| Child Workflows  | [Invoke](https://stately.ai/docs/invoke) / [Spawn](https://stately.ai/docs/spawn)                              |
| Observability    | [Log](https://www.jsdocs.io/package/xstate#ActorOptions.logger), [Inspect](https://stately.ai/docs/inspection) |
| Saving, Loading  | [Persistance](https://stately.ai/docs/persistence)                                                             |

For agent config, XState is actually building a variant set of libraries [for agents](https://stately.ai/docs/agents). While I don't think I'll use this since it would reduce portability, it affirms the idea that state machines are great tools to pair with agents.

Anyway, that about wraps things up. I'll be adopting XState next, then continuing to build and use these workflows as part of building websites. Should be fun!

## Bit of Bike Shedding 🚲

Just a little.

Though I've used the term _many_ times in this post, I don't think **workflow** is the right word. It's the one that gets used all the time and is all over the place, but it's business jargon, like "Finite State Machine" is a computing term. It feels awkward to use the word "workflow" to describe something to someone who just wants to get something done; I feel like a wonk.

**Routine** is a better term for this thing for many reasons:

- It's common parlance; people say "daily routine" but I've only ever heard "workflow" used at work.
- It's already a software term, and these workflows are kind of like higher-level algorithms (aka routines, more or less)
- The workflows I'm building are for very "routine" work done by developers: generate code, export an interface, write a query, add a unit test.
- In fact, "routine work" is where agents will be most helpful and reliable, it seems, since routine work requires (or should require) less decision-making.
- When the agent is running a workflow, if it breaks somewhere along the way, the work to be done is no longer "routine" because you have to figure out what went wrong and how to address it and things could go all sorts of directions, so the agent should _halt_ the routine and instead a human should probably take a look.
- The work non-developers might do with a tool like this one should also be "routine" work. If you're wondering what an AI agent can do for you in your personal or professional life, think about the "routine" things you do that you don't want to do anymore.

My two cents.

---

Thanks for reading!
