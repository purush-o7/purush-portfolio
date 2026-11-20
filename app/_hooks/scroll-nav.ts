"use client"

/** Smoothly scroll to a screen (one screen = 100vh). Used by buttons that jump (Skip projects, the Education chips). */
export function navToIndex(idx: number) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  window.scrollTo({ top: idx * window.innerHeight, behavior: reduce ? "auto" : "smooth" })
}
