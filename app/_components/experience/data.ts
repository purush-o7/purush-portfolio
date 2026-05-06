export interface Section {
  heading: string
  points:  string[]
}

export interface ExperienceEntry {
  role:      string
  org:       string
  period:    string
  duration:  string
  location?: string
  tag:       string
  accent:    string
  tech:      string[]
  sections:  Section[]
  metrics?:  { value: string; label: string }[]
  links?:    { label: string; url: string }[]
}

// Newest → oldest
export const ALL_ENTRIES: ExperienceEntry[] = [
  {
    role:     "Associate Software Engineer",
    org:      "MaTrack Inc. (Sieva Networks)",
    period:   "Mar 2024 – Jan 2026",
    duration: "1 yr 11 mo",
    location: "San Francisco · Remote",
    tag:      "Enterprise SaaS",
    accent:   "#00FFFF",
    tech:     ["FastAPI", "PHP", "JavaScript", "RabbitMQ", "Dramatiq", "Twilio", "SendGrid", "Jupico", "Zoho", "Docker", "Apache", "AWS"],
    sections: [
      {
        heading: "System Design & Leadership",
        points: [
          "Architected a **multi-tenant CRM** end-to-end — led system design, frontend decisions, and a **5-person team** across deployments for U.S. fleet dealerships",
          "Designed **per-tenant data isolation**: each company gets its own customer base, agent roster, contract ledger, and comms history on shared infrastructure with independent scaling",
        ],
      },
      {
        heading: "Scalability & Async Infrastructure",
        points: [
          "Managed all webhook events and background jobs via **RabbitMQ** message broker with **Dramatiq** workers — bulk import, campaign scheduling, and workflow automation run **fully async**",
          "Built a **bulk import pipeline** (CSV/Excel) with deduplication, field mapping, and auto-triggered onboarding workflows — no manual intervention required at scale",
          "Engineered a **Zoho email fetcher** that syncs inbound customer emails into the CRM in real time via webhook-driven event processing",
          "Scheduled SMS/email campaigns with **custom frequency controls** — configurable per tenant, per campaign type, and per customer segment",
        ],
      },
      {
        heading: "Communication & AI Integrations",
        points: [
          "Built a **sequential bulk calling system** eliminating manual dial friction for dealer agents — staff can run outreach campaigns at scale with one click",
          "Engineered a **conversational AI bot** enabling **24/7** customer coverage — handles inbound queries, follow-ups, and escalations without human intervention",
          "Delivered end-to-end payment integration with **Twilio**, **SendGrid**, and **Jupico** — automated voice follow-ups, installment tracking, and real-time sync",
          "Built **custom Claude plugins** and automation integrations directly into the codebase — streamlined internal engineering workflows",
        ],
      },
      {
        heading: "Ownership & Impact",
        points: [
          "Owned **production issue resolution** across the full stack — from API bugs to infra incidents — with **zero-downtime** deployments via Docker on Apache/AWS",
          "Unified dealer portal replaced **four separate tools**; manual overhead cut by **−60%**, engagement up **+30%**, operational efficiency up **+40%** across all tenants",
        ],
      },
    ],
    metrics: [
      { value: "+40%", label: "Efficiency"   },
      { value: "−60%", label: "Manual comms" },
      { value: "+30%", label: "Engagement"   },
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
    tech:     ["Python", "Data Structures", "Algorithms", "Competitive Programming"],
    sections: [
      {
        heading: "How I Assisted",
        points: [
          "Supported faculty in delivering **Python** and **DSA** courses to undergraduate cohorts — lecture support, lab sessions, and grading",
          "Ran **weekly one-on-one mentorship** sessions for students who needed extra help with programming fundamentals",
        ],
      },
      {
        heading: "How I Helped Students",
        points: [
          "Answered questions in and outside class, breaking down **complex algorithmic concepts** from first principles",
          "Extended **two years** of active competitive programming mentoring at **Code@Amrita** into a formal TA role",
        ],
      },
      {
        heading: "Recognition",
        points: [
          "Awarded **Green++** — the **highest** student performance grade at Amrita School of Computing",
          "Communication and documentation skills built here carried directly into **MaTrack** technical writing and **ICVR 2025** research presentation",
        ],
      },
    ],
  },

  {
    role:     "Software Developer Intern",
    org:      "ICTS, Amrita School of Computing",
    period:   "Dec 2022 – May 2023",
    duration: "6 mo",
    location: "Amritapuri, Kerala",
    tag:      "Healthcare AI",
    accent:   "#10B981",
    tech:     ["Frappe Framework", "Llama-2-7B", "PyTorch", "NLP", "Prompt Engineering", "PostgreSQL"],
    sections: [
      {
        heading: "What I Built",
        points: [
          "Neonatal care web application for **Amrita Hospital (Kochi)** using **Frappe** — digitised clinical data capture workflows, replacing manual documentation and reducing data entry load by **~35%**",
          "**Natural-language-to-SQL** query system eliminating traditional filter-based search for clinicians — enabling intuitive data retrieval **3× faster** across a highly variable patient dataset",
        ],
      },
      {
        heading: "How I Trained the Data",
        points: [
          "Fine-tuned **Llama-2-7B** on **~3,000 neonatal attributes** — engineered schema-aware prompt pipeline so the model generates valid SQL with the Frappe database as context",
          "Implemented **similarity-based patient clustering** for early diagnosis — surfaced infants with matching disease traits automatically",
        ],
      },
      {
        heading: "Results",
        points: [
          "Diagnostic identification time cut by **~40%**, reducing delays in treatment workflows",
          "Data entry load reduced by **~35%**; clinicians retrieve records **3× faster** than filter-based search",
        ],
      },
    ],
    metrics: [
      { value: "3×",   label: "Query speed"      },
      { value: "~40%", label: "Faster diagnosis"  },
      { value: "~35%", label: "Less data entry"   },
    ],
  },

  {
    role:     "University Research Assistant",
    org:      "Amrita Centre for Wireless Networks & Applications",
    period:   "Feb – May 2023",
    duration: "4 mo",
    location: "Amritapuri, Kerala",
    tag:      "Mixed Reality",
    accent:   "#8B5CF6",
    tech:     ["Unity", "C#", "HoloLens 2", "MRTK", "Photogrammetry", "Baked Lighting"],
    sections: [
      {
        heading: "What I Learned from Scratch",
        points: [
          "Rapidly acquired **Unity**, **C#**, and **MRTK** from scratch — applied 3D spatial mapping, physics, and real-world alignment within the research window",
          "Integrated photogrammetric reconstructions of **Moovar Kovil** into **HoloLens 2**, solving frame rate bottlenecks from **~15 fps** to a stable **60 fps** through scene optimisation and baked lighting",
        ],
      },
      {
        heading: "Research & Design",
        points: [
          "Researched the **architectural and historical context** of Moovar Kovil to design interactive MR learning experiences",
          "Iterated across **multiple feedback cycles** to build **KovilLens** — a cultural heritage preservation platform for digital exploration of a 9th-century Chola temple",
        ],
      },
      {
        heading: "Publication",
        points: [
          "Contributed to a **peer-reviewed paper** accepted at **ICVR 2025** (Wageningen, Netherlands) — translating hands-on engineering and domain research into a conference-ready paper within a **3-month research window**",
        ],
      },
    ],
    metrics: [
      { value: "15→60", label: "fps on HoloLens" },
      { value: "ICVR",  label: "2025 Published"  },
    ],
  },

  {
    role:     "Cloud Computing Intern",
    org:      "FutureSkills Prime · Microsoft Azure Apprenticeship",
    period:   "Mar – Jun 2022",
    duration: "4 mo",
    tag:      "Cloud / Azure",
    accent:   "#3B82F6",
    tech:     ["Django", "ReactJS", "Azure App Services", "Azure ML", "Azure Functions", "Azure SQL", "Blob Storage"],
    sections: [
      {
        heading: "What I Built",
        points: [
          "**talkToLocals** — full-stack cloud-native platform connecting travellers with local guides based on location and interests",
          "**Django** REST backend on **Azure App Services** with **ReactJS** frontend, **Azure SQL** for data and Blob Storage for media",
          "**Azure Functions** for serverless event processing — confirmation emails, match notifications, async tasks",
        ],
      },
      {
        heading: "What I Learned",
        points: [
          "End-to-end Azure architecture across **five services** — App Services, Functions, SQL, Blob Storage, and ML",
          "CI/CD pipelines, environment configuration, monitoring dashboards, and cost optimisation on cloud infrastructure",
          "Integrating **Azure ML** recommendation models into a production web application",
        ],
      },
      {
        heading: "Achieved",
        points: [
          "Azure ML-powered guide matching boosted communication efficiency by **+30%**",
          "Delivered a fully deployed, production-grade cloud application within a **4-month** apprenticeship",
          "Earned **187 badges** and **39 trophies** on Microsoft Learn — completing the full **Microsoft Azure Apprenticeship** track",
        ],
      },
    ],
    metrics: [
      { value: "+30%", label: "Match efficiency" },
      { value: "5",    label: "Azure services"   },
    ],
    links: [
      { label: "GitHub",          url: "https://github.com/purush-o7/talkToLocals" },
      { label: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/users/purush34/" },
      { label: "Google Skills",   url: "https://www.skills.google/public_profiles/3ca6c901-1eeb-4572-95ab-3a6420539852" },
    ],
  },
]
