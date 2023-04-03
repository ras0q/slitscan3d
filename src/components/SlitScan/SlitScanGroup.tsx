import { useAnimationFrame } from '../../lib/hooks/useAnimationFrame'
import { useFrame } from '@react-three/fiber'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  CanvasTexture,
  DataTexture,
  DoubleSide,
  Plane,
  RGBAFormat,
  Texture,
  Vector3,
} from 'three'

type SlitScanGroupProps = {
  video: HTMLVideoElement
  width: number
  height: number
  depth: number
  frameLimit: number
  clipPlanes: Plane[]
}

export const SlitScanGroup = ({
  video,
  width,
  height,
  depth,
  frameLimit,
  clipPlanes,
}: SlitScanGroupProps) => {
  const [allTextures, setAllTextures] = useState<Texture[]>([])
  const [textures, setTextures] = useState(allTextures.slice(0, frameLimit))
  const videoCanvas = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    return canvas
  }, [video])
  const videoCtx = videoCanvas.getContext('2d', { willReadFrequently: true })
  const videoIsValid = useCallback(() => {
    return (
      !video.paused &&
      !video.ended &&
      video.videoWidth !== 0 &&
      video.videoHeight !== 0
    )
  }, [video])

  if (videoIsValid()) {
    videoCtx?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
  }

  const createFrameLoop = useCallback(() => {
    if (videoIsValid()) {
      allTextures.push(new CanvasTexture(videoCanvas))
      setAllTextures(allTextures)
    }
  }, [video])
  useAnimationFrame(createFrameLoop)

  const nullFrames: Texture[] = useMemo(
    () =>
      Array.from(
        { length: frameLimit },
        () => new DataTexture(null, width, height, RGBAFormat),
      ),
    [width, height, frameLimit],
  )

  const frameIndex = useRef(0)
  useFrame(() => {
    // if frames are not enough, fill with null frames
    if (allTextures.length < frameLimit) {
      setTextures(
        nullFrames
          .slice(0, frameLimit - allTextures.length)
          .concat(allTextures),
      )
      return
    }

    frameIndex.current = (frameIndex.current + 1) % allTextures.length
    setTextures(
      Array.from(
        { length: frameLimit },
        (_, i) => allTextures[(frameIndex.current + i) % allTextures.length],
      ),
    )
  })

  // clip the front of the extra drawn box
  const additionalClipPlane = useMemo(
    () => new Plane(new Vector3(0, 0, -1), Math.ceil(depth / 2)),
    [depth],
  )

  return (
    <group>
      {textures.map((texture, i) => (
        <mesh
          key={texture.id}
          castShadow
          position={[0, 0, i * (depth / textures.length)]}
        >
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            map={texture}
            clippingPlanes={[additionalClipPlane, ...clipPlanes]}
            clipShadows={true}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
