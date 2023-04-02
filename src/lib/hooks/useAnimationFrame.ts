import { DependencyList, useCallback, useEffect, useRef } from 'react'

export const useAnimationFrame = (
  callback: () => void,
  deps: DependencyList,
) => {
  const requestRef = useRef<number>()
  const animate = useCallback(() => {
    requestRef.current = requestAnimationFrame(animate)
    callback()
  }, [callback])

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current!)
  }, [animate, ...deps])
}
