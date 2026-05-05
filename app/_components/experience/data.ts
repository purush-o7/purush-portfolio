export interface ExperienceEntry {
  role:      string
  org:       string
  period:    string
  duration:  string
  location?: string
  tag:       string
  accent:    string
  tech:      string[]
  bullets:   string[]
  metrics?:  { value: string; label: string }[]
}

// Oldest → newest (Cloud first, MaTrack last)
export const ALL_ENTRIES: ExperienceEntry[] = [
  {
    role:     "Cloud Computing Intern",
    org:      "FutureSkills Prime",
    period:   "Mar – Jun 2022",
    duration: "4 mo",
    tag:      "Cloud / Azure",
    accent:   "#3B82F6",
    tech:     ["Azure ML", "Django", "React", "Azure Functions", "Azure SQL", "Blob Storage"],
    bullets:  [
      "Built talkToLocals — end-to-end cloud-native traveller–guide matchmaking platform",
      "Integrated Azure ML recommendation models, boosting communication efficiency by 30%",
      "Deployed across five Azure services: App Services, Functions, SQL, Blob Storage, ML",
    ],
  },
  {
    role:     "Research Intern",
    org:      "Amrita Centre for WNA",
    period:   "Feb – May 2023",
    duration: "4 mo",
    tag:      "Mixed Reality",
    accent:   "#8B5CF6",
    tech:     ["Unity", "HoloLens 2", "MRTK", "C#"],
    bullets:  [
      "Integrated photogrammetric 3D reconstruction of Moovar Kovil into HoloLens 2",
      "Solved stable spatial anchoring under varying lighting and room geometries",
      "Optimised scene rendering from ~15 fps to a smooth 60 fps on HoloLens hardware",
      "Contributed directly to the ICVR 2025 published research paper",
    ],
  },
  {
    role:     "Software Engineer Intern",
    org:      "Amrita Vishwa — ICTS",
    period:   "Jan – May 2023",
    duration: "5 mo",
    tag:      "Healthcare AI",
    accent:   "#10B981",
    tech:     ["Llama-2-7B", "PyTorch", "Frappe", "NLP", "SQL"],
    bullets:  [
      "Fine-tuned Llama-2-7B on ~3,000 neonatal patient attributes (+22% accuracy)",
      "Built NL-to-SQL query engine enabling clinicians to retrieve records 3× faster",
      "Implemented patient similarity clustering, speeding early diagnosis by 40%",
      "Automated data-entry pipeline reducing documentation burden by 35%",
    ],
  },
  {
    role:     "Teaching Assistant",
    org:      "Amrita School of Computing",
    period:   "Nov 2023 – Mar 2024",
    duration: "5 mo",
    location: "Amritapuri, Kerala",
    tag:      "Education",
    accent:   "#F59E0B",
    tech:     ["Python", "Data Structures", "Algorithms"],
    bullets:  [
      "Supported faculty delivering programming courses to undergraduate cohorts",
      "Ran weekly lab sessions and one-on-one Python mentorship",
      "Sharpened first-principles communication skills — carried directly into MaTrack technical documentation and ICVR 2025 research presentation",
    ],
  },
  {
    role:     "Associate Software Engineer",
    org:      "MaTrack Inc.",
    period:   "Mar 2024 – Jan 2026",
    duration: "1 yr 11 mo",
    location: "San Francisco · Remote",
    tag:      "Enterprise SaaS",
    accent:   "#00FFFF",
    tech:     ["FastAPI", "PHP", "Twilio", "SendGrid", "Docker", "AWS", "JavaScript"],
    bullets:  [
      "Designed multi-tenant CRM with full data isolation for U.S. fleet dealerships",
      "Built event-driven comms engine (calls, email, payments) — cut manual work by 60%",
      "Architected bulk CSV import + onboarding automation, boosting engagement by 30%",
      "Unified dealer portal replacing four separate tools across hundreds of users",
    ],
    metrics: [
      { value: "+40%", label: "Efficiency" },
      { value: "−60%", label: "Manual comms" },
      { value: "+30%", label: "Engagement" },
    ],
  },
]
