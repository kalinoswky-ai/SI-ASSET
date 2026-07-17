import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number from 0 to `target` whenever `target` changes.
 * Pure rAF, no dependencies — respects prefers-reduced-motion by
 * snapping instantly for users who opt out of motion.
 */
export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0)
  const frame = useRef<number>()

  useEffect(() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !Number.isFinite(target)) {
      setValue(target)
      return
    }

    const start = performance.now()
    const from = 0

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [target, duration])

  return value
}
