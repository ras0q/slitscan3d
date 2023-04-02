import { OrbitControls } from '@react-three/drei'
import { Canvas, RootState, useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Texture } from 'three'
import sampleVideo from './assets/sample-from-adobe.mp4'
import { useAnimationFrame } from './lib/hooks/useAnimationFrame'

const createVideo = (src: string) => {
  const video = document.createElement('video')
  video.src = src
  video.autoplay = true
  video.muted = true
  video.controls = true

  video.play()

  return video
}

function App() {
  const [video, setVideo] = useState(createVideo(sampleVideo))

  const [x, setX] = useState(1)
  const [y, setY] = useState(0)
  const [z, setZ] = useState(-1)
  const [d, setD] = useState(0)

  const createdHandler = (state: RootState) => {
    state.gl.localClippingEnabled = true
  }

  return (
    <div className="App" style={{ width: '80vw', height: '80vh' }}>
      <div>
        <label htmlFor="x">x</label>
        <input
          type="range"
          name="x"
          min={-1}
          max={1}
          step={0.1}
          value={x}
          onChange={(e) => {
            setX(Number(e.target.value))
          }}
        />
      </div>
      <div>
        <label htmlFor="y">y</label>
        <input
          type="range"
          name="y"
          min={-1}
          max={1}
          step={0.1}
          value={y}
          onChange={(e) => setY(Number(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="z">z</label>
        <input
          type="range"
          name="z"
          min={-1}
          max={1}
          step={0.1}
          value={z}
          onChange={(e) => setZ(Number(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="d">d</label>
        <input
          type="range"
          name="d"
          min={-30}
          max={30}
          value={d}
          onChange={(e) => setD(Number(e.target.value))}
        />
      </div>

      <input
        type="file"
        accept="video/*"
        title="Choose a video file to play"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            const newVideo = createVideo(URL.createObjectURL(e.target.files[0]))
            newVideo.oncanplay = () => {
              setVideo(newVideo)
            }
          }
        }}
      />

      <Canvas
        orthographic
        camera={{ position: [2, 2, 10], zoom: 15, near: -100 }}
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
          <SlitScanGroup
            video={video}
            width={25}
            height={25}
            depth={25}
            frameLimit={100}
            clipPlanes={[new THREE.Plane(new THREE.Vector3(x, y, z), d)]}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default App

type SlitScanGroupProps = {
  video: HTMLVideoElement
  width: number
  height: number
  depth: number
  frameLimit: number
  clipPlanes: THREE.Plane[]
}

const SlitScanGroup = ({
  video,
  width,
  height,
  depth,
  frameLimit,
  clipPlanes,
}: SlitScanGroupProps) => {
  const allTextures = useMemo<Texture[]>(() => [], [video])
  const [textures, setTextures] = useState(allTextures.slice(0, frameLimit))
  const videoCtx = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    return canvas.getContext('2d', { willReadFrequently: true })
  }, [video])

  useAnimationFrame(() => {
    const { paused, ended, videoWidth, videoHeight } = video
    if (paused || ended || videoWidth === 0 || videoHeight === 0) return
    if (videoCtx === null) return

    videoCtx.drawImage(video, 0, 0, videoWidth, videoHeight)
    const texture = new THREE.DataTexture(
      videoCtx.getImageData(0, 0, videoWidth, videoHeight)?.data,
      videoWidth,
      videoHeight,
      THREE.RGBAFormat
    )
    texture.needsUpdate = true
    texture.flipY = true // FIXME: why the frame is upside down?
    allTextures.push(texture)
  }, [video])

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime()

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
            clippingPlanes={[
              new THREE.Plane(
                new THREE.Vector3(0, 0, -1),
                Math.ceil(depth / 2)
              ),
              ...clipPlanes,
            ]}
            clipShadows={true}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
