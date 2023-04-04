import sampleVideo from '../assets/sample.mp4'
import { Range } from './Menu/Range'
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

  const inputRanges = [
    { title: 'x', min: -1, max: 1, step: 0.1, value: x, onChange: setX },
    { title: 'y', min: -1, max: 1, step: 0.1, value: y, onChange: setY },
    { title: 'z', min: -1, max: 1, step: 0.1, value: z, onChange: setZ },
    { title: 'd', min: -30, max: 30, step: 1, value: d, onChange: setD },
  ]

  const videoInputButtonOnChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newVideo = createVideo(URL.createObjectURL(e.target.files[0]))
      newVideo.oncanplay = () => {
        setVideo(newVideo)
      }
    }
  }, [])

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
      {inputRanges.map((v, i) => (
        <Range key={i.toString()} {...v} />
      ))}

      <div>
        <input type="file" accept="video/*" title="Choose a video file to play" onChange={videoInputButtonOnChange} />
      </div>

      <div>
        <button title="Use stream" onClick={streamButtonOnClick}>
          stream
        </button>
      </div>

      <SlitScanCanvas video={video} x={x} y={y} z={z} d={d} />
    </div>
  )
}
