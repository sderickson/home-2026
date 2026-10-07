# Governing Products

_June 14, 2025_

When I think about how software development and other roles will evolve over the coming years, [Factorio](https://www.factorio.com/) comes to mind. It's a computer game, sort of an overhead RTS, where you crash land on an alien planet, and over time go from gathering materials and building conveyer belts by hand, to designing and building huge, ever-growing and heavily optimized factories.

It's a gradual process, and you can't skip ahead, but you're also fundamentally limited if you don't adopt the ever-scaling-up gameplay. Once you create a small portion of your factory dedicated to manufacturing a certain product, such as high-end circuit boards, you can create a blueprint which lets you copy and paste it to create a great many more. But then you need to scale up your harvesting, logistics, power, and defensive systems. Once these have all reached a certain level of maturity, you can play without looking at your character. You just have the map open and switch between overlays, telling systems to basically "harvest everything in this region" or "build seven more factories of this type over in that area". You govern at a high level in order to produce far more.

Right now, building my own web app base is going in a similar direction. I started by building everything by hand, then once prompts by themselves were too unreliable, I made a tool for writing and running [workflows](./2025-05-10-Workflow-First-Iteration), which work similarly to Factorio blueprints. As I go through figuring out how I want to write and structure web SPAs, form components, API endpoints, API specifications, protos, mocks, database queries, end-to-end tests, third-party integrations, and so on... I create workflows for each of them so I can stamp them out quickly.

To see how far agentic workflows can scale up productivity, I foresee needing:

1. Workflow evals to ensure and maintain sufficient reliability.
2. Higher-order workflows such as for designing, planning, and pivoting.
3. Ever-higher-order workflows such as for strategizing, prioritizing, and making decisions.

The difference with Factorio is that it's *designed* to achieve these higher levels. LLMs are a new tool, so it's currently unclear how successful they'll be at each of these levels. The more I work with them, though, the more convinced I am that they *can* be set up to automate much of what we do at each level.

Where does that leave us, those who are working at those levels now?

Here's my prediction for the future: I think our roles will become **governing** these systems. To frame this like the American government, for any given role or activity, we will need to decide and write down what are the rules (legislate), set up automated workflows to enact those rules (execute), and write evals to handle unexpected situations that come up (judicial case law).

## Governance In Practice

To see how this looks, let's dive into what each of these things might look like for a specific kind of developer: a developer of developer tools, a "DX" (Developer eXperience) engineer. Their role is to define and document how *other* developers build product, decide what languages and platforms they use, list what rules that code needs to follow (such as disallowing certain anti-patterns), and build and maintain the systems to enforce those rules.

### Legislation: Documentation

A developer, DX or otherwise, legislates through documentation. This is the source of truth of how things Should Be Done.

This is nothing new, really. I mean, documentation should be well written, organized, and thought out, and there should be processes for updating that documentation. But it's pretty cut-and-dry.

For me, rules are represented as [Markdown](https://en.wikipedia.org/wiki/Markdown#Examples) files in the repository in "docs" folders, co-located with the code that it governs. That way they're easily accessed, and go through the same change process as new or changed code: owned, versioned, reviewed, and merged. When I'm creating rules, I research options, test them out, come up with acceptance criteria, and make decisions. I also use AI to help write the docs based on what I build in tandem with my research, and reference those docs in prompts and workflows. See [Doc Driven AI](./2025-03-27-Doc-Driven-AI.md) for more details.

### Execution: Workflows

Execution is done through processes, formal or informal. This is the main way things that Should Be Done, *get* done.

If there's documentation on how to do something like create a web page or add a database query, then a process executes that documentation in a consistent way, both in that it does that work reliably and it matches the documentation. This is basically a (hopefully) well-structured, richly featured checklist. Sometimes these workflows are simply more documents: [How-to Guides](https://diataxis.fr/how-to-guides/). They can also be executed with software tools and scripts, or robotic machinery. Regardless, they include checks along the way to make sure things are executed the way they should be, and can adapt (or error and stop) based on different situations or choices along the way.

For software development, I'm using a Finite State Machine to represent my developer workflows ([example](https://github.com/sderickson/saflib/blob/c978423647ac4404beb0c2fee04d547a375377c9/vue-spa/workflows/add-spa-page.ts)). FSMs are a Computer Science concept; [XState docs](https://stately.ai/docs/state-machines-and-statecharts) and [Wikipedia](https://en.wikipedia.org/wiki/Finite-state_machine) have more detailed explanations, but basically they are a set of allowed states and transitions between states. They can be [complex graphs](https://github.com/jakesgordon/javascript-state-machine/blob/master/examples/atm.png), but my workflows are (for now) mostly a linear set of steps, and each step is usually either a prompt to the agent (or human) to do something, and a script which does things like copy a set of template files into a destination folder or executing a build. When I'm working on a new workflow, I test it and make changes when I find the agent or my scripts don't follow the rules correctly, and usually add/update rules as I realize I need them for basic cases.

### Case Law: Evals

In theory, there's no difference between theory and practice. In practice, there is.

As such, you need a system which evolves based on cases that were not thought of, planned for, or  discovered at the outset. These cases may have not even existed at the time the rules were written, and it's a fool's errand to try to handle every case when first writing rules. You need to build on the theoretical foundation and spirit of the rules, and fill in the gaps or otherwise handle gnarly or novel situations. How you choose to handle these situations will mostly affect execution going forward, though they may also inform rule changes. This means picking illustrative scenarios that come up, deciding how they should resolve, and then recording and incorporating both the situations and the decisions into the governance process to ensure execution follows precedent.

For software development, these are [evals](https://www.evalite.dev/what-is-evalite#what-are-evals). An eval is a program which represents a scenario, ideally based on an actual "case" that came up, that automatically runs the LLM-powered system through that situation and checks that the result matches the decision reasonably well. For example a workflow for creating an API route might have evals for routes which access the database, another server, or a third party service, or some combination of these things. If the workflow in practice ends up doing something I hadn't considered but I deem undesirable, such as doing CPU-intensive work, I might create an eval to ensure in that situation the agent decides to use a more appropriate job-queueing system instead.

## The Governing DX Engineer

The above gives an idea of what being a DX developer might look like going forward, but what does that look like day-to-day? Let's say you're in a workplace where governance is the norm. The organization has a mature codebase, with developer documentation, agent-driven developer workflows, and a suite of evals for those workflows which run automatically on the regular. Your day might consist of some combination of:

* Creating a new developer workflow tool to execute on a new set of rules, making a simple product with it to test the tool's behavior and ergonomics.
* Reviewing existing workflow tool usage, inputs and outputs, and pick out cases where things go awry to create evals, adjusting the workflow to adhere to them. This might be in response to a particular incident or migration which highlights issues with the workflow.
* Proposing changes to the rules, and affect those changes.

There's clearly plenty of software developer skills still needed here, and actual coding to be done. You can't make informed, reasonable decisions about the rules of software development, or set new precedents, without understanding the nature of the trade. You have to build something that doesn't scale first before you figure out how to scale it. You need to make the prototype which the blueprint is based on.

## The Governing Worker

I give the DX engineer as an example, but I believe many work roles could end up incorporating "governance". Imagine for what you do for work, how it might become managing a set of rules, workflows, and evals specific to that role. Here are some examples that come to my head, for roles I've done or worked closely with, and what I imagine their rules, workflows, and evals would include.

----

### Frontend Developer
Someone who builds interfaces for websites. Uses React and alike.

**Rules**
- All user-facing interfaces should accessible
- Strings should be incorporated into the i18n system
- Always use Tanstack Query for server resources
- When there are errors, they should be reported both to users and team members

**Workflows**
- Include list of accessible components in prompt
- Automatically create separate files for English strings
- Include a step for adding Tanstack queries
- Include a step to handle errors with common UI components and an OpenTelemetry client

**Evals**
- What happens if the design system does not have an accessible component for the product being built?

### Manager
Someone who is in charge of a team, and ultimately accountable for its output and health.

**Rules**
- Stand-ups should be written in Slack three days a week
- Team members should have PGP (personal growth plans) docs and regularly update them
- Everyone should take a reasonable amount of PTO

**Workflows**
- Message reminders to people who did not post an update
- When making 1:1 agendas, include an item to review the PGP doc at regular intervals
- Alert when vacation time is well outside normal range, above or below

**Evals**
- People at different stages in their career need to go over PGP more or less regularly

### Customer Advocate
Someone who handles support requests from users of the product.

**Rules**
- Respond within 24 hours
- Technical issues should be escalated to appropriate team with repro steps
- Insights should be gleaned to inform product direction

**Workflows**
- Alert if response is getting stale
- When a user reports a bug, agents attempt to reproduce them in a sandbox, figure out who owns the components being used where the bug is, and make an educated guess which team should investigate
- Support requests tagged and assessed for patterns

**Evals**
- There will probably be an endless stream of good scenarios for better routing of issues

### Executive
Someone who manages systems and processes that span an entire organization, like a VP.

**Rules**
- OKRs must be written and updated by all managers
- Employee sentiment surveys need to be conducted at regular intervals, with action items
- A standardized incident review process should be followed, with action items

**Workflows**
- Alert when OKRs are stale or missing
- Ping action item assignees, then their managers on up, when action items are incomplete
- Monitor major outages and make sure incidents are filed for them

**Evals**
- How to handle if an issue or complaint is recurring?

## The Governing User

I suspect that, for every level of employee, be they individual contributor or C-suite, will benefit from being able to directly govern all three aspects. That means the technical systems can't just be the purview of engineers; everyone needs to be able to articulate and produce and update workflows and evals. There should be no technical barrier to doing so. So I expect interfaces for tools that target certain work roles (Figma, Confluence, Zendesk) to facilitate creating and maintaining them.

Then *users* can become *governors*.

This point summarizes how I see software changing in the coming years, for work and for personal life. Rather than being users of a product, such as an email client or streaming service or task management system or social network or file storage, I think people will become able to govern them. If you *want* to get into the weeds, well, sometimes you have to do that to govern effectively, but users can choose *how* involved they want to be and *when*. Imagine for example you can govern your music playlist on how it creates a playlist for you every day, or how your TV picks what to watch for the evening, or how your browser finds promising vacations for your family. You are able to write down some rules in prose (I'd like to see more movies with actors, actresses, and directors I like), you tell the product what steps you want it to take to follow those rules (ask me after I watch a movie which people involved I'd like to see more of), and you review how it works (oh, don't recommend/always recommend westerns/rom-coms/sci-fi/horror/anything owned by Disney).

For personal use, ultimately I think being able to govern the products you pay for will be empowering. Instead of products being pulled different directions, interfaces which try to accommodate every use case and end up not being great for any of them, you have interfaces for the core capabilities but more besides available to your agent, like a secret menu at a restaurant.

And to truly govern *your* services, ideally the LLM used is *your* LLM paid by you, not the service's. Like financial advisors have a responsibility to do what's best for those they advise, LLMs should act in the best interest of the users they're helping. For that to work, though, we'd need some sort of way to "lease" user agents to services, so services can use them in a limited fashion. I think this would also reassure people who are reasonably worried about how much personal information is being tossed about.

Alternatively, it would be neat if users could simply run their own service *and* LLM reliably themselves. If agents can get to that point that they can fairly consistently maintain an individual user's service, then users can truly become masters of their own data. See [Federation Architecture](https://docs.bsky.app/docs/advanced-guides/federation-architecture).

## The Governing Agent?

When people being paid to do a job *should* govern instead of use, or use instead of govern is a whole other situation, though. There are market forces there, and so ultimately people will be pushed toward the more productive approach, or what is seen as the most productive approach. That will mean more governing agents, less doing individual work, and really the individual work that *is* done being in service to better governance.

The next logical step beyond that might seem like to simply have agents govern and remove people from the equation entirely.

I think though at that you lose the plot. If you don't have humans actively involved even in deciding what the rules are and what you should do in special circumstances, then the system is no longer grounded in human interests but just flying without apparent purpose. Such a system may coast for a time but, I'd expect, eventually go off into odd, unexpected directions. The point at which you decide what is important is where there should be irreducable human involvement.

I'm also just not seeing how the current set of tools can be trusted without someone who understands the role being involved. I certainly wouldn't trust the current set of available models with making any major or even medium-level architectural decisions on their own, and I don't see why we would let them make key decisions on their own for any other role. That may change but, barring some major change with what tools are available to us or their capabilities, I see a shift toward wide-spread governance of products for work and personal use as where we are headed for the time being.

---

Thanks for reading!