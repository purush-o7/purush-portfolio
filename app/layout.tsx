import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Fira_Code, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["300", "400", "500", "600", "700"],
});

const BASE_URL = "https://purush-o7.vercel.app"
const GA_ID    = "G-0KNRVX5NH0"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "Purushottam Reddy — Full Stack Developer & ML Engineer",
    template: "%s | Purushottam Reddy",
  },
  description:
    "Full-stack developer and ML engineer with expertise in FastAPI, React, PostgreSQL, AWS, and RabbitMQ. Published IEEE researcher (ICVR 2025). 1 yr 11 mo at MaTrack Inc. — multi-tenant CRM, async pipelines, conversational AI. Open to full-stack roles.",

  keywords: [
    "Purushottam Reddy",
    "Purushottam Reddy Chinthakuntla",
    "Full Stack Developer",
    "ML Engineer",
    "FastAPI Developer",
    "React Developer",
    "Python Developer",
    "PostgreSQL",
    "AWS",
    "RabbitMQ",
    "Dramatiq",
    "Twilio",
    "MaTrack",
    "Amrita Vishwa Vidyapeetham",
    "ICVR 2025",
    "HoloLens Developer",
    "Mixed Reality",
    "KovilLens",
    "Nandyal",
    "Andhra Pradesh",
    "India",
    "Software Engineer Portfolio",
  ],

  authors: [{ name: "Purushottam Reddy Chinthakuntla", url: BASE_URL }],
  creator:  "Purushottam Reddy Chinthakuntla",
  publisher: "Purushottam Reddy Chinthakuntla",

  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         BASE_URL,
    siteName:    "Purushottam Reddy — Portfolio",
    title:       "Purushottam Reddy — Full Stack Developer & ML Engineer",
    description: "Full-stack developer and ML engineer. FastAPI · React · PostgreSQL · AWS · RabbitMQ. Published IEEE researcher. Open to full-stack roles.",
    images: [
      {
        url:    "/og-image.png",
        width:  1200,
        height: 630,
        alt:    "Purushottam Reddy — Full Stack Developer & ML Engineer",
      },
    ],
  },

  twitter: {
    card:        "summary_large_image",
    title:       "Purushottam Reddy — Full Stack Developer & ML Engineer",
    description: "Full-stack developer and ML engineer. FastAPI · React · PostgreSQL · AWS · Published IEEE researcher.",
    images:      ["/og-image.png"],
    creator:     "@purush_o7",
  },

  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  alternates: {
    canonical: BASE_URL,
  },

  // Geo metadata
  other: {
    "geo.region":    "IN-AP",
    "geo.placename": "Nandyal, Andhra Pradesh, India",
    "geo.position":  "15.4786;78.4837",
    "ICBM":          "15.4786, 78.4837",
    "revisit-after": "7 days",
    "language":      "English",
    "category":      "technology",
    "classification": "Portfolio, Software Engineering, Full Stack Development",
  },
};

export const viewport: Viewport = {
  width:         "device-width",
  initialScale:  1,
  themeColor:    "#07070f",
};

// JSON-LD structured data — Person schema
const jsonLd = {
  "@context": "https://schema.org",
  "@type":    "Person",
  name:       "Purushottam Reddy Chinthakuntla",
  alternateName: "Purushottam Reddy",
  url:        BASE_URL,
  email:      "dev.coreops26@gmail.com",
  jobTitle:   "Full Stack Developer",
  description:
    "Full-stack developer and ML engineer with experience building multi-tenant SaaS platforms, async communication pipelines, and published Mixed Reality research.",
  address: {
    "@type":           "PostalAddress",
    addressLocality:   "Nandyal",
    addressRegion:     "Andhra Pradesh",
    addressCountry:    "IN",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name:    "Amrita Vishwa Vidyapeetham",
    address: {
      "@type":         "PostalAddress",
      addressLocality: "Amritapuri, Kollam",
      addressRegion:   "Kerala",
      addressCountry:  "IN",
    },
  },
  knowsAbout: [
    "Full Stack Development", "FastAPI", "React.js", "Python", "PHP",
    "PostgreSQL", "AWS", "Docker", "RabbitMQ", "Dramatiq",
    "Machine Learning", "LLM Fine-tuning", "Mixed Reality",
    "Unity", "HoloLens 2", "Computer Vision",
  ],
  sameAs: [
    "https://github.com/purush-o7",
    "https://www.linkedin.com/in/purush-o7/",
    "https://learn.microsoft.com/en-us/users/purush34/",
    "https://ieeexplore.ieee.org/abstract/document/11172645",
  ],
  worksFor: {
    "@type": "Organization",
    name:    "MaTrack Inc. (Sieva Networks)",
    url:     "https://matrack.io",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", spaceGrotesk.variable, firaCode.variable, inter.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        {/* Dev-only: guard performance.measure against Next.js dev-overlay bug
            vercel/next.js#86060 (negative-timestamp crash via not-found
            instrumentation, still present in 16.2.10). Not rendered in prod.
            Remove once the upstream fix ships. */}
        {process.env.NODE_ENV === "development" && (
          <script
            dangerouslySetInnerHTML={{
              __html:
                "(function(){var m=performance.measure.bind(performance);performance.measure=function(){try{return m.apply(null,arguments)}catch(e){}}})();",
            }}
          />
        )}
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
      {/* Google Analytics — loads after hydration, no render blocking */}
      <GoogleAnalytics gaId={GA_ID} />
    </html>
  );
}
