import { OrbitControls } from '@react-three/drei'
import { Canvas, RootState, useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useState } from 'react'
import * as THREE from 'three'
import './App.css'
import frames from './generated/frames'

function App() {
  const createdHandler = (state: RootState) => {
    state.gl.localClippingEnabled = true
  }

  return (
    <Canvas
      orthographic
      camera={{ position: [10, 2, -2], zoom: 10 }}
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
  const allTextures = useMemo(() => frames, [])
  const frameLimit = useMemo(() => 100, [])
  const [textures, setTextures] = useState(allTextures.slice(0, frameLimit))

  const clipPlanes = useMemo(() => {
    return [new THREE.Plane(new THREE.Vector3(-1, 0, normX), 0)]
  }, [normX])

  useFrame(({ clock }) => {
    setNormX(Math.cos(clock.getElapsedTime()))

    const frameIndex = Math.floor(clock.getElapsedTime() * 30)
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
          position={[i * (10 / textures.length), 0, 0]}
        >
          <boxGeometry args={[10, 10, 10]} />
          <meshStandardMaterial
            map={texture}
            clippingPlanes={clipPlanes}
            clipShadows={true}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
