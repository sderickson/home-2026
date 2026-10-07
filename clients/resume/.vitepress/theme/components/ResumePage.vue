<template>
  <article class="resume">
    <header class="resume-header">
      <div class="resume-header__identity">
        <h1 class="resume-header__name">Scott Erickson</h1>
        <p class="resume-header__contact">
          401-369-3026 | sderickson@gmail.com<br />
          Richmond California 94805
        </p>
      </div>
      <div class="resume-header__title">
        <p>Software Engineer</p>
      </div>
    </header>

    <p class="resume-headline">
      Optimizing company growth through product development, technical
      leadership, and quality management
    </p>

    <p class="resume-summary">
      Accomplished Software Engineering Manager with extensive experience and
      expertise delivering innovative software solutions. Proven track record of
      building and leading high-performing teams by prioritizing operational
      excellence, top talent acquisition, retention, and career development.
      Skilled at driving change by aligning strategic roadmaps with internal and
      external stakeholders.
    </p>

    <p class="resume-expertise">
      Areas of Expertise: Software Development • Project Management • Technical
      Leadership • Strategic Planning • Customer Relations • Process Improvement
      • Product Management • Team Building • Project Management • AI Development
      • Platform Infrastructure
    </p>

    <h2 class="resume-section">Career Progression</h2>

    <section
      v-for="role in roles"
      :key="role.company + role.title"
      class="resume-role"
    >
      <div class="resume-role__heading">
        <h3 class="resume-role__title">
          <template v-if="role.company"
            ><span class="resume-role__company">{{ role.company }}</span
            ><template v-if="role.url"
              >&nbsp;(<a
                class="resume-role__url"
                :href="role.url"
                target="_blank"
                rel="noopener"
                >{{ role.urlLabel }}</a
              >)</template
            >, <em>{{ role.title }}</em></template
          >
          <em v-else>{{ role.title }}</em>
        </h3>
        <p class="resume-role__dates">{{ role.dates }}</p>
      </div>
      <p v-if="role.intro" class="resume-role__intro">{{ role.intro }}</p>
      <ul class="resume-role__bullets">
        <li v-for="(bullet, i) in role.bullets" :key="i">{{ bullet }}</li>
      </ul>
    </section>

    <h2 class="resume-section">Technical Skills</h2>
    <ul class="resume-skills">
      <li>
        <span class="resume-skills__check" aria-hidden="true">✓</span>
        <strong>Languages:</strong> TypeScript, Python, Objective-C, Go, and
        Java.
      </li>
      <li>
        <span class="resume-skills__check" aria-hidden="true">✓</span>
        <strong>Tools:</strong> React, Vue, Node/Express, MongoDB, jQuery,
        Backbone, Django, Docker, SQLite, Google Cloud, Azure, Nginx, Vite,
        Rollup, Webpack, and others.
      </li>
    </ul>

    <h2 class="resume-section">Education</h2>
    <p class="resume-education">
      <em>B.A. in Computer Science (with High Honors)</em> Oberlin College,
      Oberlin, Ohio | 2008
    </p>
  </article>
</template>

<script setup lang="ts">
type Role = {
  company?: string;
  url?: string;
  urlLabel?: string;
  title: string;
  dates: string;
  intro?: string;
  bullets: string[];
};

const roles: Role[] = [
  {
    company: "Dropbox",
    title: "Engineering Manager",
    dates: "Jan 2022 – Dec 2024",
    intro:
      "Lead role managing concurrent tiger-teams of 4-6 engineers, while focused on new platforms and better architecture.",
    bullets: [
      "Led tiger team to create prototype for running web code natively on desktop, resolving long-standing disputes and unblocking development of code-sharing platform, resulting in increased product value and faster iteration on desktop.",
      "Successfully overhauled and reorganized code for the web, implementing new frameworks, resolving web-vital performance issues and resulting in enhanced developer velocity.",
      "Drove migrations across organizations, in particular adopting best tools and practices in frontend web development for performance, reliability, observability, portability, and developer velocity. This included React-Query, Jotai, a universal logging client, Sentry, and a custom-extended React-Router for modular development.",
      "Designed a 3rd party connector service to power Dropbox's new AI-focused Dash product. As part of this, laid out a plan to build off and evolve our existing 3rd party ecosystem platform.",
      "Engineering Interview Question Lead, recruiting and encouraging engineers across the company to write and improve interview question bank in service to career framework and evolving business needs, including hiring for AI expertise.",
      "Received the highest possible rating in most recent 360-review, for scope, impact, and quality of contributions to Dropbox.",
    ],
  },
  {
    title: "Technical Lead",
    dates: "Jan 2018 – Dec 2022",
    intro:
      "Gained valuable experience as Technical Lead on multiple growth and new-platform teams for a range of web, desktop, and server-side features, including multi-faceted and business-critical features.",
    bullets: [
      "Designed and strategized a plan for 8 engineers to build a host of services to integrate with 3rd party platforms for Dropbox's transition to an AI-first company.",
      "Worked as an early adopter of new Revenue APIs and libraries, providing feedback to those developers.",
      "Discovered disparate expectations, leading to a multi-year process of reworking and adopting the new platform, by being an early adopter of the APIs, resulting in cost-saving and critical improvements for the business.",
      "Designed and lead early development of an ad system and a workflow engine.",
      "Owned and drove site performance initiatives, including working closely with the platform team owning the APIs.",
    ],
  },
  {
    company: "CodeCombat",
    url: "https://codecombat.com",
    urlLabel: "codecombat.com",
    title: "Cofounder / Engineering Lead",
    dates: "Jan 2013 – Dec 2018",
    intro:
      "Led initiatives to modernize the codebase, including moving from callbacks to using Promises with yield, and switching from Backbone.js and mediator events to Vue.js and Vuex. Laid and iterated technical foundation, improving developer velocity and reducing bugs.",
    bullets: [
      "Extended product with classroom edition, adding classroom management, licensing, and professional development features.",
      "Ran product team, managed team members and process.",
      "Owned, maintained, documented and improved AWS infrastructure and MongoDB clusters.",
      "Designed coding exercises and screened dozens of engineers.",
      "Built educational coding game, frontend and backend, including game graphics, level versioning, and various editors, enabling rapid prototyping and extensive open-source contributions.",
    ],
  },
  {
    company: "Skritter",
    url: "https://skritter.com",
    urlLabel: "skritter.com",
    title: "Cofounder",
    dates: "Jan 2008 – Dec 2013",
    intro:
      "Built an educational mobile app teaching Chinese, frontend and backend, with scheduling, study, and vocabulary list management.",
    bullets: [
      "Significantly improved product via iterative processes, including running UX tests, updating and adding features, and setting up subscription payments, making the company self-sustaining.",
      "Filled multiple roles, including sysadmin, customer support, salesperson, accountant, and chef.",
      "Built a product development team of 9, continuing to advise them as they grew the company and expanded the product.",
    ],
  },
];
</script>

