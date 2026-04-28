import { HeroCard } from "./_components/sections/hero-card"
import { EducationSection } from "./_components/sections/education-section"

export default function Home() {
  return (
    // Double viewport height — first 100vh scrolls the hero card away,
    // second 100vh keeps the education section in view.
    <div className="bg-[#07070f]" style={{ height: "200vh" }}>

      {/* Education: fixed behind the hero, always visible once hero lifts */}
      <div className="fixed inset-0 z-10">
        <EducationSection />
      </div>

      {/* Hero: fixed on top, lifts away on scroll */}
      <HeroCard />

    </div>
  )
}
