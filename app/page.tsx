import { HeroCard }            from "./_components/sections/hero-card"
import { EducationCard }      from "./_components/sections/education-card"
import { ProjectsSection }    from "./_components/sections/projects-section"
import { ExperienceSection }  from "./_components/experience"
import { SkillsSection }      from "./_components/skills"
import { JourneySection }     from "./_components/sections/journey-section"
import { FooterSection }      from "./_components/sections/footer-section"
import { ScrollSnap }         from "./_components/scroll-snap"
import { SectionNav }         from "./_components/section-nav"

export default function Home() {
  return (
    <div className="bg-[#07070f]">

      <ScrollSnap />   {/* also renders the scroll spacers: one 100vh block per snap */}
      <SectionNav />

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

      {/* ── Journey (gravity wells + wormhole) — revealed as Experience leaves ── */}
      <JourneySection />

      {/* ── Footer — peacock canvas + contact, last snap ─────────────────── */}
      <FooterSection />

    </div>
  )
}
