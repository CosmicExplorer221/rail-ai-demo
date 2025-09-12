import { useEffect, useRef } from 'react'

/**
 * Custom hook for smooth animation ticker
 * Provides consistent 60fps updates when playing
 */
export function useTicker(isPlaying: boolean, onTick: (deltaTime: number) => void) {
  const lastTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = undefined
      }
      return
    }

    function tick(currentTime: number) {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000 // Convert to seconds
      lastTimeRef.current = currentTime

      onTick(deltaTime)

      if (isPlaying) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = undefined
      }
      lastTimeRef.current = null
    }
  }, [isPlaying, onTick])
}