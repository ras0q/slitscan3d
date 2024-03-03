import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  DataTexture,
  DoubleSide,
  Plane,
  RGBAFormat,
  Texture,
  Vector3,
  MeshStandardMaterial,
} from 'three'

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

  const texturesRef = useRef<Texture[]>([])
  const reqIdRef = useRef(0)

  useEffect(() => {
    const pushFrame = async () => {
      const imageBitmap = await createImageBitmap(video, {
        imageOrientation: 'from-image',
      })
      const texture = new Texture(imageBitmap)
      texture.needsUpdate = true
      texturesRef.current.push(texture)

      if (video.paused) {
        console.log('capture completed!!!')
        video.cancelVideoFrameCallback(reqIdRef.current)
        return
      }

      reqIdRef.current = video.requestVideoFrameCallback(pushFrame)
    }
    reqIdRef.current = video.requestVideoFrameCallback(pushFrame)

    return () => {
      texturesRef.current.forEach((texture) => texture.dispose())
      video.cancelVideoFrameCallback(reqIdRef.current)
    }
  }, [video])

  const fps = (video.playbackRate * video.getVideoPlaybackQuality().totalVideoFrames) / video.currentTime
  const offsetRef = useRef(0)
  const materialRefs = Array.from({ length: frameLimit }, () =>
    useRef(
      new MeshStandardMaterial({
        map: new DataTexture(null, width, height, RGBAFormat) as Texture,
      }),
    ),
  )

  useFrame((_, delta) => {
    if (texturesRef.current.length === 0) return

    const canRotateFrames = video.paused || texturesRef.current.length >= frameLimit
    if (canRotateFrames) {
      offsetRef.current = (offsetRef.current + fps * delta) % texturesRef.current.length
    }

    materialRefs.forEach((ref, i) => {
      if (!canRotateFrames && i > texturesRef.current.length - 1) return
      ref.current.needsUpdate = true
      ref.current.map = texturesRef.current[(i + Math.floor(offsetRef.current)) % texturesRef.current.length]
    })
  })

  // clip the front of the extra drawn box
  const additionalClipPlane = useMemo(() => new Plane(new Vector3(0, 0, -1), Math.ceil(depth / 2)), [depth])

  return (
    <group>
      {materialRefs.map((ref, i) => (
        <mesh
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
