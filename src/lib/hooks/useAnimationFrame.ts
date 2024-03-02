import { useCallback, useEffect, useRef } from 'react'

export const useAnimationFrame = (callback: () => Promise<void>, condition: () => boolean) => {
  const requestRef = useRef(0)
  const animate = useCallback(async () => {
    if (condition()) {
      requestRef.current = requestAnimationFrame(animate)
      await callback()
    }
  }, [callback])

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current)
  }, [animate])
}
