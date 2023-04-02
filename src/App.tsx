import { useState } from 'react'
import sampleVideo from './assets/sample-from-adobe.mp4'
import { SlitScanCanvas } from './components/slitscan/SlitScanCanvas'

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

      <SlitScanCanvas video={video} x={x} y={y} z={z} d={d} />
    </div>
  )
}

export default App
