import { Environment, OrbitControls } from '@react-three/drei'
import { Canvas, RootState, useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useState } from 'react'
import * as THREE from 'three'
import './App.css'

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
        <Environment preset="city" />
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

  return (
    <mesh castShadow>
      <boxGeometry args={[10, 10, 10]} />
      <meshStandardMaterial
        color="goldenrod"
        metalness={1}
        roughness={0}
        clippingPlanes={clipPlanes}
        clipShadows
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
