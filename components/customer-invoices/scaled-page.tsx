"use client"

import { useLayoutEffect, useRef, useState, type ReactNode } from "react"

/**
 * Shrinks a fixed-width page (the A4 invoice) to fit its container, keeping
 * the layout exactly as it prints instead of letting it reflow.
 */
export function ScaledPage({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ scale: 1, height: 0 })

  useLayoutEffect(() => {
    const frame = frameRef.current
    const page = pageRef.current
    if (!frame || !page) return
    const measure = () => {
      const scale = Math.min(1, frame.clientWidth / page.offsetWidth)
      setSize({ scale, height: page.offsetHeight * scale })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    observer.observe(page)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={frameRef} className="w-full" style={{ height: size.height || undefined }}>
      <div
        ref={pageRef}
        className="w-fit origin-top-left"
        style={{ transform: `scale(${size.scale})` }}
      >
        {children}
      </div>
    </div>
  )
}
