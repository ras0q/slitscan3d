import { useCallback, useEffect, useRef } from 'react'

export const useAnimationFrame = (callback: () => void) => {
  const requestRef = useRef(0)
  const animate = useCallback(() => {
    requestRef.current = requestAnimationFrame(animate)
    callback()
  }, [callback])

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current)
  }, [animate])
}
