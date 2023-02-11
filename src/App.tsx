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
    <div className="App" style={{ width: '80vw', height: '80vh' }}>
      <Canvas
        orthographic
        camera={{ position: [2, 2, 10], zoom: 10 }}
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
    </div>
  )
}

export default App

const Clipper = () => {
  const [normX, setNormX] = useState(0)
  const allTextures = useMemo(() => frames, [])
  const frameLimit = useMemo(() => 100, [])
  const [width, height, depth] = useMemo(() => [25, 25, 25], [])
  const [textures, setTextures] = useState(allTextures.slice(0, frameLimit))

  const clipPlanes = useMemo(() => {
    return [new THREE.Plane(new THREE.Vector3(normX, 0, -1), 0)]
  }, [normX])

  useFrame(({ clock }) => {
    setNormX(Math.cos(clock.getElapsedTime()))

    const frameIndex =
      Math.floor(clock.getElapsedTime() * 30) % allTextures.length
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
            clippingPlanes={clipPlanes}
            clipShadows={true}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
