# Theory of DX

_April 18, 2025_

I have a working theory how best to set up your project for AI, and it revolves around DX: Developer Experience. My theory is that what helps engineers, tech leads, and engineering managers be efficient and productive, and what helps coding agents to be efficient and productive, are basically the same thing. So for anyone building software wanting to make the most of these new and evolving tools, they should invest in their DX.

It's a working theory, so admittedly I don't have strong evidence, but I'm writing out my thoughts _so that_ I have something explicit to work on. What I've seen in my own experience shows promise for these ideas, so it's worth spending the time investigating further and general consideration. Still, take what follows with a grain of salt. I'll expand on and adjust these theories as I go.

With that disclaimer out of the way.

There are several facets to DX I'm focusing on: documentation, quality metrics, interfaces, static analysis, and best practices. I'll go through each of these categories and describe:

- Why it's important for humans,
- Why it's important for agents, and
- What I'd recommend doing/am myself doing to set things up for both

## DX Categories

### Clear Documentation

The codebase should have docs for all recommended folder structures, workflows, software design, and libraries. If one is missing, that should indicate it's still undecided or just hasn't been worked on yet. Even undecided things should have a stub to make it clear where things stand and acknowledged as a TODO. Without these docs, developers are more likely to create, fork, and/or install multiple redundant solutions, because there isn't a source of truth for what the "right way" is. You end up with multiple competing defacto standards.

Docs neatly fold into agentic coding workflows because prompts can simply link to the appropriate doc, or expose any and all documentation via a tool to the agent for it to look up the doc itself. The agent will spend less time thinking about how to do something and get it more right the first time, saving time and money, and reducing errors. I wrote about developing and using docs in agentic coding flows in my [Doc Driven AI](./2025-03-27-Doc-Driven-AI) blog post.

This is important to focus on because I expect any 3rd party library which purports to analyze and understand your codebase automagically will not be able to do so well unless you have your own documentation. An advanced tool might be able to identify competing defacto standards, and even facilitate resolving them and help you make them actual standards by adding docs. But at some point _you_ need to make choices about what tools and patterns and invariants you want and get them down somewhere both humans and agents can access and make use of them. So make sure you have a system for contributing and maintaining written documentation that's embedded in the codebase but not in the code. Preferably near or in the code module it pertains to.

### Quality Metrics

An important tool for managing a large codebase is a set of engineering and product metrics to measure health. This includes both leading indicators and signals from production. A set might include:

- Leading indicators
  - Test coverage
  - Build size
  - Number of dependencies
  - Interface complexity
- Live signals
  - Bug tickets
  - Revert commits
  - Success rates
  - Conversion rates
  - Response times

The important thing is these metrics be _automatically_ associated with a given module or package. For example, one could imagine a system that identifies commits which fix (or attempt to fix) a bug ticket, and associate that bug with each package which has changes in the fix. None of these are perfect, but taken together they can help identify when some part of the codebase is getting too bloated and/or unstable. The reason you need this level of granularity is for accountability and ownership. If you own a set of modules, and they have dedicated metrics, you can track and be held accountable for the health of those modules.

These metrics also are an invaluable tool when much of the code is being generated. It's all too easy for agents to generate a ton of code without appropriate test coverage, install a bunch of dependencies willy-nilly, or add something that needs to be reverted because success rates plummeted. If these metrics are all green, a manager or tech lead can be reasonably certain the ship is going in the right direction. And if they're turning red, it's likely whatever other guardrails (like linters or documentation) you have in place are insufficient.

However, to have good metrics, you need a codebase which can support them. If things are too tangled, the numbers you get either don't exist or have less meaning as it's unclear where or who they apply to. If things can't be measured automatically, they need to be created manually and that's slower, less consistent, and almost certainly not comprehensive. To be sure that agentic coding isn't undermining your product, you'll need to define and move toward a modular standard if you don't have one already. Once you can support module-based metrics, then you'll need to start collecting them and deciding which ones you think are important and should be built, maintained, and reported on.

### Accessible Interfaces

This is related to the above, in that it's important for the codebase to be broken into small enough chunks, but also those chunks need to have accessible interfaces, ones that don't require digging into the code to find them. If the interface for your API is only determinable by reading your controller, that's inaccessible. If your package has no indication of what methods are intended to be used by external consumers vs internal-use only (public vs private), that's inaccessible. In these cases, you have to do work and make assumptions to come up with the apparent interface; it's open to interpretation. Developers could easily use tools in unintended ways which are unsafe or unmaintainable.

For agentic coding, interfaces being accessible enables humans to pay less attention to the coding level of things. One might imagine a PR process where you skim but don't look too closely at the code portions, but you instead spend your attention on what APIs were updated, which schemas have changed, what library options have been added. You can focus on the codebase at a higher level (software design, architecture), and if any particular package becomes unstable (or is important enough to ensure it doesn't start unstable), you can dig deeper into that one. More about this in my [Reliability](./2025-04-11-Reliability) blog post, where I talk about how modular code lowers how reliable LLMs need to be to be less supervised.

So, once you've got that modular unit which is necessary for quality metrics, you'll also want to make sure a public interface can be extrapolated from it. Any package should clearly define how consumers and/or end-users interact with this unit. These interfaces also need to be committed to the repo, one way or another. Some interfaces (such as npm package interfaces) need to be generated, and so that should be done as part of CI (either enforced or automated). That way you have something to review in the PR for a given interface change. Interfaces which are used _to_ generate other files work as-is.

