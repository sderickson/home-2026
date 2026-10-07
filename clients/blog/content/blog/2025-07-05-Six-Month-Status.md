# Six Month Status Update

_July 5, 2025_

It's been a few months since I posted about my [roadmap](./2025-04-25-Roadmap.md), and six months since I started work on this project to grapple with AI, so I thought I'd give a general update of how things are going, where I'm at, and where I'm headed.

## Project Recap

I'll summarize the high level goal and train of logic I'm working on:

- I want to [decide for myself](./2025-03-25-Learned-So-Far.md) what is the most effective and appropriate way to use AI tools in software development, both to keep up in my chosen profession and to enable myself and others to build and benefit from more of the tools and services they want.
- To figure this out, I've started a (web-based SaaS) [business](https://familycaller.com/) with a frequent cofounder of mine, so that I'm working toward and grounding on a real-world use-case.
- A central piece of this work is my own web-app base, [SAF](https://saf-demo.online/). This serves many purposes, but in the context of this project, it is a proof-of-concept and a testing ground for how best to use AI tools, as well as a way to share my code and setup across different projects. It's open-source for anyone who wishes to use it or contribute to it.
- After a few months of adapting to and experimenting with AI agents as part of building the business and SAF, I settled on a theory to explore: the [Theory of DX](./2025-04-18-Theory-of-Dx.md). In short, I posit that what's good for human developer effectiveness (automated tests, static analysis checks, accessible interfaces, well-organized code, etc), and what's good for AI agent execution, are very much the same thing.

Basically, I'm less focused on what AI product or model or combination thereof is most effective, and more focused on how to set up a personal or professional tech stack for effective use with _any_ AI product or model. I think that's more interesting, less explored, and ultimately more valuable and generally applicable long-term than keeping up with and reviewing a motley, ever-changing assortment of products and services.

## How It's Going

We launched the MVP website last week! So, I did an analysis of where the six months of my time went to get to launch.

I spent **two months on code that's specific to the business**. Roughly one-to-two weeks each on the:

- Prototype
- Onboarding flow
- Core product frontend
- Core product backend
- Payment flows (with Stripe)
- General polish, look-and-feel

I spent **three months on SAF**, with a week or two each on the

- Initial architecture design
- Node/Express/SQLite/OpenAPI backend
- Vue/Tanstack-Query frontend
- Auth backend and frontend, basic email/password setup
- Deployment scripts and general Docker work
- Cron jobs
- gRPC clients and servers for communication between services
- Email integration
- Refactoring
- A custom-built AI Workflow tool (first iteration described [here](./2025-05-10-Workflow-First-Iteration.md), now with a [second iteration](https://github.com/sderickson/saflib/blob/0808834897156884039fae2a3d59a0848cdcab3d/workflows/src/workflow.ts#L152) that uses [XState](https://stately.ai/docs))

And the sixth month was time off, other work.

For an idea of the amount of product code I built, it includes:

- Three dozen API routes
- Three dozen DB queries
- Three 3rd-party integrations
  - Stripe for payments
  - Retell for AI agent telephony, and
  - Geocode.xyz for location/timezone lookups
- Three dozen Vue pages across five SPAs
- Two dozen user journeys

And in terms of quality, the product code is:

- Well covered by vitest unit tests and Playwright E2E tests
- Specified with TypeScript, OpenAPI, and proto
- Broken down into small (usually <100 line) files
- Organized into focused npm packages and broad services
- Typechecked
- Mocked at integration points for automated tests, local development

I suspect I could build a similarly complex product in a month and change instead of two, if I were to start from scratch. A good amount of time was spent figuring things out and investing in the platform during those two months. I share these stats to give you an idea of the velocity I've experienced and expect to see: a deployable MVP SaaS product in a month or two from one engineer.

## What's Next

Now that I have the business up and running, there are three milestones remaining to validate (or invalidate) my Theory of DX:

- Release SAF v1
- Release Workflows v1
- Do Optimization and Analysis

I'm tracking work for these [here](https://github.com/users/sderickson/projects/2/views/1).

### SAF v1

To believably test the Theory of DX, I need a tech stack that includes the key DX aspects that I believe are necessary for AI tools to succeed, and the business-critical components that are necessary for any responsible product. It needs the DX pieces because I want to test and compare workflows with and without them, and it needs the business components to be sufficiently complex enough for the takeaways to be believable.

The most pressing things missing from the framework are:

- Instrumentation. I'm adding Loki (logs), Prometheus (metrics/alerts), and Grafana (dashboards) now, as well as product instrumentation for services such as PostHog or Google Analytics to hook into. Systems like these are absolutely necessary for any serious business to maintain and iterate and grow, and for developers to assess and improve product health and quality.
- Better specified, organized, and generated services and containers. Things like typed environment variables, generated docker-compose files, and composable API specifications. The way things are set up now, neither humans nor agents are set up for success; it's brittle, not very portable, and overly complex to change.
- Internationalization. I _do_ already keep strings separate from components, so they can be easily reused in vitest and Playwright tests, but I want to make sure the way I have them set up will play nice with vue's i18n system. And being able to translate the product is pretty key to any business.

Once these are done, I consider this framework production-ready. Services can be scaled upward, systems like auth, payment, storage, or logging can be added or swapped out, and there are no more breaking changes on my near-to-medium-term horizon. I'll be comfortable using it for my own products, and it'll be a good time for others who are interested to try using it as well. Breaking changes will be minimal.

I'm tracking this milestone [here](https://github.com/sderickson/saflib/milestone/1).

### Workflows v1

Compared to the web-app framework, the workflow tool is less mature, but also will take less time to build. I've figured out how to create finite state machines which feed Cursor agents instructions and do some automatic code generation and validation scripts along the way. This by itself made it much faster to stamp out db queries, vue pages, and npm packages with better consistency (like making sure the agent actually wrote tests and actually made them work), but there are some serious gaps:

- I haven't made sure this tool's interface works with other agentic tools such as Roo Code, Windsurf, or Claude Code. Just Cursor.
- The workflow state machine implementations are not well decomposed, type-safe, nor as easily grokkable as I'd like.
- There are some key workflows missing, such as creating Playwright tests, landing a GitHub PR, adding a third-party integration, and "bootstrapping" a new product.
- There are no [evals](https://www.evalite.dev/) set up for these workflows!

Once all that's done, I'll have the three branches of my [governance](./2025-06-14-Governing-Products) system in place for web development: documentation, workflows, and evals. The workflow tool will really be a separate tool from SAF, usable in any environment that includes Node or a Node-like environment. And SAF will come with workflows for projects that use it.

At this point, it should be fairly straightforward for anyone using this framework to see the same results as I do, especially if they're familiar with the technologies. I will have taken all my design decisions and processes, and made them accessible to humans and agents alike. Little will be left to guessing.

I'm tracking this milestone [here](https://github.com/sderickson/saflib/milestone/2).

### Optimization and Analysis

Where all this finally comes together. As the name implies, there are two smaller milestones:

1. **Optimize**. With the eval system for workflows in place, I will add evals and use them to measure and iterate on the workflows and models that run them, to try and get the [reliability](./2025-04-11-Reliability.md) of these workflows high enough. I would like to see a success rate of at least 95% for each workflow, where the agent is able to complete the workflow the vast majority of the time without any major issues (like being untested, overly complex, or just not following the most important rules). This will drive improvements both to the workflows and also the framework.
2. **Analyze**. Run and measure the workflows with and without different DX pieces. How much does the reliability (success rate) and/or efficiency (token count) change when the following are removed, reduced, or altered:

- Doc review as part of the workflow
- Run the typechecker as part of the workflow
- Pre-existing unit or e2e test coverage prior to the workflow
- Unit or e2e tests as part of the workflow
- Engineering values in the system prompt
- Dependency documentation and API references

Assuming all goes well, I expect to come out of this with:

- The ability to build a non-trivial, feature-complete, maintainable, and scalable web-app product in one or two weeks instead of one or two months, using SAF in conjunction with the workflow tool.
- Evidence and numbers on what aspects of DX and a tech stack make AI agents more effective and efficient. Basically a proven recipe for creating, or a guide to adapting, a tech stack of your own choosing or inheritance, to optimize for AI-driven development.

(No milestone or tasks for this phase yet).

## After That

So assuming I get positive results... would that finally answer my question? What is the most effective and appropriate way to use AI tools for software development?

Partly. It will show how to get the most out of these tools, what is required to not only adopt but also adapt to the new reality. So it does show the most _effective_ way to use AI.

What is the most _appropriate_ way to use these tools is a related, but different question. It's related in that to figure out what one _should_ do, first you need to figure out what you _can_ do. I'm still without definitive proof about what can be done with AI tools for software development, and by extension other forms of work, but I'm confident enough in where I'm going to start thinking about what _ought_ to be done with these tools.

### Appropriate Safety

One super broad category to consider is safety. This includes but is not limited to guarding against:

- Unexpected, undesirable, uncontrollable emergent behaviors of products and services
- Protecting individual privacy and interests from companies that develop, provide, and incorporate these tools, where interests diverge from users and other stakeholders
- The impact on the general human populace's education, self-sufficiency, agency, relevance, and livelihoods
- A straight-up singularity scenario

Overall, I'm optimistic. At least in some ways, I think the _appropriate_ way is also the _effective_ way. For example, if the way to keep AI agents effective at building software is to make sure the software they produce is understandable, well organized, well tested, and well specified, then we don't have to worry about software becoming incomprehensible. Otherwise it becomes unworkable by anyone or anything.

I also suspect that it will pay to continue to be in control, to continue to be involved and not abdicate all decision-making to LLMs. If a product or service or platform is effectively ungoverned, it will lead mostly to them being undesirable and unprofitable.

More concerning is the speed at which software that benefits some and exploits others can be developed and deployed and made more effective. It's already concerning the centralized power large organizations have and are accruing further, and how products can influence, exploit, and addict people to them.

### The Democratization Opportunity

In making products much easier to build, however, there is potentially a countervaling force in the fact that we, as individuals, may be able to declare independence from the most commoditized and misaligned products and services out there. What I'm saying is it's becoming easier and more viable to ourselves build, run, and manage our own forums, knowledge centers, data stores, social networks, and so on, with our own preferred features and capabilities. I wonder if it's possible that servers will follow a similar pattern as computers did four decades ago, from centralized shared resources to something you can buy, run, and maintain yourself.

And would people want to do this, and why would they? There are certainly those out there who have the skills, the time, and the motivation to self-host file storage, email servers, and such right now, but most people do not. Even if self-hosting were as straightforward as owning and maintaining your own personal computer is now, it still wouldn't be free as some of these services are, nor as easy as "outsourcing" the maintenance responsibility to a major provider.

Where these products and services diverge in terms of customer interest or cost-effectiveness _may_ provide an opportunity for self-hosted solutions, though. Not all of these products are free, and it may be cheaper to run your own suite of services on a machine or two that you rent than it is to pay a monthly fee to each of an assortment of providers. And when products become worse or more costly due to market forces, as Google search, Uber, AirBnB, and others arguably have, that provides an opportunity for self-hosted disruption. Cutting out the middleman, or in this case the middle-corporation, becomes cost-effective as well as beneficial.

### The Alignment Problem

Even if there's sufficient gain to be had from such a shift, it seems to me there's one fundamental blocker to doing so, both for a general community and for organizations and companies trying to get the most out of these tools: decision-making and alignment. Deciding what to prioritize, what strategies to take, what problems to solve and how, still needs to be grappled with. This may not be necessary for products which are sufficiently personal (you can make your personal todo list however you like without getting buy-in from anyone) but for those services where network effects are crucial (such as sharing resources and information like cars, homes, and jobs), the core purpose, data models, architecture, and trust models need to be chosen, even if your interface to those things can be customized.

Figuring out a way to gain decisions and alignment and by extension trust, among many and varied people, to me, is therefore the most _appropriate_ use of these capabilities. They can make us go far and fast, but if we don't dial general interests into the direction they go, then I worry they'll, at best, make existing problems worse.

---

Thanks for reading!
