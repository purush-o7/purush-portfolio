import { HeroCard }            from "./_components/sections/hero-card"
import { EducationSection }   from "./_components/sections/education-section"
import { EducationRightCard } from "./_components/sections/education-right-card"
import { CareerTimeline }     from "./_components/sections/career-timeline"
import { ProjectsSection }    from "./_components/sections/projects-section"
import { ExperienceSection }  from "./_components/experience"
import { CylinderSection }    from "./_components/sections/cylinder-section"
import { FooterSection }      from "./_components/sections/footer-section"
import { ScrollSnap }         from "./_components/scroll-snap"
import { SectionNav }         from "./_components/section-nav"
import { DEMO_CARDS }         from "./_components/cylinder/cards/data"

// 9 fixed snaps (0–8: nav + experience + cylinder reveal)
// + 1 approach snap + 1 snap per orbit card + 1 footer
const SECTIONS = 9 + DEMO_CARDS.length + 1 + 1

export default function Home() {
  return (
    <div className="bg-[#07070f]">

      <ScrollSnap sections={SECTIONS} />
      <SectionNav />

      {Array.from({ length: SECTIONS }, (_, i) => (
        <div key={i} style={{ height: "100vh" }} />
      ))}

      {/* ── Campus art — top 50% on mobile, full-height left 60% on md+ ── */}
      <div className="fixed top-0 left-0 bottom-1/2 md:bottom-0 w-full md:w-3/5 z-10">
        <EducationSection />
      </div>

      {/* ── Career timeline — self-positioned, bottom 50% mobile / right 40% desktop ── */}
      <CareerTimeline />

      {/* ── Education right panel — lifts on scroll 100vh → 200vh ──────── */}
      <EducationRightCard />

      {/* ── Hero card — lifts on scroll 0 → 100vh ──────────────────────── */}
      <HeroCard />

      {/* ── Projects (KovilLens) — slides up on scroll 200vh → 300vh ───── */}
      <ProjectsSection />

      {/* ── Experience — slides up on scroll 300vh → 400vh ─────────────── */}
      <ExperienceSection />

      {/* ── Cylinder — revealed on scroll 400vh → 500vh ─────────────────── */}
      <CylinderSection />

      {/* ── Footer — peacock canvas + contact, last snap ─────────────────── */}
      <FooterSection triggerVh={SECTIONS - 1} />

    </div>
  )
}