<style scoped>
.resume {
  --resume-ink: #2a2a2a;
  --resume-dark: #323e4f;
  --resume-grey: #d9d9d9;
  --resume-muted: #4a4a4a;
  --resume-page: #ffffff;

  box-sizing: border-box;
  max-width: 8.5in;
  margin: 0 auto;
  padding: 0 0 1.5rem;
  color: var(--resume-ink);
  background: var(--resume-page);
  font-family:
    Carlito,
    Calibri,
    "Segoe UI",
    "Helvetica Neue",
    Arial,
    sans-serif;
  font-size: 10.5pt;
  line-height: 1.28;
}

.resume *,
.resume *::before,
.resume *::after {
  box-sizing: border-box;
}

.resume-header {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  min-height: 1.35in;
}

.resume-header__identity {
  background: var(--resume-dark);
  color: #fff;
  padding: 0.55rem 0.75rem 0.65rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.resume-header__name {
  margin: 0;
  font-size: 28pt;
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: 0.01em;
}

.resume-header__contact {
  margin: 0.35rem 0 0;
  font-size: 10.5pt;
  line-height: 1.3;
  font-weight: 400;
}

.resume-header__title {
  background: var(--resume-grey);
  color: var(--resume-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  text-align: center;
}

.resume-header__title p {
  margin: 0;
  font-size: 22pt;
  font-weight: 600;
  line-height: 1.15;
}

.resume-headline {
  margin: 0.55rem 0.85rem 0.4rem;
  text-align: center;
  text-transform: uppercase;
  font-size: 9.5pt;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #5a6a7a;
  line-height: 1.25;
}

.resume-summary {
  margin: 0 0.85rem 0.45rem;
  text-align: justify;
  font-size: 10pt;
}

.resume-expertise {
  margin: 0;
  padding: 0.35rem 0.85rem;
  background: var(--resume-grey);
  font-size: 9.25pt;
  line-height: 1.35;
  color: var(--resume-ink);
}

.resume-section {
  margin: 0;
  padding: 0.22rem 0.75rem;
  background: var(--resume-dark);
  color: #fff;
  font-size: 12pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.resume-role {
  padding: 0.45rem 0.85rem 0.15rem;
}

.resume-role__heading {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
}

.resume-role__title {
  margin: 0;
  font-size: 11pt;
  font-weight: 400;
  line-height: 1.25;
}

.resume-role__company {
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.resume-role__url {
  color: inherit;
  font-weight: 400;
  text-decoration: none;
}

.resume-role__url:hover {
  text-decoration: underline;
}

.resume-role__dates {
  margin: 0;
  flex-shrink: 0;
  font-size: 10.5pt;
  font-weight: 700;
  white-space: nowrap;
}

.resume-role__intro {
  margin: 0.15rem 0 0.2rem;
  font-size: 10pt;
}

.resume-role__bullets {
  margin: 0;
  padding: 0 0 0 1.15rem;
  list-style: none;
}

.resume-role__bullets li {
  position: relative;
  margin: 0 0 0.18rem;
  padding-left: 0.15rem;
  font-size: 10pt;
}

.resume-role__bullets li::before {
  content: "▪";
  position: absolute;
  left: -0.95rem;
  top: 0;
  font-size: 9pt;
  line-height: 1.28;
}

.resume-skills {
  margin: 0;
  padding: 0.45rem 0.85rem 0.55rem 1.35rem;
  list-style: none;
}

.resume-skills li {
  position: relative;
  margin: 0 0 0.2rem;
  font-size: 10pt;
}

.resume-skills__check {
  position: absolute;
  left: -1.05rem;
  color: #1a7a3a;
  font-weight: 700;
}

.resume-education {
  margin: 0;
  padding: 0.55rem 0.85rem 0.75rem;
  text-align: center;
  font-size: 10.5pt;
}

@media (max-width: 720px) {
  .resume-header {
    grid-template-columns: 1fr;
  }

  .resume-header__name {
    font-size: 24pt;
  }

  .resume-header__title p {
    font-size: 18pt;
  }

  .resume-role__heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.1rem;
  }

  .resume-headline,
  .resume-summary,
  .resume-expertise,
  .resume-role,
  .resume-skills,
  .resume-education {
    padding-left: 0.65rem;
    padding-right: 0.65rem;
  }

  .resume-headline,
  .resume-summary {
    margin-left: 0.65rem;
    margin-right: 0.65rem;
  }
}

@media print {
  .resume {
    max-width: none;
    padding: 0;
  }
}
</style>
