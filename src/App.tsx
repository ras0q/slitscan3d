import { OrbitControls } from '@react-three/drei'
import { Canvas, RootState, useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Texture } from 'three'
import './App.css'
import sampleVideo from './assets/sample-from-adobe.mp4'

function App() {
  const createdHandler = (state: RootState) => {
    state.gl.localClippingEnabled = true
  }

  const [video, setVideo] = useState(() => {
    const video = document.createElement('video')
    video.src = sampleVideo
    video.autoplay = true
    video.muted = true
    video.controls = true
    video.play()
    return video
  })

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
          <Clipper
            width={25}
            height={25}
            depth={25}
            frameLimit={100}
            video={video}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default App

type ClipperProps = {
  width: number
  height: number
  depth: number
  frameLimit: number
  video: HTMLVideoElement
}

const Clipper = ({ width, height, depth, frameLimit, video }: ClipperProps) => {
  const allTextures = useMemo<Texture[]>(() => [], [])
  const [textures, setTextures] = useState(allTextures.slice(0, frameLimit))

  const clipVec = useMemo(() => new THREE.Vector3(0, 0, -1), [])
  const clipPlanes = useMemo(() => [new THREE.Plane(clipVec, 0)], [clipVec])

  const videoCtx = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    return canvas.getContext('2d')
  }, [])

  useFrame(({ clock }) => {
    if (!(video.paused || video.ended)) {
      videoCtx?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
      const texture = new THREE.DataTexture(
        videoCtx?.getImageData(0, 0, video.videoWidth, video.videoHeight)?.data,
        video.videoWidth,
        video.videoHeight,
        THREE.RGBAFormat
      )
      texture.needsUpdate = true
      texture.flipY = true // FIXME: why the frame is upside down?
      allTextures.push(texture)
      console.log(allTextures.length)
    }

    const elapsed = clock.getElapsedTime()
    clipVec.set(Math.cos(elapsed), 0, -1)

    const frameIndex = Math.floor(elapsed * 30) % allTextures.length
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
