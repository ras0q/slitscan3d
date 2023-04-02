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
}

export const SlitScanCanvas = ({ video, x, y, z, d }: SlitScanCanvasProps) => {
  return (
    <Canvas
      orthographic
      camera={{ position: [2, 2, 10], zoom: 15, near: -100 }}
      dpr={[1, 2]}
      shadows
      onCreated={(state: RootState) => {
        state.gl.localClippingEnabled = true
      }}
    >
      <OrbitControls />
      <ambientLight intensity={0.1} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        shadowMapWidth={2048}
        shadowMapHeight={2048}
        castShadow
      />

      <Suspense fallback={null}>
        <SlitScanGroup
          video={video}
          width={25}
          height={25}
          depth={25}
          frameLimit={100}
          clipPlanes={[new Plane(new Vector3(x, y, z), d)]}
        />
      </Suspense>
    </Canvas>
  )
}
