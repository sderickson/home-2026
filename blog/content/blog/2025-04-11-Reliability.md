# Reliability

_April 11, 2025_

If there's one question I'm trying to answer right now, it's how much LLMs can do to expedite and make more accessible creating complex web apps. I'm talking web apps with 3rd party integrations, background processes, webhooks, public APIs and more, as well as all the supporting features a web developer expects to have when developing and maintaining such products. Analytics, alerts, feature gates, CI/CD, quality metrics, all kinds of automated tests, etc. There's no doubt that LLMs can help anyone write scripts and simple products, and that they can speed up the work of an experienced developer on a large project. But could they allow a non-developer to build a complex product? Or an experienced developer build an entire product in weeks or days?

I think it comes down to reliability. Specifically:

1. How reliable **can** the LLM be?
2. How reliable do they **need** to be?

Let's start with the second one.

## Reliability Models

LLMs bring out a wide range of reactions and opinions in people. Some say it just will help developers be more productive, others say it will completely replace them and even bring about the singularity. I wonder how much of this comes down to a disparity in how "good" people think LLMs need to be. There are a couple ways, or mental models, that one could think about it...

### The "Web Stack" Model

In web development for your typical product, the software is broken down into a series of layers. At the bottom you have things like the operating system or the database, which are very stable and dependable. As you work your way up, you get to the top of the backend with API endpoints, and finally the frontend which is the product itself, or the one most users see anyway. For a user, if you use the product on a given day, you'll likely navigate through several pages, each of which have multiple features. Each of those features call multiple backend endpoints, which in turn each depend on multiple lower level services and machines, fanning out in all directions.

Just one visible breakage during a single visit to a website makes it seem unreliable, undermining your trust in the whole enterprise.

So, if you're building a web app, you might aim to have no more than 1% of users to see _any_ breakages during a visit. That's 99% reliability. But given that each visit exposes users to multiple features, hitting lowest level services like the database or operating system a thousand different ways, those lower level services need to be 99.999% reliable. _At least_.

Self-driving cars are another good example of this. If a salesperson says your new car can drive you from San Francisco to New York on its own reliably, you're not likely to take that assertion for granted. You try out the self-driving mode and remain as alert as if you were driving it, to make sure it doesn't crash. Only after you've observed it _not_ swerve into oncoming traffic and _not_ run red lights or stop signs and _not_ ignore the speed limit for some period of time, will you start to trust it. And it only takes one mistake for you to lose all that trust. Self-driving cars need to be extremely reliable with every small aspect of driving at all times for you to put your life in its "hands" for long hauls.

_Building_ a web product can be broken down similarly, with similar ramifications, albeit without the threat of injury or death. In order to build a good product, you need to make good features. To build good features, you need to build good services and pages, and for those you need good routes and components and storage solutions and background processing and backups and analytics, etc. Building each of _those_ require a series of tasks successfully completed. So, in order for an LLM to build a good product 99% of the time, it needs to do any given task well 99.999% of the time, as a good product means doing a thousand tasks.

If this is the right way to think about reliability for LLMs, then we're a good way off from them magically building complex products. At _best_ I give an LLM a task and it does it right a third of the time. I want to be able to tell the LLM to create an endpoint or test a component and be surprised when I need to intervene. Otherwise I'll always be on guard, double and triple checking everything it does, lest it drive my product off a cliff.

### The "Spaced Repetition" Model

There is another mental model, though, where the optimal success rate is actually lower than you'd expect.

