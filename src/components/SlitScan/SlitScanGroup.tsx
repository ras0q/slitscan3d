import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DataTexture, DoubleSide, MeshStandardMaterial, Plane, RGBAFormat, Texture, Vector3 } from 'three'

type SlitScanGroupProps = {
  video: HTMLVideoElement
  width: number
  height: number
  depth: number
  frameLimit: number
  clipPlanes: Plane[]
}

export const SlitScanGroup = ({ video, width, height, depth, frameLimit, clipPlanes }: SlitScanGroupProps) => {
  if (!video) return null

  const [allTextures, setAllTextures] = useState<Texture[]>([])
  const reqIdRef = useRef(0)

  useEffect(() => {
    const pushFrame = async () => {
      const imageBitmap = await createImageBitmap(video, {
        imageOrientation: 'flipY',
      })
      const texture = new Texture(imageBitmap)
      texture.needsUpdate = true

      setAllTextures((prev) => (video.paused ? prev : [...prev, texture]))

      if (video.paused) {
        video.cancelVideoFrameCallback(reqIdRef.current)
        return
      }

      reqIdRef.current = video.requestVideoFrameCallback(pushFrame)
    }
    reqIdRef.current = video.requestVideoFrameCallback(pushFrame)

    return () => {
      allTextures.forEach((texture) => texture.dispose())
      video.cancelVideoFrameCallback(reqIdRef.current)
    }
  }, [video])

  const offsetRef = useRef(0)
  const materialRefs = Array.from({ length: frameLimit }, () =>
    useRef<MeshStandardMaterial>(
      new MeshStandardMaterial({
        map: new DataTexture(null, width, height, RGBAFormat) as Texture,
      }),
    ),
  )

  useFrame(() => {
    if (allTextures.length === 0) return

    if (video.paused || allTextures.length >= frameLimit) {
      offsetRef.current = (offsetRef.current + 1) % allTextures.length
    }

    materialRefs.forEach((ref, i) => {
      if (i >= allTextures.length) return
      ref.current.map = allTextures[(i + offsetRef.current) % allTextures.length]
    })
  })

  // clip the front of the extra drawn box
  const additionalClipPlane = useMemo(() => new Plane(new Vector3(0, 0, -1), Math.ceil(depth / 2)), [depth])

  return (
    <group>
      {materialRefs.map((ref, i) => (
        <mesh key={ref.current.id} castShadow position={[0, 0, depth - i * (depth / materialRefs.length)]}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            ref={ref}
            clippingPlanes={[additionalClipPlane, ...clipPlanes]}
            clipShadows={true}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
