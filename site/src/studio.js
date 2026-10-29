// The browser workshop: load a video, mark moments, take the stills. Everything
// happens in this tab; the file is never uploaded.

import { makeZip } from './zip.js'

const MAX_MARKS = 40
const SAME_MOMENT = 0.05

const studio = document.getElementById('studio')
if (studio) init(studio)

function init(root) {
  const video = document.getElementById('studioVideo')
  const stage = document.getElementById('stage')
  const fileInput = document.getElementById('videoFile')
  const pickButton = document.getElementById('pickVideo')
  const sampleButton = document.getElementById('loadSample')
  const rail = document.getElementById('studioRail')
  const ticks = document.getElementById('studioTicks')
  const marksLayer = document.getElementById('studioMarks')
  const head = document.getElementById('studioHead')
  const timecode = document.getElementById('studioTc')
  const markButton = document.getElementById('studioMark')
  const markLabel = document.getElementById('studioMarkLabel')
  const markCount = document.getElementById('studioMarkCount')
  const playButton = document.getElementById('playToggle')
  const extractButton = document.getElementById('extractBtn')
  const extractLabel = document.getElementById('extractLabel')
  const removeAllButton = document.getElementById('removeAll')
  const changeButton = document.getElementById('changeVideo')
  const takesCount = document.getElementById('takesCount')
  const status = document.getElementById('studioStatus')
  const clipName = document.getElementById('clipName')
  const clipMeta = document.getElementById('clipMeta')
  const takes = document.getElementById('takes')
  const prints = document.getElementById('prints')
  const contact = document.getElementById('contactSheet')
  const contactEmpty = document.getElementById('contactEmpty')
  const printCount = document.getElementById('printCount')
  const downloadAll = document.getElementById('downloadAll')

  const state = {
    loaded: false,
    duration: 0,
    marks: [],
    frames: [],
    objectUrl: null,
    extracting: false,
    cancel: false,
    visible: false,
    wantsPlay: false,
    resumeAfterScrub: false,
  }

  const pad = (value) => String(value).padStart(2, '0')

  const formatTime = (seconds) => {
    const s = Math.max(0, seconds)
    const minutes = Math.floor(s / 60)
    return `${pad(minutes)}:${pad(Math.floor(s % 60))}.${pad(Math.floor((s % 1) * 100))}`
  }

  const formatLength = (seconds) => {
    if (!Number.isFinite(seconds)) return ''
    if (seconds >= 60) return `${Math.floor(seconds / 60)}:${pad(Math.floor(seconds % 60))}`
    return `${seconds.toFixed(1)} s`
  }

  const spoken = (seconds) => {
    const total = Math.max(0, seconds)
    const minutes = Math.floor(total / 60)
    const secs = Math.floor(total % 60)
    const parts = []
    if (minutes) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`)
    parts.push(`${secs} second${secs === 1 ? '' : 's'}`)
    return parts.join(' ')
  }

  const say = (message) => {
    status.textContent = message
  }

  const isMarkedAt = (seconds) => state.marks.some((mark) => Math.abs(mark - seconds) <= SAME_MOMENT)

  const setPlaying = (playing) => {
    playButton.classList.toggle('is-playing', playing)
    playButton.setAttribute('aria-label', playing ? 'Pause' : 'Play')
  }

  // ── Time and rail ───────────────────────────────────────────────────────

  const syncTime = () => {
    const current = Number.isFinite(video.currentTime) ? video.currentTime : 0
    const progress = state.duration ? Math.min(1, current / state.duration) : 0
    timecode.textContent = formatTime(current)
    head.style.left = `${progress * 100}%`
    rail.setAttribute('aria-valuenow', String(Math.round(progress * 100)))
    rail.setAttribute('aria-valuetext', spoken(current))

    const marked = state.loaded && isMarkedAt(current)
    markButton.classList.toggle('is-removing', marked)
    markLabel.textContent = marked ? 'Remove' : 'Mark'
    markButton.setAttribute('aria-label', marked ? 'Remove the mark at this moment' : 'Mark this frame')

    for (const item of takes.querySelectorAll('[data-time]')) {
      item.classList.toggle('is-current', Math.abs(Number(item.dataset.time) - current) <= SAME_MOMENT)
    }
  }

  const renderRail = () => {
    if (!ticks) return
    const ruler = document.createDocumentFragment()
    for (let i = 0; i <= 32; i += 1) {
      const tick = document.createElement('span')
      tick.className = i % 8 === 0 ? 'rail__tick rail__tick--major' : 'rail__tick'
      tick.style.left = `${(i / 32) * 100}%`
      ruler.append(tick)
    }
    ticks.replaceChildren(ruler)
  }

  const renderMarks = () => {
    markCount.textContent = String(state.marks.length)
    takesCount.textContent = String(state.marks.length)
    marksLayer.replaceChildren(
      ...state.marks.map((time) => {
        const tick = document.createElement('span')
        tick.className = 'rail__mark'
        tick.style.left = `${state.duration ? (time / state.duration) * 100 : 0}%`
        return tick
      }),
    )

    const fragment = document.createDocumentFragment()
    if (!state.marks.length) {
      const empty = document.createElement('li')
      empty.className = 'takes__empty'
      empty.textContent = state.loaded
        ? 'No marks yet. Play the video and press Mark at the moments you want.'
        : 'Choose a video to start marking.'
      fragment.append(empty)
    } else {
      state.marks.forEach((time, index) => {
        const item = document.createElement('li')
        item.className = 'take'
        item.dataset.time = String(time)

        const seek = document.createElement('button')
        seek.type = 'button'
        seek.className = 'take__seek'
        seek.innerHTML = `<span class="take__n">${pad(index + 1)}</span><span class="take__tc">${formatTime(time)}</span>`
        seek.setAttribute('aria-label', `Jump to the mark at ${spoken(time)}`)
        seek.addEventListener('click', () => {
          if (state.extracting) return
          video.pause()
          video.currentTime = Math.max(0, Math.min(state.duration - 0.001, time))
          syncTime()
        })

        const remove = document.createElement('button')
        remove.type = 'button'
        remove.className = 'take__x'
        remove.setAttribute('aria-label', `Remove the mark at ${spoken(time)}`)
        remove.innerHTML = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>'
        remove.addEventListener('click', () => {
          if (state.extracting) return
          removeMark(time)
        })

        item.append(seek, remove)
        fragment.append(item)
      })
    }
    takes.replaceChildren(fragment)
    updateControls()
    syncTime()
  }

  const removeMark = (time) => {
    state.marks = state.marks.filter((mark) => Math.abs(mark - time) > 0.0001)
    renderMarks()
    say(`Mark removed from ${formatTime(time)}. ${state.marks.length} frame${state.marks.length === 1 ? '' : 's'} marked.`)
  }

  const toggleMark = () => {
    if (!state.loaded || state.extracting) return
    const at = Math.max(0, Math.min(state.duration - 0.02, video.currentTime))
    if (isMarkedAt(at)) {
      const nearest = state.marks.reduce((best, mark) =>
        Math.abs(mark - at) < Math.abs(best - at) ? mark : best,
      )
      removeMark(nearest)
      return
    }
    if (state.marks.length >= MAX_MARKS) {
      say(`One sheet holds ${MAX_MARKS} marks. Remove one to add another.`)
      return
    }
    state.marks = [...state.marks, at].sort((a, b) => a - b)
    renderMarks()
    say(`Marked ${formatTime(at)}. ${state.marks.length} frame${state.marks.length === 1 ? '' : 's'} marked.`)
  }

  const updateControls = () => {
    const ready = state.loaded && !state.extracting
    markButton.disabled = !ready
    removeAllButton.disabled = !ready || state.marks.length === 0
    playButton.disabled = !state.loaded
    rail.setAttribute('aria-disabled', state.loaded ? 'false' : 'true')
    rail.tabIndex = state.loaded ? 0 : -1
    pickButton.disabled = state.extracting
    sampleButton.disabled = state.extracting
    changeButton.disabled = state.extracting

    if (state.extracting) {
      extractLabel.textContent = 'Stop extraction'
      extractButton.disabled = false
      extractButton.classList.add('is-stop')
    } else {
      extractButton.classList.remove('is-stop')
      extractLabel.textContent = state.marks.length
        ? `Extract ${state.marks.length} frame${state.marks.length === 1 ? '' : 's'}`
        : 'Extract frames'
      extractButton.disabled = !state.loaded || state.marks.length === 0
    }
  }

  // ── Loading a video ─────────────────────────────────────────────────────

  const clearFrames = () => {
    for (const frame of state.frames) URL.revokeObjectURL(frame.url)
    state.frames = []
    prints.replaceChildren()
    contactEmpty.hidden = false
    printCount.textContent = '0 frames'
    downloadAll.disabled = true
  }

  const resetMarks = () => {
    state.marks = []
    marksLayer.replaceChildren()
    renderMarks()
  }

  const useSource = (src, name, isObjectUrl, sources = null) => {
    if (state.extracting) return
    if (state.objectUrl) URL.revokeObjectURL(state.objectUrl)
    state.objectUrl = isObjectUrl ? src : null
    state.loaded = false
    state.duration = 0
    clearFrames()
    resetMarks()

    clipName.textContent = name
    clipMeta.textContent = 'Reading…'
    stage.classList.remove('is-loaded')

    video.muted = Boolean(sources?.length)
    video.querySelectorAll('source').forEach((source) => source.remove())
    if (sources?.length) {
      video.removeAttribute('src')
      for (const source of sources) {
        const element = document.createElement('source')
        element.src = source.src
        element.type = source.type
        video.append(element)
      }
      video.load()
    } else {
      video.src = src
      video.load()
    }
    say('Reading the video…')
    updateControls()
  }

  const loadSample = () => {
    state.wantsPlay = true
    useSource(null, 'Sample reel', false, [
      { src: '/assets/sample.mp4', type: 'video/mp4' },
      { src: '/assets/sample.webm', type: 'video/webm' },
    ])
  }

  const loadFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('video/') && !/\.(mp4|mov|m4v|webm|ogv)$/i.test(file.name)) {
      say('That file is not a video. Choose an MP4, MOV or WebM.')
      return
    }
    state.wantsPlay = false
    useSource(URL.createObjectURL(file), file.name, true)
  }

  pickButton.addEventListener('click', () => fileInput.click())
  sampleButton.addEventListener('click', loadSample)
  changeButton.addEventListener('click', () => fileInput.click())

  fileInput.addEventListener('change', () => {
    const [file] = fileInput.files ?? []
    loadFile(file)
    fileInput.value = ''
  })

  // Dropping a file anywhere on the stage opens it.
  ;['dragenter', 'dragover'].forEach((type) => {
    stage.addEventListener(type, (event) => {
      event.preventDefault()
      if (!state.extracting) stage.classList.add('is-dragover')
    })
  })
  ;['dragleave', 'dragend'].forEach((type) => {
    stage.addEventListener(type, (event) => {
      if (!stage.contains(event.relatedTarget)) stage.classList.remove('is-dragover')
    })
  })
  stage.addEventListener('drop', (event) => {
    event.preventDefault()
    stage.classList.remove('is-dragover')
    const [file] = event.dataTransfer?.files ?? []
    loadFile(file)
  })

  video.addEventListener('loadedmetadata', () => {
    state.loaded = true
    state.duration = Number.isFinite(video.duration) ? video.duration : 0
    clipMeta.textContent = [
      `${video.videoWidth} × ${video.videoHeight}`,
      formatLength(state.duration),
    ].filter(Boolean).join(' · ')
    contact.style.setProperty('--print-aspect', `${video.videoWidth} / ${video.videoHeight}`)
    stage.classList.add('is-loaded')
    renderRail()
    video.currentTime = Math.min(0.05, state.duration / 2)
    renderMarks()
    updateControls()
    syncTime()
    say('Ready. Play the video, then press Mark at each moment you want.')
  })

  video.addEventListener('loadeddata', () => {
    syncTime()
    if (state.wantsPlay) {
      state.wantsPlay = false
      video.play().catch(() => {
        say('Press play to start the sample.')
      })
    }
  })

  video.addEventListener('error', () => {
    state.loaded = false
    stage.classList.remove('is-loaded')
    clipMeta.textContent = 'Could not read this file'
    updateControls()
    say('That video could not be played here. Try an MP4 or MOV with H.264 video.')
  })

  video.addEventListener('timeupdate', syncTime)
  video.addEventListener('seeked', syncTime)
  video.addEventListener('play', () => {
    setPlaying(true)
    requestAnimationFrame(follow)
  })
  video.addEventListener('pause', () => setPlaying(false))
  video.addEventListener('ended', () => setPlaying(false))
  video.addEventListener('click', () => togglePlay())

  const follow = () => {
    if (video.paused) return
    syncTime()
    requestAnimationFrame(follow)
  }

  const togglePlay = () => {
    if (!state.loaded || state.extracting) return
    if (video.paused) {
      video.play().catch(() => say('The browser would not start playback. Press play again.'))
    } else {
      video.pause()
    }
  }

  playButton.addEventListener('click', togglePlay)

  // ── Scrub ───────────────────────────────────────────────────────────────

  const seekFromEvent = (event) => {
    if (!state.loaded || state.extracting) return
    const box = rail.getBoundingClientRect()
    const progress = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width))
    video.currentTime = progress * state.duration
    head.style.left = `${progress * 100}%`
    timecode.textContent = formatTime(progress * state.duration)
  }

  rail.addEventListener('pointerdown', (event) => {
    if (!state.loaded || state.extracting) return
    rail.focus({ preventScroll: true })
    rail.setPointerCapture(event.pointerId)
    state.resumeAfterScrub = !video.paused
    video.pause()
    seekFromEvent(event)
  })

  rail.addEventListener('pointermove', (event) => {
    if (!rail.hasPointerCapture(event.pointerId)) return
    seekFromEvent(event)
  })

  rail.addEventListener('pointerup', (event) => {
    if (!rail.hasPointerCapture(event.pointerId)) return
    rail.releasePointerCapture(event.pointerId)
    if (state.resumeAfterScrub) video.play().catch(() => {})
    state.resumeAfterScrub = false
  })

  rail.addEventListener('keydown', (event) => {
    if (!state.loaded || state.extracting) return
    const step = event.shiftKey ? 1 : 1 / 30
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        video.currentTime = Math.max(0, video.currentTime - step)
        break
      case 'ArrowRight':
      case 'ArrowUp':
        video.currentTime = Math.min(state.duration, video.currentTime + step)
        break
      case 'Home':
        video.currentTime = 0
        break
      case 'End':
        video.currentTime = state.duration
        break
      case 'm':
      case 'M':
        toggleMark()
        break
      case 'p':
      case 'P':
      case ' ':
        togglePlay()
        break
      default:
        return
    }
    event.preventDefault()
  })

  markButton.addEventListener('click', toggleMark)

  removeAllButton.addEventListener('click', () => {
    if (state.extracting || !state.marks.length) return
    state.marks = []
    renderMarks()
    say('All marks removed. Frames already taken stay on the sheet.')
  })

  // ── Extraction ──────────────────────────────────────────────────────────

  const seekTo = (time) =>
    new Promise((resolve) => {
      const target = Math.max(0, Math.min(state.duration - 0.002, time))
      if (Math.abs(video.currentTime - target) < 0.002) {
        resolve()
        return
      }
      let done = false
      const finish = () => {
        if (done) return
        done = true
        video.removeEventListener('seeked', finish)
        resolve()
      }
      video.addEventListener('seeked', finish)
      video.currentTime = target
      window.setTimeout(finish, 2500)
    })

  // Wait until the seeked frame is actually on screen before reading it.
  const nextPaint = () =>
    new Promise((resolve) => {
      let done = false
      const finish = () => {
        if (done) return
        done = true
        resolve()
      }
      if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(finish)
      requestAnimationFrame(() => requestAnimationFrame(finish))
      window.setTimeout(finish, 500)
    })

  const capture = async (time, index) => {
    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) throw new Error('No picture')

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    context.drawImage(video, 0, 0, width, height)

    // 1080p and below stays lossless; larger frames are easier to carry as
    // high-quality JPEGs, still at the video's own pixel dimensions.
    const dense = width * height > 2_800_000
    const type = dense ? 'image/jpeg' : 'image/png'
    const extension = dense ? 'jpg' : 'png'

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('Could not encode the frame'))),
        type,
        0.95,
      )
    })

    const scale = Math.min(1, 640 / width)
    const thumbCanvas = document.createElement('canvas')
    thumbCanvas.width = Math.max(1, Math.round(width * scale))
    thumbCanvas.height = Math.max(1, Math.round(height * scale))
    thumbCanvas.getContext('2d').drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height)

    const minutes = Math.floor(time / 60)
    const base = `stillsmith-${pad(index + 1)}-${pad(minutes)}-${pad(Math.floor(time % 60))}-${pad(Math.floor((time % 1) * 100))}`

    return {
      time,
      name: `${base}.${extension}`,
      blob,
      url: URL.createObjectURL(blob),
      thumb: thumbCanvas.toDataURL('image/jpeg', 0.8),
    }
  }

  const addPrint = (frame) => {
    const item = document.createElement('li')
    item.className = 'print'

    const picture = document.createElement('figure')
    picture.className = 'print__img'
    const image = document.createElement('img')
    image.src = frame.thumb
    image.alt = `Extracted frame at ${formatTime(frame.time)}`
    image.width = 640
    image.height = Math.max(1, Math.round((640 * video.videoHeight) / video.videoWidth))
    image.loading = 'lazy'
    picture.append(image)

    const meta = document.createElement('div')
    meta.className = 'print__meta'

    const number = document.createElement('span')
    number.className = 'print__n'
    number.textContent = pad(prints.childElementCount + 1)

    const tc = document.createElement('span')
    tc.className = 'print__tc'
    tc.textContent = formatTime(frame.time)

    const link = document.createElement('a')
    link.className = 'print__dl'
    link.href = frame.url
    link.download = frame.name
    link.setAttribute('aria-label', `Download the frame at ${spoken(frame.time)}`)
    link.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.5v7M5 7l3 3 3-3"/><path d="M3 12.5h10"/></svg>'

    meta.append(number, tc, link)
    item.append(picture, meta)
    prints.append(item)

    contactEmpty.hidden = true
    printCount.textContent = `${state.frames.length} frame${state.frames.length === 1 ? '' : 's'}`
    downloadAll.disabled = state.frames.length === 0
  }

  const extract = async () => {
    if (state.extracting) {
      state.cancel = true
      return
    }
    if (!state.loaded || !state.marks.length) return

    const times = [...state.marks]
    const returnTime = video.currentTime
    const wasPlaying = !video.paused

    video.pause()
    state.extracting = true
    state.cancel = false
    clearFrames()
    updateControls()
    say(`Extracting 1 of ${times.length}…`)

    let made = 0
    try {
      for (let index = 0; index < times.length; index += 1) {
        if (state.cancel) break
        const time = times[index]
        say(`Extracting ${index + 1} of ${times.length} · ${formatTime(time)}`)
        await seekTo(time)
        await nextPaint()
        const frame = await capture(time, index)
        state.frames.push(frame)
        addPrint(frame)
        made += 1
      }

      if (state.cancel) {
        say(`Stopped after ${made} of ${times.length}. The frames already taken are on the sheet.`)
      } else if (made === times.length) {
        say(`${made} frame${made === 1 ? '' : 's'} taken at full resolution. Download one, or take them all as a ZIP.`)
      }
    } catch (error) {
      say(`Extraction stopped at ${formatTime(video.currentTime)}. ${error.message}.`)
    } finally {
      state.extracting = false
      state.cancel = false
      updateControls()
      if (Number.isFinite(returnTime)) video.currentTime = Math.min(returnTime, state.duration)
      if (wasPlaying && !made) video.play().catch(() => {})
    }
  }

  extractButton.addEventListener('click', extract)

  // ── Downloading ─────────────────────────────────────────────────────────

  const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  downloadAll.addEventListener('click', async () => {
    if (!state.frames.length) return
    const label = downloadAll.textContent
    downloadAll.disabled = true
    downloadAll.textContent = 'Packing…'
    try {
      const files = []
      for (const frame of state.frames) {
        files.push({ name: frame.name, data: new Uint8Array(await frame.blob.arrayBuffer()) })
      }
      downloadBlob(makeZip(files), 'stillsmith-frames.zip')
      say(`${files.length} frames packed into stillsmith-frames.zip.`)
    } catch {
      say('The frames could not be packed. Download them one at a time.')
    } finally {
      downloadAll.textContent = label
      downloadAll.disabled = state.frames.length === 0
    }
  })

  // ── Shortcuts ───────────────────────────────────────────────────────────

  const observer = new IntersectionObserver(
    ([entry]) => {
      state.visible = entry.isIntersecting
    },
    { threshold: 0.25 },
  )
  observer.observe(root)

  document.addEventListener('keydown', (event) => {
    if (!state.visible || event.metaKey || event.ctrlKey || event.altKey) return
    if (event.target.closest('input, textarea, select, [contenteditable]')) return

    // The rail handles its own keys. Space belongs to focused buttons; P and M
    // are safe from anywhere else.
    if (event.target === rail) return
    if (event.key === ' ' && event.target.closest('button, a')) return

    if (event.key === 'p' || event.key === 'P') {
      if (!state.loaded) return
      event.preventDefault()
      togglePlay()
    } else if (event.key === ' ') {
      // Space stays available for buttons; P is the shortcut that always plays.
      if (!state.loaded) return
      event.preventDefault()
      togglePlay()
    } else if (event.key === 'm' || event.key === 'M') {
      event.preventDefault()
      toggleMark()
    }
  })

  // Initial paint.
  setPlaying(false)
  renderRail()
  renderMarks()
  updateControls()
  syncTime()
}
