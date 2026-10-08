# Accountability and Gaslighting

_May 24, 2025_

I'm trying to make sense of what I see and hear around how AI tools are transforming the software industry, and I keep coming back to the term "gaslighting".

I experience it first-hand in marketing, when looking at products and services. Landing pages that claim a product will boost your productivity by some multiple, throw everything together for, and make all sorts of work a breeze. I think, am I using the right set of tools? Am I off in how I'm using them? There's a gap between what these sites promise and what my sense is of what these tools are actually capable of, but I wonder if I'm missing something; I spend a good deal of time figuring out how to cajole agents to end up with something close to what I want.

Gaslighting also seems to be happening (or so I read and hear) for people in organizations that are pushing AI tools on the rank-and-file. Managers and business leaders who require engineers use AI tools for their work and build more faster with fewer people. It seems highly unlikely these higher-ups have personally seen these productivity gains for themselves, and so are demanding or at least expecting things of their engineers without being grounded in past experience. I expect they're driven by the need to pursue cost reduction and seek out any competitive advantage they can and they'd be irresponsible not to, but these market forces lead to a weird dynamic.

And the promises don't *really* pan out. Tools work less effectively outside of small prototypes or personal projects, the quality of code doesn't justify the API key bills, the agent makes things worse not better, and while features *are* shipped faster, the codebase is deteriorating at a worrying pace. But as engineers we're driven by management, the need to stay relevant, or just plain FOMO to suspend our disbelief and hold onto the idea that these tools really *can* do what we're told they can do.

That's why I call it gaslighting. I get it, these products need to sell, and these leaders need to keep up with the market, but it's all leading to a gap between what engineers are told and what they see and understand, which causes distrust and dismissal of these tools, how they're changing how we do our jobs, and those pushing these tools.

Don't get me wrong, I *do* know these tools are quite capable of making software faster than ever, and *can* be used in a way that doesn't consign future maintainers to vibe-coded hell or rebuilding from scratch. Stick with me here, but I think a large piece of what's missing in this credibility gap is accountability, at every level.

Let's go level-by-level.

## Agent Accountability

This is probably the most obvious: agents need to be held accountable for what they do and produce. The agent might *say* it read the docs, or tested the new code thoroughly, but all too often it did not. One way or another, code whether generated or written needs to adhere to best practices, handle edge cases, avoid unnecessary complexity, account for legacy systems, be reliable and performant, and include test cases, documentation, and code comments. When these things are not done, even when prompted initially to do so, the agent needs further prompting that it must *actually* do so to move forward. This is time-consuming and, after a few times, frustrating.

However, this prevalent cost seems to be elided over when people talk about the value and promise of LLMs and their rapidly-evolving ecosystem of tools and services. Agents don't automatically and reliably do the Right Thing, whatever you think that is. That's not really something one could expect of them anyway; they can't read your mind and know everything important to you or the org and why. Humans forget things all the time, that's why we have checklists. But the agent coding tools don't seem to have accountability features or guidance or verifiable checklists; they more focus on providing correct and efficient direction and context and hope the agents use them effectively, and then as backup count on the human user to hold the agent accountable as the human in the loop.

I don't think reminding the agent over and over to actually adhere to standards and processes which were already stated is what people would like to think "being in the loop" means.

