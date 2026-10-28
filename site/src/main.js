// Stillsmith — the transport demo, copy control and entrance motion.

const DURATION = 180 // seconds in the sample clip
const TICKS_PER_SECOND = 100

const rail = document.getElementById('rail')
const head = document.getElementById('head')
const marksLayer = document.getElementById('railMarks')
const timecode = document.getElementById('tc')
const markButton = document.getElementById('mark')
const markCount = document.getElementById('markCount')
const markStatus = document.getElementById('markStatus')

let progress = 0
let marks = []

const format = (seconds) => {
  const clamped = Math.max(0, Math.min(DURATION, seconds))
  const minutes = Math.floor(clamped / 60)
  const secs = Math.floor(clamped % 60)
  const hundredths = Math.round((clamped % 1) * 100) % 100
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`
}

const spoken = (seconds) => {
  const total = Math.round(seconds)
  const minutes = Math.floor(total / 60)
  const secs = total % 60
  const parts = []
  if (minutes) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`)
  parts.push(`${secs} second${secs === 1 ? '' : 's'}`)
  return parts.join(' ')
}

const render = () => {
  const time = progress * DURATION
  head.style.left = `${progress * 100}%`
  timecode.textContent = format(time)
  rail.setAttribute('aria-valuenow', String(Math.round(progress * 100)))
  rail.setAttribute('aria-valuetext', spoken(time))

  marksLayer.replaceChildren(
    ...marks.map((position) => {
      const tick = document.createElement('span')
      tick.className = 'rail__mark'
      tick.style.left = `${position * 100}%`
      return tick
    }),
  )

  markCount.textContent = String(marks.length)
}

const setProgress = (value) => {
  progress = Math.max(0, Math.min(1, value))
  render()
}

const seekFromEvent = (event) => {
  const box = rail.getBoundingClientRect()
  setProgress((event.clientX - box.left) / box.width)
}

const addMark = () => {
  if (marks.some((position) => Math.abs(position - progress) < 0.004)) {
    markStatus.textContent = 'Already marked at that moment.'
    return
  }
  marks = [...marks, progress].sort((a, b) => a - b)
  render()
  markStatus.textContent = `Marked ${format(progress * DURATION)}. ${marks.length} frame${marks.length === 1 ? '' : 's'} marked.`
}

// Drag anywhere on the rail; the playhead follows the finger or pointer.
if (rail) {
  rail.addEventListener('pointerdown', (event) => {
    rail.setPointerCapture(event.pointerId)
    seekFromEvent(event)
  })

  rail.addEventListener('pointermove', (event) => {
    if (rail.hasPointerCapture(event.pointerId)) seekFromEvent(event)
  })

  rail.addEventListener('pointerup', (event) => {
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId)
  })

  rail.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 10 : 1
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        setProgress(progress - step / DURATION)
        break
      case 'ArrowRight':
      case 'ArrowUp':
        setProgress(progress + step / DURATION)
        break
      case 'Home':
        setProgress(0)
        break
      case 'End':
        setProgress(1)
        break
      case 'm':
      case 'M':
        addMark()
        break
      default:
        return
    }
    event.preventDefault()
  })

  render()
}

markButton?.addEventListener('click', addMark)

// Copy the Feather source.
document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copy)
    if (!target) return
    const value = target.textContent.trim()
    try {
      await navigator.clipboard.writeText(value)
      button.textContent = 'Copied'
    } catch {
      // Older browsers and non-secure contexts: select the text so people can copy it.
      const range = document.createRange()
      range.selectNodeContents(target)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      button.textContent = 'Selected'
    }
    window.setTimeout(() => {
      button.textContent = 'Copy'
    }, 2000)
  })
})

// Entrance: one move, from an already-visible default where motion is reduced.
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (!reduced && 'IntersectionObserver' in window) {
  const targets = document.querySelectorAll('.sheet__head, .frame, .spec__head, .spec__list > div, .install__head, .step, .credit__inner')
  targets.forEach((element) => element.classList.add('reveal'))

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('in')
        observer.unobserve(entry.target)
      })
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
  )

  targets.forEach((element) => observer.observe(element))
}

document.getElementById('year').textContent = String(new Date().getFullYear())
