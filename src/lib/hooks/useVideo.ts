import { useState, useEffect, useCallback } from 'react'

export type VideoSrc = string | MediaProvider

export const useVideo = (src: VideoSrc) => {
  const createVideo = useCallback(
    (src: VideoSrc) => {
      const newVideo = document.createElement('video')
      newVideo.playsInline = true
      newVideo.muted = true
      newVideo.controls = true

      switch (typeof src) {
        case 'string':
          newVideo.src = src
          break
        case 'object':
          newVideo.srcObject = src
          break
      }

      newVideo.play()

      return newVideo
    },
    [src],
  )

  const [video, setVideo] = useState(document.createElement('video'))
  useEffect(() => {
    const newVideo = createVideo(src)
    newVideo.play()
    newVideo.oncanplay = () => {
      setVideo(newVideo)
    }
  }, [src])

  return video
}
