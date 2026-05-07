export const MONO    = "var(--font-geist-mono)"
export const HEADING = "var(--font-heading)"
export const ACCENT  = "#00FFFF"

export interface SkillCategory {
  label:   string
  varName: string
  color:   string
  skills:  string[]
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    label: "Languages", varName: "LANGUAGES", color: "#00FFFF",
    skills: ["Python", "TypeScript", "JavaScript", "Java", "C++", "C#", "PHP"],
  },
  {
    label: "Frontend", varName: "FRONTEND", color: "#A78BFA",
    skills: ["React", "Next.js", "Three.js", "TailwindCSS", "Framer Motion", "HTML/CSS"],
  },
  {
    label: "Backend", varName: "BACKEND", color: "#34D399",
    skills: ["FastAPI", "Node.js", "Django", "RabbitMQ", "Dramatiq", "Frappe"],
  },
  {
    label: "Cloud & DevOps", varName: "CLOUD", color: "#60A5FA",
    skills: ["AWS", "Azure", "Docker", "GitHub Actions", "Apache"],
  },
  {
    label: "ML & AI", varName: "ML_AI", color: "#FBBF24",
    skills: ["PyTorch", "TensorFlow", "LangChain", "Claude API", "Llama 2", "OpenCV"],
  },
  {
    label: "Databases", varName: "DATABASES", color: "#F87171",
    skills: ["PostgreSQL", "MongoDB", "Redis", "Azure SQL", "Pinecone"],
  },
]

export const TERMINAL_LINES: { text: string; color?: string }[] = [
  { text: "claude-agent@skills ~ $ python analyze_dev.py", color: "#00FFFF" },
  { text: "" },
  { text: "  ▸  Scanning experience history...",             color: "#4B5563" },
  { text: "  ▸  Cross-referencing project stack...",         color: "#4B5563" },
  { text: "  ▸  Computing proficiency matrix...",            color: "#4B5563" },
  { text: "" },
  { text: "  ✓  34 skills across 6 domains",                color: "#34D399" },
  { text: "  ✓  5 production systems confirmed",            color: "#34D399" },
  { text: "  ✓  Multi-cloud: AWS + Azure",                  color: "#34D399" },
  { text: "" },
  { text: "  !  Gaps found: WebGL · Rust · Go",             color: "#FBBF24" },
  { text: "     Schedule these for Q3? ▌",                  color: "#4B5563" },
]

export const OUTPUT_LINES: { text: string; color?: string }[] = [
  { text: "[11:42:03]  Starting production build...",          color: "#4B5563" },
  { text: "" },
  { text: "[11:42:04]  ✓  TypeScript compiled  (0 errors)",   color: "#34D399" },
  { text: "[11:42:04]  ✓  ESLint passed  (0 warnings)",       color: "#34D399" },
  { text: "[11:42:05]  ✓  Three.js scenes optimised",         color: "#34D399" },
  { text: "[11:42:05]  ✓  Particle system: 7000 pts loaded",  color: "#34D399" },
  { text: "[11:42:06]  ✓  Skills matrix: 34 skills indexed",  color: "#34D399" },
  { text: "[11:42:06]  ✓  Experience: 5 entries serialised",  color: "#34D399" },
  { text: "[11:42:07]  ✓  Static pages generated  (6/6)",     color: "#34D399" },
  { text: "[11:42:07]  ✓  Deploying → purush-o7.vercel.app",  color: "#00FFFF" },
  { text: "" },
  { text: "[11:42:08]  Build time: 6.4s    Bundle: 847 kB",   color: "#4B5563" },
  { text: "[11:42:08]  Status: LIVE  ✓",                      color: "#34D399" },
]

export const PROBLEM_LINES: { text: string; color?: string; indent?: boolean }[] = [
  { text: "  3 warnings · 4 hints",                            color: "rgba(255,255,255,0.35)" },
  { text: "" },
  { text: "  dev_profile.py",                                  color: "rgba(255,255,255,0.5)" },
  { text: "  ⚠  [6:1]   Skill count exceeds standard spec  (34 > 20)",          color: "#FBBF24" },
  { text: "  ⚠  [8:1]   ML_AI and FRONTEND in same file — unusual combo",       color: "#FBBF24" },
  { text: "  ⚠  [14:1]  DATABASES array suspiciously well-optimised",            color: "#FBBF24" },
  { text: "" },
  { text: "  career.ts",                                       color: "rgba(255,255,255,0.5)" },
  { text: "  ℹ  [1:1]   sleep() never called on weekends",                      color: "#60A5FA" },
  { text: "  ℹ  [42:1]  side_projects.length → 12  (expected: 0)",              color: "#60A5FA" },
  { text: "" },
  { text: "  burnout.json",                                    color: "rgba(255,255,255,0.5)" },
  { text: '  ℹ  [1:1]   caffeine_intake: "critical"',                           color: "#60A5FA" },
  { text: "  ℹ  [1:1]   work_life_balance: undefined",                           color: "#60A5FA" },
]

export const CHAT_INITIAL =
  "Hey — I just finished scanning Purushottam's stack. Ask me anything."

export interface ChatOption {
  id:       string
  question: string
  answer:   string
}

export const CHAT_OPTIONS: ChatOption[] = [
  {
    id: "stack",
    question: "What's his main stack?",
    answer:
      "Python + TypeScript at the core. React / Next.js on the frontend, FastAPI on the backend, PyTorch when the problem needs ML. Also Three.js — which is probably how you got here.",
  },
  {
    id: "prod",
    question: "Has he shipped to production?",
    answer:
      "Yes — not side projects. A full-stack CRM used by U.S. fleet dealerships, an AR heritage experience on HoloLens 2, a conversational AI system with real RAG pipelines. Real users, real infra.",
  },
  {
    id: "ml",
    question: "How serious is the ML side?",
    answer:
      "PyTorch, TensorFlow, LangChain, Claude API, Llama 2. He's built custom CNN pipelines, fine-tuned LLMs, and wired up vector search. Not just API wrappers — actual model work.",
  },
  {
    id: "scale",
    question: "Can he handle scale?",
    answer:
      "He designed multi-tenant systems with per-tenant isolation, async queues with RabbitMQ + Dramatiq, and bulk comms pipelines handling thousands of calls. He thinks about scale first.",
  },
  {
    id: "hire",
    question: "Should I hire him?",
    answer:
      "Full-stack, ML, team lead, ships to prod. The question isn't whether he can do the job — it's how fast. I'd move quickly. ▌",
  },
]

export const CHAT_CLOSING =
  "That's the full picture. The code on the left is live — feel free to poke around."
