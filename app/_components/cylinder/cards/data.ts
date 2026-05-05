export interface CardData {
  title:  string
  tag:    string
  link:   string
  points: [string, string, string, string]
  tech:   string[]
}

export const DEMO_CARDS: CardData[] = [
  {
    title: "KovilLens",
    tag:   "MR / Research",
    link:  "https://ieeexplore.ieee.org/abstract/document/11172645",
    points: [
      "Mixed Reality app for digital preservation of Moovar Kovil temple",
      "Stable spatial anchoring + photogrammetric 3D reconstruction",
      "Rendering optimised from ~15 fps → 60 fps on HoloLens 2",
      "Published at ICVR 2025, Wageningen, Netherlands",
    ],
    tech: ["Unity", "HoloLens 2", "C#", "MRTK"],
  },
  {
    title: "Sapota AI",
    tag:   "Computer Vision",
    link:  "#",
    points: [
      "Ripeness classification via custom CNN — ~88% accuracy",
      "Bruise detection with SVM + MobileNet hybrid (+15% precision)",
      "Dual-modality fusion: RGB + thermal imaging pipeline",
      "Overfitting reduced ~20% through augmentation strategies",
    ],
    tech: ["Python", "TensorFlow", "MobileNet", "OpenCV"],
  },
  {
    title: "RecordVault",
    tag:   "Database / Desktop",
    link:  "#",
    points: [
      "Desktop CRM for music recording companies and artist management",
      "Normalised PostgreSQL schema — artists, albums, songs, contracts",
      "Transaction-safe CRUD with commit / rollback for data integrity",
      "Role-based access: admin contract management vs standard catalog",
    ],
    tech: ["Java", "Swing", "JDBC", "PostgreSQL"],
  },
  {
    title: "code@Amrita",
    tag:   "Web App",
    link:  "#",
    points: [
      "Competitive programming resource platform aimed at beginners",
      "Aggregates problem sets, learning paths, and contest guides",
      "Custom domain deployment on Microsoft Azure App Services",
      "Born from 2 years of active CP mentoring at Amrita",
    ],
    tech: ["React.js", "Azure", "JavaScript"],
  },
  {
    title: "SSR Club",
    tag:   "Full Stack",
    link:  "#",
    points: [
      "Platform for Student Social Responsibility club at Amrita",
      "Django backend deployed on Azure App Services",
      "Tracks SSR initiatives, events, and community outreach programs",
      "Led 4-person team through full design-to-deployment lifecycle",
    ],
    tech: ["Django", "Azure", "Python", "HTML/CSS"],
  },
  {
    title: "VisionAssist",
    tag:   "Hackathon · IEEE",
    link:  "#",
    points: [
      "24-hour national-level hackathon — IEEE Kerala Section",
      "Real-time voice guidance system for visually impaired users",
      "Proactive hazard detection using computer vision",
      "End-to-end working prototype built within 24 hours",
    ],
    tech: ["Python", "OpenCV", "TTS", "Raspberry Pi"],
  },
  {
    title: "Access Denied",
    tag:   "1st Prize · Anokha",
    link:  "#",
    points: [
      "Won 1st place at Anokha 2023 — Amrita National Techfest",
      "Circuit design and hardware troubleshooting under time pressure",
      "Competitive coding challenges as part of multi-round contest",
      "Team of three recognised for innovative problem-solving",
    ],
    tech: ["Circuits", "Algorithms", "C++"],
  },
]

export const ORBIT_R = 5   // world-unit orbit radius
export const ORBIT_H = 8   // half-height (y: −8 → +8)