For my part, I'm experimenting with a workflow tool using [XState](https://stately.ai/docs) (a finite state machine library) that gradually prompts an agent through a series of steps and I'm going to include accountability checks along the way. These will disallow the agent from moving forward if tests don't pass, TODOs still exist, typechecking fails, or anything else which can be validated automatically. I'll use [XState guards](https://stately.ai/docs/guards) (for sync checks) and [invoking promises](https://stately.ai/docs/invoke#invoking-promises) (for async checks); these prevent or alter transitions based on what they return. Whenever I experience an agent skipping a step or cutting corners, I'll just add more automated checks.

## Developer Accountability

In the end it's not the agent's responsibility to always *produce* something correct, it's the developer's responsibility to make sure what is *committed* is correct (enough). It's the engineer's responsibility to review output and correct errors that the agent (or agent tool) hasn't already fixed.

Not much has changed here; a well functioning team, and in particular the manager, holds members accountable for what they contribute. The only change is that it's much easier and faster for things to go sideways. Before LLMs engineers were perfectly capable of shipping product that sort of worked without fully understanding (enough) everything involved, now just moreso.

If there's something that's changed here, it's the need for a more scalable review process. There's no way around it; if you want to produce more code and features faster, you have two options: review what's produced less thoroughly, or review it more efficiently. If you've got a team of twelve engineers each changing a hundred files every day, no tech lead or manager can keep up with that.

In lieu of checking every line of code, I recommend reviewers for large changes focus on (and require be included):

* A spec (or PRD)
* A plan (checklist)
* Interface changes
* Test changes

A spec and a plan are useful anyway when building the product, as those can be used as context for the agent. Any large-enough change will result in new or extended test cases, library interfaces, schemas, and/or APIs. Combined, these will be a small part of any given PR, but provide the forest-over-the-trees perspective. And reviewers can always dive into specific code that should be looked at in finer detail.

To parallelize as much as possible it might look like this:

1. Developer writes a spec and a plan in a draft PR.
2. Reviewer reviews that spec before or while developer starts executing.
3. Developer finishes execution, updating the spec and plan along the way based on feedback and pivots, and creates a large PR.
4. Reviewer reviews updated spec, plan, interfaces, and tests, as well as digs into code hot spots.
5. Developer handles feedback, lands changes

In the end, everyone involved is reasonably certain it was done so responsibly, and the blast radius of anything going wrong is minimized, without having to review every line. It's probably not enough on its own though; other industry-standard guardrails such as static analysis in CI, metrics paired with alerts, and agents reviewing code will also help keep developers accountable to their PRs.

## Manager Accountability

So you're a manager, you own some areas of the codebase, and it's your responsibility to take care of it. How do you and your manager and everyone on up know if you're meeting that responsibility?

I think it's mainly got to be good metrics. Are the pages, applications, user journeys, and services you own reliable, fast, and overall healthy? Do the packages you own have good test coverage and aren't too bloated? Are updates and changes shipping quickly? As a manager you probably can (and should) carve out time to get more annecdotal evidence directly from your team and their work, but higher ups can't and shouldn't do that. So you need numeric signals and people who follow up on them. As well as processes such as incident and 360 reviews.

Again, barring some major shift, the same rules that have applied historically still do. A well-functioning organization needs the right metrics and functioning processes in order for issues to be addressed and improved upon. Even with LLMs on the scene, the tools that the industry developed over decades still apply, and the main things that have changed are:

* the size of the opportunities
* the scale of the problems, and
* how critical the solutions are

On the other side of the coin, for managers to hold their direct reports who are engineers accountable effectively, it seems like they will need to spend some time with these tools themselves. You can be told what it's like trying to convince an agent to do what you want but it's hard to be an authority and coach on something you haven't done yourself.

## Takeaways

I wrote this for myself because I noticed my own cognitive dissonance in looking at tools out there and reading what they can do. I've been working full time with LLMs for five months now and while I'm impressed and eager and expecting to unlock more potential from this stuff, my experience hasn't matched the hype. So I'm trying to make sense of what's real vs what's said, and what one needs to do to bridge the gap and how much of it can actually *be* bridged. The above is my current mental model that is the best way I can explain things.

**So what I'm doing, and what I recommend other engineers do**, is to use accountability as a litmus test for whatever agentic coding tool I'm curious about. If the tool does not provide a way to hold the agent accountable for what it generates, then I automatically assume that tool is fundamentally limited, and simply **cannot** deliver on certain promises. This helps counter gaslighting marketing and stave off impostor syndrome and FOMO in a low-effort, reasonably accurate way.

**If you're building one of these LLM-driven tools** for software development, in order to bridge the credibility gap, have an answer to how to hold that the agent it interfaces with accountable, ideally in an automated way. You can't really build all necessary accountability directly *into* your product since different things matter to different people and organizations, and go about testing them in different ways, but you can provide hooks and guides to users on how to integrate their own accountability systems and checks (static analysis, automated tests, etc.) into your workflow.

**If you're a line manager**, it *probably* makes sense to do a tour of duty as an individual contributor for a stint, now or in the near future. Your ability to hold others accountable is tenuous when you can't relate to what they're doing in their day-to-day, and your sense of what's easy and what's hard is out of date. And it's probably a great time to retro your team processes on the regular for how to streamline accountability, such as code reviews.

**If you're a higher-up** trying to figure out how to best make use of these tools, delegate that task to all teams which own developer tools and platforms. Talk to the ones who have authority over how servers gets deployed, pages added, components composed, code tested, stacks blessed, libraries installed, or services integrated. Those are the folks who should figure out how and when they believe their fellow developers will best use their platforms in conjunction with agents. Its not efficient to try to have those *using* the platforms to each figure out how to adapt the platform to whatever agentic coding tools the company has built or bought into.

And of course, invest in those company-wide systems of accountability. Figure out how to measure (and make measurable) the code and systems that the business relies on. Otherwise there's a very real risk the foundation the business is built on is getting undermined in all the rush.