The year me and my cofounders graduated and we were planning our first company, a [Wired article](https://www.wired.com/2008/04/ff-wozniak/) had a big effect on us. We were starting to build [Skritter](https://skritter.com/), a tool for learning Chinese and Japanese characters. It was built on two principles: [active learning](https://en.wikipedia.org/wiki/Active_learning), and [spaced repetition](https://en.wikipedia.org/wiki/Spaced_repetition). Active learning meant the user would actively write the character to practice it (as opposed to passively recognizing it), and spaced repetition meant they would practice at an exponentially decaying interval. Users learn a character one day, then practice the next, then in two days, then four, then a week, two weeks, a month, etc, all the way up to years. If at any point the user gets it wrong, that interval resets to 1 day. If you've used [Anki](https://apps.ankiweb.net/) they do this, too.

If you optimize for time-spent to characters-learned, it _turns out_ you want to succeed 80% of the time. More than that, and you're practicing more than you actually need. But, it can also be frustrating to fail so often, so for the sake of user happiness and retention, people default to and often target something more like a 90% success rate, even if it may not be the most time efficient.

Let's say LLMs do 90% of tasks correctly. They get something to _run_ almost 100% of the time, but 10% of the time they do something wrong, like they put product logic in platform code, or they build an unnecessary column to a database, or they don't handle a certain edge case, or they forget to add a test.

Assuming the LLM can fix 90% of _those_ mistakes when they're found or reported, then after a second pass 99% of tasks will have been done correctly. Another pass and it will be 99.9% correct, though at some point it's likely no number of passes will fix things, and the LLM will just be stuck in a loop and an engineer will need to intervene. Perhaps with each pass you pick a more expensive model, until even that one fails.

Still, a couple iterations to get ~99.9% of the product working and structured correctly is not too shabby. And it means you don't need to get 99.999% success rate on every single task in order for an LLM to likely build a reliable-enough product, eventually. You might even be able to optimize for AI spend and use a model which gets it right only 80% of the time, but like with the flashcards, you might annoy your users of they have to report a great many bugs, even if they go away quickly and automatically.

### Which is Right?

Well, it depends. On how organized you are.

If you build a complex web app normally, it's all too easy for it to become "spaghetti code". When grappling with some of that at Dropbox, one staff engineer said one needed "galaxy brain" to do anything with it; you had to understand the entire galaxy of products and their relationships to affect any small piece of it successfully. Change one thing and another would break in a way you never could have anticipated, unless you happened to know about it. It was a gnarly web to untangle, and it's not uncommon.

It's so much easier to end up with a tangled mess using LLMs; I have to stop it from doing so all the time. Without knowing what you're doing and a clear vision of the right division of things, you can get into scenarios where an LLM will break two things for every one it adds. Then fixing those will break more, and so on. At that point, you and your LLM are just spinning and not getting anywhere and it's a catastrophic and systemic failure that will take a great effort to get out of.

In that scenario, you need exceedingly high reliability from the LLM, as well as vast context windows, to build your house of cards a bit higher. But only a bit.

If, however, things are well organized and tested, with dependencies mapped and tested themselves, then you can isolate an issue to a single module and fix it, and if the dependencies break, either because the interface changed or they dependended on something that changed, (with the right mix of integration and e2e tests) then you can isolate those and fix those as well.

In that scenario, I believe your experience will be similar to that of the Spaced Repetition Model, where you can get away with a much lower rate of success (though it still needs to be high). If the module is incorrect, fix it. If two modules interact in the wrong way, fix them. If the module is getting too large or too broad, break it down. If an abstraction is no longer working, change it. That's way better than having no abstraction at all.

Anyway, that's a fair amount on how reliable LLMs need to be. What about the other side of the coin?

## How Reliable Can LLMs Be?

I don't have a super-wide range of experience with LLMs (I mostly just use what Cursor provides) but I think we're a ways still. I recently did some testing on a specific task: create a new typescript package in my monorepo. Just a stub. I'd give the agent the name of the desired package, the location I wanted it in, and a link to the [doc](https://docs.saf-demo.online/monorepo/docs/ts-packages.html), which has clear instructions. At first I worked with the agent to update the docs based on what they did wrong, but eventually I figured it wasn't going to get that much better than it already was (and the agent agreed). At that point I just repeatedly tried to have agents do the same work over and over, reverting each attempt. My experience was this:

1. Gemini: mostly correct, but would still forget one or two things. It would either:
   - forget to add the `vitest.config.ts`
   - generate dependencies when it should `npm install` them, or
   - not run `npm install` by itself first due to a quirk with how `npm` handles workspaces.
2. Claude: would make more mistakes than Gemini, and then go and do more erroneous work on top.
3. GPT-4: would just tell me what to do, but not actually do it. Possibly a bug with Cursor, will try again later.

Given this experience, I've switched from using Cursor's auto agent (which seems to rely heavily on Claude) to solely working with Gemini. It's slower, but I suspect higher reliability. One day I'll have to set up an eval so I'm not judging on feels. But none of these are at all near reliable enough even for the "Spaced Repetition Model".

Other than waiting for LLMs to get vastly better, what can we do to boost reliability? I have some ideas:

1. **Dev Tools**. The above example could probably just become an npm script. Why spell out steps when they can be automated? Make it simple for humans, and simple for LLMs.
2. **Guardrails**. Linters and typechecks and such. For example I'd really like the agent to stop importing ".js" files that don't exist. I don't transpile my code but it assumes I do.
3. **Industry standards**. If you're torn between two options, and the LLM tends to do it one way, go with that one. Or at least be choosy about when you go against the grain.
4. **Training**. Perhaps this is a good use case for a RAG. Can the agent use one which has been fed the documentation?

Ultimately, we'll need to meet in the middle. LLMs will need to continue to improve, and the codebases they work in will need to be more structured and testable. This will allow us to iterate towards correctness (the "Spaced Repetition" model) rather than requiring unattainable perfection on the first try (the "Web Stack" model). So for now I'm spending more of my time on my codebase and my [documentation](https://docs.saf-demo.online/). I'm defining the routines, building and pressure-testing a method of organization, and once that's in a good-enough place, I'll see if I can get the iterative approach to work. I'm cautiously optimistic; there's room for improvement yet.

Thanks for reading!
