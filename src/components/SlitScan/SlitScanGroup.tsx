import { useAnimationFrame } from '../../lib/hooks/useAnimationFrame'
import { useFrame } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DataTexture, DoubleSide, Plane, RGBAFormat, Texture, Vector3 } from 'three'

type SlitScanGroupProps = {
  video: HTMLVideoElement
  width: number
  height: number
  depth: number
  frameLimit: number
  clipPlanes: Plane[]
}

export const SlitScanGroup = ({ video, width, height, depth, frameLimit, clipPlanes }: SlitScanGroupProps) => {
  const [allTextures, setAllTextures] = useState<Texture[]>([])
  const frameIndex = useRef(0)
  useEffect(() => {
    allTextures.splice(0, allTextures.length)
    setAllTextures(allTextures)

    frameIndex.current = 0
  }, [video])

  const createFrameLoop = useCallback(async () => {
    const imageBitmap = await createImageBitmap(video, {
      imageOrientation: 'flipY',
    })
    const texture = new Texture(imageBitmap)
    texture.needsUpdate = true

    allTextures.push(texture)
  }, [video])

  const videoIsValid = useCallback(() => {
    return !video.paused && !video.ended && video.videoWidth !== 0 && video.videoHeight !== 0
  }, [video])

  useAnimationFrame(createFrameLoop, videoIsValid)

  const [textures, setTextures] = useState(
    Array.from({ length: frameLimit }, () => new DataTexture(null, width, height, RGBAFormat) as Texture),
  )
  useFrame(() => {
    // if frames are not enough, fill with null frames
    if (allTextures.length < frameLimit) {
      setTextures(
        textures.map((t, i) =>
          i < frameLimit - allTextures.length ? t : allTextures[i - (frameLimit - allTextures.length)],
        ),
      )
      return
    }

    frameIndex.current = (frameIndex.current + 1) % allTextures.length
    setTextures(textures.map((_, i) => allTextures[(frameIndex.current + i) % allTextures.length]))
  })

  // clip the front of the extra drawn box
  const additionalClipPlane = useMemo(() => new Plane(new Vector3(0, 0, -1), Math.ceil(depth / 2)), [depth])

  return (
    <group>
      {textures.map((texture, i) => (
        <mesh key={texture.id} castShadow position={[0, 0, i * (depth / textures.length)]}>
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
