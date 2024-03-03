import sampleVideo from '../assets/AdobeStock_255856560.mp4'
import { Range } from './Menu/Range'
import { SlitScanCanvas } from './SlitScan/SlitScanCanvas'
import { ChangeEvent, useCallback, useState } from 'react'
import { useVideo, VideoSrc } from '../lib/hooks/useVideo'

export const App = () => {
  const [videoSrc, setVideoSrc] = useState<VideoSrc>(sampleVideo)
  const video = useVideo(videoSrc)

  const [x, setX] = useState(-1)
  const [y, setY] = useState(0)
  const [z, setZ] = useState(-1)
  const [d, setD] = useState(0)
  const [axesHelperVidible, setAxesHelperVidible] = useState(false)

  const inputRanges = [
    { title: 'x', min: -1, max: 1, step: 0.1, value: x, onChange: setX },
    { title: 'y', min: -1, max: 1, step: 0.1, value: y, onChange: setY },
    { title: 'z', min: -1, max: 1, step: 0.1, value: z, onChange: setZ },
    { title: 'd', min: -15, max: 15, step: 0.1, value: d, onChange: setD },
  ]

  const videoInputButtonOnChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoSrc(URL.createObjectURL(e.target.files[0]))
    }
  }, [])

  const streamButtonOnClick = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    })
    setVideoSrc(stream)
  }, [])

  return (
    <div className="App" style={{ width: '80vw', height: '80vh' }}>
      {inputRanges.map((v, i) => (
        <Range key={i.toString()} {...v} />
      ))}

      <button title="Toggle axes helper" onClick={() => setAxesHelperVidible((prev) => !prev)}>
        toggle axes helper
      </button>

      <div>
        <input type="file" accept="video/*" title="Choose a video file to play" onChange={videoInputButtonOnChange} />
      </div>

      <div>
        <button title="Use stream" onClick={streamButtonOnClick}>
          stream
        </button>
      </div>

      <SlitScanCanvas video={video} x={x} y={y} z={z} d={d} axesHelperVisible={axesHelperVidible} />
    </div>
  )
}
