# Agentic Stacks

_September 15, 2026_

Over the last couple years, I've seen the greatest improvements in my agentic coding not from new models or updated tools provided by companies like Anthropic or Cursor, but from direct integrations with and improvements to my own stack: the deterministic scripts and libraries that harness these agents for the specific technologies and products I work on.

I figured out early on that coding agent success was as much about the software stack you build on as the model or coding tool you build with. Agents had to be set up for success, not just with good prompts but with good architecture, high quality libraries and services, all well glued together. So I started building out my preferred web stack, shaping it based on what I saw helping or hindering coding agents.

I think this kind of stack deserves its own name: an “agentic software stack”. It's an opinionated stack paired with non-agentic tooling that guides both agents and engineers. In order for models to run for a long time with less monitoring and good results, a system with guardrails, guidance, norms, and transparency is essential.

First and foremost, an agentic stack needs to be opinionated and clear on how to build things so that agents and engineers can do their jobs. What these correct ways are exactly depends on what you're building, what technologies you've chosen, and your own opinions, but there are [some common rules](https://docs.saf-demo.online/best-practices.html) that I think any code written in an agentic stack would need to follow, including:

- Use types, so broken code fails fast instead of at runtime
- Add unit tests, so agents can pair specifications with automated checks
- Specify and enforce your interfaces, so engineers can easily review and trust them
- Break everything into small files, so agents read and change less to do a task, and less gets broken by accident
- Keep code modular, so an agent doesn't need too much of the codebase in context to work on one part of it

None of this is new advice. What's new is the reason: each rule guards against broken code, reduces the tokens and time spent reading and updating files, or makes it easier for an engineer to review what an agent has done.

Once I started identifying the impact of these best practices, the next bottleneck was getting agents to actually follow them consistently, and to address that I built a [workflow tool](https://workflows.saf-demo.online/). For any often-repeated task (add an API endpoint, database query, or new page to the SPA), an agentic stack needs a reference structure, clear procedure, and set of checks for adding one of that thing. Otherwise you waste time and tokens relitigating among your teammates, reminding yourself, and reiterating to the agent what you want, and then checking that it was all done correctly. A deterministic script at the top serving as the source of truth, generating boilerplate, running checks, and kicking failures back to the agent automatically saved a bundle of time. It's also more certain, faster, and cheaper than having an agent do everything listed in, say, a markdown file.

I was able to go fairly far just on best practices and the workflow tool this past year, but now there's a new bottleneck: maintaining my understanding of the codebase. For a while the stack's structure made the parts I wanted to review easy to find, and I could skim large PRs for what I knew to be the key bits. But now the applications and changes I've been making have gotten so big that git and the GitHub UI can't handle them well. Changes can easily be hundreds or thousands of files, thousands or tens of thousands of lines of code, and the largest application I've built has six thousand test cases and a half a million lines of code. That's a lot of forest to keep track of, and with the ease of creating new code, I expect it's a common bottleneck in the industry right now.

So, the next thing I'm working on for my agentic stack is a tool to isolate and present only the key information about a codebase, or changes to it, for review. I call it the [dev-site](https://docs.saf-demo.online/dev-site/docs/01-overview.html); it's a web application itself where I can look at a commit, or compare two commits, and see only key bits like database schemas, package dependencies, test specs, API specifications, and frontend components. It also condenses and collates important information, such as frontend consumers and backend dependencies of an API, which would otherwise be scattered across dozens of files.

Now, one obvious solution to this problem created by AI-driven development is more AI. You could ask an agent to scan changes between two commits and summarize these specific things I care about. Products like [CodeRabbit](https://www.coderabbit.ai/) provide this feature so you don't have to write your own PR descriptions. To me this approach is fine but has some drawbacks:

- It's kind of redundant. Agents do a fine job summarizing work they do, and so adding another summary to read for a PR often yields little new information that you haven't already seen while you were making the changes.
- For a thorough and concise review, I want just the facts. I want to interpret and understand the code changes themselves, rather than having that work done for me, so I can build and maintain deeper understanding and continue to be effective myself.

That's the pattern I keep landing on. Each time agentic development created a new bottleneck, the fix was a non-agentic tool: best practices, then the workflow tool, now the dev-site. Each one takes contextual and cognitive load off agents and engineers so they can focus on their roles and what they do best.

If you're interested in trying out my agentic stack, I've just pushed a whole bunch of updates and an [overhaul of the documentation](https://docs.saf-demo.online/), so now's a good time to take a look. I'll post again when the dev-site is at a good place.
