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

  const [textures, setTextures] = useState<Texture[]>([])
  const reqIdRef = useRef(0)

  useEffect(() => {
    const pushFrame = async () => {
      const imageBitmap = await createImageBitmap(video, {
        imageOrientation: 'from-image',
      })
      const texture = new Texture(imageBitmap)
      texture.needsUpdate = true

      setTextures((prev) => (video.paused ? prev : [...prev, texture]))

      if (video.paused) {
        console.log('capture completed!!!')
        video.cancelVideoFrameCallback(reqIdRef.current)
        return
      }

      reqIdRef.current = video.requestVideoFrameCallback(pushFrame)
    }
    reqIdRef.current = video.requestVideoFrameCallback(pushFrame)

    return () => {
      textures.forEach((texture) => texture.dispose())
      video.cancelVideoFrameCallback(reqIdRef.current)
    }
  }, [video, textures])

  const fps = (video.playbackRate * video.getVideoPlaybackQuality().totalVideoFrames) / video.currentTime
  const offsetRef = useRef(0)
  const materialRefs = Array.from({ length: frameLimit }, () =>
    useRef<MeshStandardMaterial>(
      new MeshStandardMaterial({
        map: new DataTexture(null, width, height, RGBAFormat) as Texture,
      }),
    ),
  )

  useFrame((_, delta) => {
    if (textures.length === 0) return

    const canRotateFrames = video.paused || textures.length >= frameLimit
    if (canRotateFrames) {
      offsetRef.current = (offsetRef.current + fps * delta) % textures.length
    }

    materialRefs.forEach((ref, i) => {
      if (!canRotateFrames && i > textures.length - 1) return
      ref.current.map = textures[(i + Math.floor(offsetRef.current)) % textures.length]
    })
  })

  // clip the front of the extra drawn box
  const additionalClipPlane = useMemo(() => new Plane(new Vector3(0, 0, -1), Math.ceil(depth / 2)), [depth])

  return (
    <group receiveShadow>
      {materialRefs.map((ref, i) => (
        <mesh
          castShadow
          key={ref.current.id}
          position={[0, 0, depth - i * (depth / materialRefs.length)]}
          rotation={[Math.PI, 0, 0]} // NOTE: imageBitmap is roteated 180 degrees
        >
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
