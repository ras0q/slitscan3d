import { SlitScanGroup } from './SlitScanGroup'
import { OrbitControls } from '@react-three/drei'
import { Canvas, RootState } from '@react-three/fiber'
import { Suspense } from 'react'
import { Plane, Vector3 } from 'three'

type SlitScanCanvasProps = {
  video: HTMLVideoElement
  x: number
  y: number
  z: number
  d: number
  axesHelperVisible: boolean
}

export const SlitScanCanvas = ({ video, x, y, z, d, axesHelperVisible }: SlitScanCanvasProps) => {
  if (!video.videoWidth || !video.videoHeight) return null

  const width = 1000
  const height = (video.videoHeight / video.videoWidth) * width
  const depth = Math.max(width, height)

  return (
    <Canvas
      orthographic
      camera={{
        position: [width, height, depth * 5],
        zoom: 0.5,
        near: -100,
        far: 10000,
      }}
      dpr={[1, 2]}
      shadows
      flat
      linear
      onCreated={(state: RootState) => {
        state.gl.localClippingEnabled = true
      }}
    >
      <axesHelper args={[depth * 2]} visible={axesHelperVisible} />
      <OrbitControls />
      <ambientLight intensity={3} />
      <directionalLight position={[width, height, depth * 5]} intensity={0.5} />

      <Suspense fallback={null}>
        <SlitScanGroup
          video={video}
          width={width}
          height={height}
          depth={depth}
          frameLimit={100}
          clipPlanes={[new Plane(new Vector3(x, y, z), d)]}
        />
      </Suspense>
    </Canvas>
  )
}
