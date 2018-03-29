import * as React from 'react'
import { data, Entry } from '../../data/data'
import * as PlotlyObj from 'plotly.js'

const AMAZON_PREFIX = 'https://s3-us-west-2.amazonaws.com/synth-embeddings-samples/'

declare global {
  const Plotly: typeof PlotlyObj
}

import './Scatter.css'

interface PlotlyClickEvent {
  points: any[]
  event: MouseEvent
}

interface PlotlyHTMLElement extends HTMLElement {
  on(eventName: string, handler: (event: PlotlyClickEvent) => void): void
}

interface ComponentState {
  selectedIndex: number | undefined
}

class Scatter extends React.Component<{}, ComponentState> {
  state = {
    selectedIndex: undefined,
  }

  audio: HTMLAudioElement

  componentDidMount() {
    const trace = {
      x: data.data.map((x) => x.proj[0]),
      y: data.data.map((x) => x.proj[1]),
      z: data.data.map((x) => x.proj[2]),
      text: data.data.map((x) => x.displayName),
      hoverinfo: 'text' as 'text',
      mode: 'markers' as 'markers',
      hovermode: 'closest' as 'closest',
      marker: {
        size: 12,
        color: data.data.map((x) => x.group),
      },
      type: 'scatter3d' as 'scatter3d',
    }

    const layout = {
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
      },
    }

    const element = document.getElementById('scatter') as PlotlyHTMLElement
    Plotly.newPlot(element, [trace], layout, { displayModeBar: false })

    element.on('plotly_click', (p: PlotlyClickEvent) => {
      const point = p.points[0]
      if (point) {
        const index = point.pointNumber
        this.setSelected(index)
      }
    })

    element.on('plotly_beforehover', () => false)
  }

  setSelected = (selectedIndex: number) => {
    this.setState({ selectedIndex })
    setTimeout(() => {
      this.audio.play()
    })
  }

  renderSample(displayName: string, filename: string, index?: number, distance?: number) {
    const setRef = (ref: HTMLAudioElement) => {
      if (distance === undefined) this.audio = ref!
    }

    if (distance) {
      displayName += ` (${distance.toFixed(1)})`
    }

    const processedFilename = filename.replace('samples/', '')
    const soundUrl = `${AMAZON_PREFIX}${processedFilename}`

    return (
      <div className="sample" key={filename}>
        <h5>{displayName || 'no sample selected'}</h5>
        <audio ref={setRef} controls controlsList="nodownload">
          {filename && <source src={soundUrl} type="audio/mp3" />}
        </audio>
      </div>
    )
  }

  renderClosest(index: number) {
    const selected = data.data[index]

    const getDistance = (entry: Entry) => {
      const dx = entry.proj[0] - selected.proj[0]
      const dy = entry.proj[1] - selected.proj[1]
      const dz = entry.proj[2] - selected.proj[2]
      return Math.sqrt(dx * dx + dy * dy + dz * dz)
    }

    const closest = data.data.slice().sort((a, b) => {
      return getDistance(a) - getDistance(b)
    })
    return (
      <div>
        <h5>closest</h5>
        {closest.slice(1, 5).map((entry) => {
          const distance = getDistance(entry)
          return this.renderSample(entry.displayName, entry.filename, entry.index, distance)
        })}
      </div>
    )
  }

  render() {
    const { selectedIndex } = this.state
    const selectedEntry =
      selectedIndex !== undefined ? data.data[selectedIndex] : { displayName: '', filename: '' }
    const { filename, displayName } = selectedEntry

    return (
      <div>
        <div id="scatter" />
        {this.renderSample(displayName, filename, selectedIndex)}
        {selectedIndex !== undefined && this.renderClosest(selectedIndex)}
      </div>
    )
  }
}

export default Scatter
