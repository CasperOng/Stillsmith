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
  // A 32-tick ruler, drawn rather than tiled from a gradient.
  const ticks = document.getElementById('ticks')
  if (ticks) {
    const ruler = document.createDocumentFragment()
    for (let i = 0; i <= 32; i += 1) {
      const tick = document.createElement('span')
      tick.className = i % 8 === 0 ? 'rail__tick rail__tick--major' : 'rail__tick'
      tick.style.left = `${(i / 32) * 100}%`
      ruler.append(tick)
    }
    ticks.replaceChildren(ruler)
  }

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
    const label = button.dataset.label ?? button.textContent.trim()
    try {
      await navigator.clipboard.writeText(value)
      button.textContent = 'Copied'
      button.classList.add('is-copied')
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
      button.textContent = label
      button.classList.remove('is-copied')
    }, 2000)
  })
})


// Nav: glass states, tone over the paper section, hide on scroll, active link, menu.
const nav = document.getElementById("siteNav")
const navMenu = document.getElementById("navMenu")
const navToggle = nav?.querySelector(".nav__toggle")
const navLinks = [...(nav?.querySelectorAll(".nav__links a") ?? [])]
const lightSections = [...document.querySelectorAll('[data-surface="light"]')]
const navSections = ["screens", "details", "credit"]
  .map((id) => document.getElementById(id))
  .filter(Boolean)
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

if (nav) {
  let lastY = window.scrollY
  let queued = false

  const updateNav = () => {
    queued = false
    const y = window.scrollY
    nav.classList.toggle("is-scrolled", y > 50)

    // Read against the bar's own bottom edge, not a fixed offset.
    const barBottom = nav.querySelector(".nav__pill")?.getBoundingClientRect().bottom ?? 72
    const overLight = lightSections.some((section) => {
      const rect = section.getBoundingClientRect()
      return rect.top <= barBottom && rect.bottom > barBottom
    })
    nav.dataset.tone = overLight ? "light" : "dark"

    if (!reducedMotion.matches) {
      if (y > 120 && y > lastY + 8) nav.classList.add("is-hidden")
      else if (y < lastY - 8) nav.classList.remove("is-hidden")
    }
    lastY = y

    const current = navSections.find((section) => {
      const rect = section.getBoundingClientRect()
      return rect.top <= 140 && rect.bottom >= 140
    })
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", current ? link.hash === `#${current.id}` : false)
    })
  }

  const onScroll = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(updateNav)
  }

  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onScroll)
  updateNav()

  const closeMenu = () => {
    if (!navMenu || navMenu.hidden) return
    navMenu.hidden = true
    nav.classList.remove("is-open")
    navToggle?.setAttribute("aria-expanded", "false")
  }

  navToggle?.addEventListener("click", () => {
    const open = navMenu.hidden
    navMenu.hidden = !open
    nav.classList.toggle("is-open", open)
    navToggle.setAttribute("aria-expanded", String(open))
  })

  navMenu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu()
  })

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target)) closeMenu()
  })

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu()
      nav.classList.remove("is-hidden")
    }
  })
}


document.getElementById('year').textContent = String(new Date().getFullYear())
