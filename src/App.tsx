import { OrbitControls, useVideoTexture } from '@react-three/drei'
import { Canvas, RootState, useFrame, useLoader } from '@react-three/fiber'
import { Suspense, useMemo, useState } from 'react'
import * as THREE from 'three'
import './App.css'
import { frames } from './frames'

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
  const _textures = useLoader(THREE.TextureLoader, frames)
  const [normX, setNormX] = useState(0)
  const [textures, setTextures] = useState(_textures)

  const clipPlanes = useMemo(() => {
    return [new THREE.Plane(new THREE.Vector3(-1, 0, normX), 0)]
  }, [normX])

  useFrame(({ clock }) => {
    setNormX(Math.cos(clock.getElapsedTime()))

    const lastFrame = textures[textures.length - 1]
    const newFrames = [lastFrame, ...textures.slice(0, textures.length - 1)]
    setTextures(newFrames)
  })

  return (
    <group>
      {textures.map((texture, i) => (
        <mesh key={i} castShadow position={[i * (10 / textures.length), 0, 0]}>
          <boxGeometry args={[10 / textures.length, 10, 10]} />
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
