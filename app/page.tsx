import { HeroCard }            from "./_components/sections/hero-card"
import { EducationCard }      from "./_components/sections/education-card"
import { ProjectsSection }    from "./_components/sections/projects-section"
import { ExperienceSection }  from "./_components/experience"
import { SkillsSection }      from "./_components/skills"
import { ProjectsReel }       from "./_components/projects/ProjectsReel"
import { FooterSection }      from "./_components/sections/footer-section"
import { PageScroll }         from "./_components/page-scroll"

export default function Home() {
  return (
    <div className="bg-[#07070f]">

      <PageScroll />   {/* the scroll budget: one 100vh spacer per screen. Scrolling is fully native. */}

      {/* ── Education (ID card) — revealed as the hero lifts; Projects slide over it ── */}
      <EducationCard />

      {/* ── Hero card — lifts on scroll 0 → 100vh ──────────────────────── */}
      <HeroCard />

      {/* ── Projects (KovilLens) — slides up on scroll 100vh → 200vh ───── */}
      <ProjectsSection />

      {/* ── Skills — slides up on scroll 200vh → 300vh ───────────────── */}
      <SkillsSection />

      {/* ── Experience — metro line, one snap per stop ─────────────────── */}
      <ExperienceSection />

      {/* ── Projects reel — the clips slide sideways while the page scrolls; revealed as Experience leaves ── */}
      <ProjectsReel />

      {/* ── Footer — peacock canvas + contact, last snap ─────────────────── */}
      <FooterSection />

    </div>
  )
}
