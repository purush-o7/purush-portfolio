"use client"

import { useViewport } from "./use-viewport"

export function useMobile(): boolean {
  const { width } = useViewport()
  return width > 0 && width < 768
}
