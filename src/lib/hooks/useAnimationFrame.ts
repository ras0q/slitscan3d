import { useCallback, useEffect, useRef } from 'react'

export const useAnimationFrame = (callback: () => void, condition: () => boolean) => {
  const requestRef = useRef(0)
  const animate = useCallback(() => {
    if (condition()) {
      requestRef.current = requestAnimationFrame(animate)
      callback()
    }
  }, [callback])

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current)
  }, [animate])
}
