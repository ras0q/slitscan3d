import { useFrame } from '@react-three/fiber'
import { useMemo, useState } from 'react'
import { useAnimationFrame } from '../../lib/hooks/useAnimationFrame'
import {
  Texture,
  DataTexture,
  RGBAFormat,
  Vector3,
  DoubleSide,
  Plane,
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
  const allTextures = useMemo<Texture[]>(() => [], [video])
  const [textures, setTextures] = useState(allTextures.slice(0, frameLimit))
  const videoCtx = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    return canvas.getContext('2d', { willReadFrequently: true })
  }, [video])

  useAnimationFrame(() => {
    const { paused, ended, videoWidth, videoHeight } = video
    if (paused || ended || videoWidth === 0 || videoHeight === 0) return
    if (videoCtx === null) return

    videoCtx.drawImage(video, 0, 0, videoWidth, videoHeight)
    const texture = new DataTexture(
      videoCtx.getImageData(0, 0, videoWidth, videoHeight)?.data,
      videoWidth,
      videoHeight,
      RGBAFormat,
    )
    texture.needsUpdate = true
    texture.flipY = true // FIXME: why the frame is upside down?
    allTextures.push(texture)
  }, [video])

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime()

    const frameIndex = Math.floor(elapsed * 30) % allTextures.length
    const restIndex = frameIndex + frameLimit - allTextures.length
    const newFrames =
      restIndex > 0
        ? allTextures
            .slice(frameIndex, allTextures.length)
            .concat(allTextures.slice(0, restIndex))
        : allTextures.slice(frameIndex, frameIndex + frameLimit)
    setTextures(newFrames)
  })

  return (
    <group>
      {textures.map((texture, i) => (
        <mesh
          key={i.toString()}
          castShadow
          position={[0, 0, i * (depth / textures.length)]}
        >
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            map={texture}
            clippingPlanes={[
              new Plane(new Vector3(0, 0, -1), Math.ceil(depth / 2)),
              ...clipPlanes,
            ]}
            clipShadows={true}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
