import sampleVideo from '../assets/sample.mp4'
import { SlitScanCanvas } from './SlitScan/SlitScanCanvas'
import { ChangeEvent, useCallback, useState } from 'react'

const createVideo = (src: string | MediaProvider) => {
  const video = document.createElement('video')
  video.autoplay = true
  video.muted = true
  video.controls = true

  switch (typeof src) {
    case 'string':
      video.src = src
      break
    case 'object':
      video.srcObject = src
      break
  }

  video.play()

  return video
}

export const App = () => {
  const [video, setVideo] = useState(createVideo(sampleVideo))
  const [x, setX] = useState(-1)
  const [y, setY] = useState(0)
  const [z, setZ] = useState(-1)
  const [d, setD] = useState(0)

  const inputRange = {
    x: { min: -1, max: 1, step: 0.1, value: x, onChange: setX },
    y: { min: -1, max: 1, step: 0.1, value: y, onChange: setY },
    z: { min: -1, max: 1, step: 0.1, value: z, onChange: setZ },
    d: { min: -30, max: 30, step: 1, value: d, onChange: setD },
  }

  const videoInputButtonOnChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const newVideo = createVideo(URL.createObjectURL(e.target.files[0]))
        newVideo.oncanplay = () => {
          setVideo(newVideo)
        }
      }
    },
    [],
  )

  const streamButtonOnClick = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    })
    const newVideo = createVideo(stream)
    newVideo.oncanplay = () => {
      setVideo(newVideo)
    }
  }, [])

  return (
    <div className="App" style={{ width: '80vw', height: '80vh' }}>
      {Object.entries(inputRange).map(
        ([key, { min, max, step, value, onChange }]) => (
          <div key={key}>
            <label htmlFor={key}>{key}</label>
            <input
              type="range"
              title={key}
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
            />
          </div>
        ),
      )}

      <div>
        <input
          type="file"
          accept="video/*"
          title="Choose a video file to play"
          onChange={videoInputButtonOnChange}
        />
      </div>

      <div>
        <button title='Use stream' onClick={streamButtonOnClick}>
          stream
        </button>
      </div>

      <SlitScanCanvas video={video} x={x} y={y} z={z} d={d} />
    </div>
  )
}
