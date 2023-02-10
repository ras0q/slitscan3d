import { OrbitControls, useVideoTexture } from '@react-three/drei'
import { Canvas, RootState, useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useState } from 'react'
import * as THREE from 'three'
import './App.css'
import sampleVideo from './assets/sample-from-pexels.mp4'

function App() {
  const createdHandler = (state: RootState) => {
    state.gl.localClippingEnabled = true
  }

  return (
    <Canvas
      camera={{ fov: 50, position: [10, 0, 0] }}
      dpr={[1, 2]}
      shadows
      onCreated={createdHandler}
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
        <Clipper />
      </Suspense>
    </Canvas>
  )
}

export default App

const Clipper = () => {
  const [normX, setNormX] = useState(0)

  const clipPlanes = useMemo(() => {
    return [new THREE.Plane(new THREE.Vector3(-1, 0, normX), 0)]
  }, [normX])

  useFrame(({ clock }) => {
    setNormX(Math.cos(clock.getElapsedTime()))
  })

  const videoTexture = useVideoTexture(sampleVideo, {})

  return (
    <mesh castShadow>
      <boxGeometry args={[10, 10, 10]} />
      <meshStandardMaterial
        map={videoTexture}
        clippingPlanes={clipPlanes}
        clipShadows
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
