import { HeroCard }            from "./_components/sections/hero-card"
import { EducationSection }   from "./_components/sections/education-section"
import { EducationRightCard } from "./_components/sections/education-right-card"
import { SocialCubes }        from "./_components/sections/social-cubes"
import { ProjectsSection }    from "./_components/sections/projects-section"
import { ScrollSnap }         from "./_components/scroll-snap"

export default function Home() {
  return (
    <div className="bg-[#07070f]">

      <ScrollSnap />

      {/* 400vh scroll driver — four 100vh blocks give window.scrollY its range */}
      <div style={{ height: "100vh" }} />
      <div style={{ height: "100vh" }} />
      <div style={{ height: "100vh" }} />
      <div style={{ height: "100vh" }} />

      {/* ── Campus art + zigzag border — fixed left 60% ──────────────────── */}
      <div className="fixed top-0 left-0 bottom-0 w-3/5 z-10">
        <EducationSection />
      </div>

      {/* ── Social cubes — fixed right 40% ───────────────────────────────── */}
      <div className="fixed top-0 right-0 bottom-0 w-2/5 z-10">
        <SocialCubes />
      </div>

      {/* ── Education right panel — lifts on scroll 100vh → 200vh ────────── */}
      <EducationRightCard />

      {/* ── Hero card — lifts on scroll 0 → 100vh ────────────────────────── */}
      <HeroCard />

      {/* ── Projects — slides up on scroll 200vh → 300vh ─────────────────── */}
      <ProjectsSection />

    </div>
  )
}
