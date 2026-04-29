import { HeroCard }            from "./_components/sections/hero-card"
import { EducationSection }   from "./_components/sections/education-section"
import { EducationRightCard } from "./_components/sections/education-right-card"
import { SocialCubes }        from "./_components/sections/social-cubes"

export default function Home() {
  return (
    // 300vh — first 100vh lifts hero, second 100vh lifts education right panel
    <div className="bg-[#07070f]" style={{ height: "300vh" }}>

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

    </div>
  )
}
