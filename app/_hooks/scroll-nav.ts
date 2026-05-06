"use client"

// Tiny bridge so SectionNav can call into useScrollSnap without prop-drilling
let _go: ((dir: 1 | -1) => void) | null = null

export function registerNav(fn: (dir: 1 | -1) => void) { _go = fn }
export function navGo(dir: 1 | -1)                     { _go?.(dir) }
