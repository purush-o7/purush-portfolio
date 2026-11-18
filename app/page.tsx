import { HeroCard }            from "./_components/sections/hero-card"
import { EducationCard }      from "./_components/sections/education-card"
import { ProjectsSection }    from "./_components/sections/projects-section"
import { ExperienceSection }  from "./_components/experience"
import { SkillsSection }      from "./_components/skills"
import { JourneySection }     from "./_components/sections/journey-section"
import { FooterSection }      from "./_components/sections/footer-section"
import { ScrollSnap }         from "./_components/scroll-snap"
import { SectionNav }         from "./_components/section-nav"
import { DEMO_CARDS }         from "./_components/journey/data"
import { EXP_START_SNAP, EXP_STOPS } from "./_hooks/snap-map"

// hero, education, projects, skills, then one snap per experience stop (see _hooks/snap-map.ts)
// + 1 journey gateway + 1 snap per project weight + 1 footer
const SECTIONS = EXP_START_SNAP + EXP_STOPS + 1 + DEMO_CARDS.length + 1

export default function Home() {
  return (
    <div className="bg-[#07070f]">

      <ScrollSnap sections={SECTIONS} />
      <SectionNav />

      {Array.from({ length: SECTIONS }, (_, i) => (
        <div key={i} style={{ height: "100vh" }} />
      ))}

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
      <FooterSection triggerVh={SECTIONS - 1} />

    </div>
  )
}