### Static Analysis

Generally speaking you want to fix things as soon as possible; ideally as soon as they're created, and static analysis tools do just that. If you're trying to prevent or get rid of a harmful pattern or deprecated approach, or guard against an easy and common set of mistakes, a linter or type checker is one of the best ways to do it. And if you've got these tools set up well and they run fast enough, the developer can know something is wrong as soon as it's typed.

They are all the more useful to agents; they know about and often immediately fix linter issues that come up for anything they generate. This is also the best time for them to fix things because they currently have the context on what needs fixing. Otherwise the agent (or the human!) will need to reacquaint itself with the code that is having issues.

They're also particularly helpful when you're doing something that is uncommon. For example, my coding agent often tries to import ".js" files in my backend, assuming there's a bundling step happening, but actually I have Node running with `--experimental-strip-types` and so it will break if imports are added with ".js". Since Vitest handles ".js" imports just fine, importing with ".js" doesn't cause problems until the code is run inside Node, possibly several steps later, when it's more distracting and time-consuming to fix.

For issues like this, I would solve it in the priority of:

- A TypeScript config rule
- A base ESLint rule
- A custom ESLint rule

If you don't already have linters set up or actively maintained, set them up or dust them off and make sure they're running in the background in code editors. Developers should build or enable ones for issues they see coming up regularly from their agents or colleagues in code reviews.

### Best Practices

This is a fuzzy space. These are things like how much automated testing should there be, when and why to rely on dependencies or frameworks, how reusable and reused code should be, and what patterns to use for code reuse. These are interesting areas because there are competing philosophies, with different answers in different contexts. But it's important for a team of engineers working on the same project to (for the most part) align on a set of best practices so that they tend to row in the same direction.

I also think this is perhaps one of the areas most explored in agentic coding in the form of system prompts. They often discourage agents from their worst proclivities: don't write overly complicated code, look for existing solutions rather than generating new ones, always run tests and fix them, etc.

I have mixed feelings about spending much time here because, while these are for sure powerful levers which broadly change the behavior of your agents, many of what's directed shouldn't be up for debate. The system prompts people create feel like bandaids for issues the model creators and IDE developers are already heavily incentivized to fix. And without a framework to measure the value of one prompt versus another, the benefits of a particular formulation over another could easily be real or imagined. Also while I'm testing models, I'd rather have them be largely unadulterated to better understand and make use of their diverse behaviors and strengths.

Given all this, when working on system prompts, I recommend focusing on providing guidance that is non-obvious. If your combination of model and editor is doing something it really shouldn't, better to find a better combo. If there isn't one apparent, then it makes sense to include a system prompt to provide a temporary fix to this systemic issue, but also let the tool providers know where their products are falling short.

Anyway, deciding what is obvious vs non-obvious, and which way to go on the non-obvious stuff, requires plenty of work to figure out amongst a group. Once you've decided, the team's system prompt becomes the source of truth on what was decided.

## Prerequisites

There are some common themes above which can be deduced as important to tackle sooner rather than later.

### Modularity

This I consider a hard prerequisite for:

- Documentation: because it's best kept in the module it pertains to
- Quality metrics: because they should measure the quality of a module
- Interfaces: Modules should always provide an accessible interface

If the codebase can't be broken down into small-enough modules (small enough for a team to own several), then it's harder to find the right docs for a tool or service, or understand what part of the code base is bringing down quality of the product, or what are the contracts some piece of code needs to adhere to. Even for static analysis and best practices, one could imagine scenarios where adoption of linters or the eschewing to best practices is handled and tracked module-by-module.

Without a codebase which is understandably structured, either by man or machine, progress will be stymied. So it's important to decide what is your codebase's "module" and be consistent about how one accesses its interface, its docs, and _each_ of your chosen metrics. If you use one language, use its standard. If you use more than one, you'll probably need a higher-level construct such as Bazel.

### Decision Framework

Once AI can make you go faster, the next bottleneck is identifying and making decisions. You need to decide what goes in the docs, what interfaces should be, what metrics to track, which linters to use, and what your best practices are. Also what to build.

If you're a single person working on a project, congratulations! You don't need to worry about this. But for something involving more than one person, you need to streamline the decision-making, and the larger the org, the more important this is.

On the plus side, agentic coding necessitates and drives creating sources of truth for decisions. And these aren't written in stone; changes to the source of truth can be made and tracked with version control. One can use the codebase to determine if something's been decided, how it's been decided, and then suggest changes if they so choose, rather than doing something like asking everyone in a general Slack channel what the norm is.

But that still leaves you with deciding who decides what, when, how. It's decisions all the way down.

## Conclusion

So there you have it, my recipe for agentic-coding-driven success. I believe it's entirely possible today for businesses and individuals to invest in specific areas which will likely improve the effectiveness of AI coding tools now and going forward, and will definitely improve the effectiveness of their engineers and organization. No wheels need to be reinvented; these strategies mitigate risk by having proven solutions and benefits. The worst that could happen is developers are able to move faster on their own.

Still, it would be better if there were demonstrable, verifiable agentic benefits, with more specific guidance, to better justify major initiatives like modularizing a codebase. That's what I'm working toward now and when I have these results and answers, I'll be posting them right here.

Thanks for reading!
