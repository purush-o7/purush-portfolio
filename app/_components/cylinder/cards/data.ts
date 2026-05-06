export interface CardData {
  title:  string
  tag:    string
  link:   string
  desc:   string
  accent: string
  points: [string, string, string, string]
  tech:   string[]
}

// Projects first, awards last
export const DEMO_CARDS: CardData[] = [

  // ── Projects ────────────────────────────────────────────────────────────────

  {
    title:  "KovilLens",
    tag:    "MR / Research",
    link:   "https://ieeexplore.ieee.org/abstract/document/11172645",
    accent: "#00FFFF",
    desc:   "Mixed Reality app on HoloLens 2 for digital preservation of Moovar Kovil — a 9th-century Chola temple. Graded O (Outstanding), published at ICVR 2025.",
    points: [
      "Integrated photogrammetric 3D reconstruction into HoloLens 2 with stable spatial anchoring across varying lighting and room geometries",
      "Gaze-driven annotation layers — look at any pillar, carving, or sanctum to surface historical and architectural context",
      "Optimised scene from ~15 fps to stable 60 fps via LOD switching, occlusion culling, and baked lighting",
      "Validated across three expert feedback cycles; accepted at ICVR 2025, Wageningen, Netherlands",
    ],
    tech: ["Unity", "HoloLens 2", "MRTK", "C#", "Photogrammetry"],
  },

  {
    title:  "Sapota AI",
    tag:    "Computer Vision",
    link:   "#",
    accent: "#00FFFF",
    desc:   "Deep learning pipeline for automated fruit quality — ripeness classification (~88% accuracy), bruise detection, and shelf life prediction using dual RGB + thermal imaging.",
    points: [
      "Custom CNN with transfer learning — ~88% accuracy in three-class ripeness detection (unripe / ripe / overripe)",
      "Hybrid SVM + MobileNet bruise detection pipeline — +15% precision over standalone CNN baseline",
      "Dual-modality fusion: RGB for surface texture, thermal imaging for sub-surface bruise and ripeness signatures",
      "Data augmentation (rotation, brightness, Gaussian noise) reduced overfitting by ~20% on custom-collected dataset",
    ],
    tech: ["Python", "TensorFlow", "Custom CNN", "SVM", "MobileNet", "OpenCV"],
  },

  {
    title:  "RecordVault",
    tag:    "Database / Desktop",
    link:   "#",
    accent: "#00FFFF",
    desc:   "Desktop CRM for music recording companies — normalised PostgreSQL schema (3NF), transaction-safe CRUD, and role-based access. Led a 4-person team end-to-end.",
    points: [
      "Java + Swing desktop app with JDBC-PostgreSQL data layer — all operations wrapped in transactions with commit/rollback",
      "Normalised schema to 3NF covering artists, albums, songs, contracts with foreign keys and referential integrity",
      "Role-based access: admins handle contract management and artist onboarding; standard users browse and edit catalog",
      "Led four-person team through full lifecycle — requirements, schema design, agile sprints, and testing",
    ],
    tech: ["Java", "Swing", "JDBC", "PostgreSQL"],
  },

  {
    title:  "code@Amrita",
    tag:    "Web App",
    link:   "#",
    accent: "#00FFFF",
    desc:   "Self-initiated competitive programming resource platform for beginners — aggregates problem sets, learning paths, and contest guides. Deployed on Azure App Services.",
    points: [
      "React.js frontend deployed on Microsoft Azure App Services with custom domain DNS configuration",
      "Aggregates problem sets, learning paths, and contest guides curated for CP beginners",
      "Born from nearly two years of active competitive programming mentoring at Code@Amrita",
      "Designed to lower the barrier to entry for students starting out in coding competitions",
    ],
    tech: ["React.js", "Azure App Services", "JavaScript"],
  },

  {
    title:  "SSR Club",
    tag:    "Full Stack",
    link:   "#",
    accent: "#00FFFF",
    desc:   "Full-stack web platform for Amrita's Student Social Responsibility club — tracks initiatives, events, and outreach. Django backend on Azure, led team from design to deployment.",
    points: [
      "Django backend deployed on Azure App Services — REST APIs for initiative tracking and event management",
      "Platform creates awareness for SSR programmes and allows students and faculty to monitor ongoing outreach",
      "Led team through full 4-month design-to-deployment lifecycle including requirements, development, and launch",
      "Combined full-stack development skills with a real social impact mission for the university community",
    ],
    tech: ["Django", "Azure App Services", "Python", "HTML/CSS"],
  },

  // ── Awards ──────────────────────────────────────────────────────────────────

  {
    title:  "VisionAssist",
    tag:    "Hackathon · IEEE",
    link:   "#",
    accent: "#FBBF24",
    desc:   "Real-time voice guidance and proactive hazard detection for visually impaired users — working prototype built in 24 hours at IEEE Kerala Section national hackathon.",
    points: [
      "Built end-to-end working prototype within a 24-hour national-level hackathon constraint",
      "Real-time voice guidance system providing spatial awareness and navigation cues for visually impaired users",
      "Proactive hazard detection using computer vision — identifies obstacles and alerts users before contact",
      "Raspberry Pi-based embedded system making the prototype portable and deployable in real environments",
    ],
    tech: ["Python", "OpenCV", "TTS", "Raspberry Pi"],
  },

  {
    title:  "Access Denied",
    tag:    "1st Prize · Anokha",
    link:   "#",
    accent: "#FBBF24",
    desc:   "Won 1st place at Anokha 2023 — Amrita National Techfest. Multi-round contest covering circuit design, hardware troubleshooting, and competitive coding under time pressure.",
    points: [
      "Won 1st place at Anokha 2023 — the National Techfest of Amrita Vishwa Vidyapeetham",
      "Designed and troubleshot intricate electronic circuits under strict time pressure across multiple rounds",
      "Participated in competitive coding challenges as part of a multi-discipline contest format",
      "Team of three recognised for exceptional problem-solving and innovative approach across all rounds",
    ],
    tech: ["Circuits", "Algorithms", "C++"],
  },
]

export const ORBIT_R = 5   // world-unit orbit radius
export const ORBIT_H = 8   // half-height (y: −8 → +8)
