---
name: Stillsmith site
description: A projector-booth page for an iOS app that pulls stills out of video.
colors:
  booth: "#08090a"
  metal: "#101113"
  metal-raised: "#17181b"
  cream: "#f7f1e3"
  cream-muted: "rgba(247, 241, 227, 0.72)"
  beam: "#fff1d0"
  amber: "#f2a03d"
  paper: "#ece5d5"
  paper-ink: "#16171a"
  alarm: "#e2574c"
  hairline: "rgba(255, 255, 255, 0.1)"
typography:
  display:
    fontFamily: "Syne, 'Helvetica Neue', sans-serif"
    fontSize: "clamp(2.9rem, 1.4rem + 5.6vw, 5.4rem)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-0.045em"
  heading:
    fontFamily: "Syne, 'Helvetica Neue', sans-serif"
    fontSize: "clamp(1.9rem, 1.2rem + 2.4vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  body:
    fontFamily: "'Space Grotesk', system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.075rem)"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  data:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.06em"
rounded:
  sm: "3px"
  md: "10px"
  phone: "34px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2rem"
  xl: "clamp(4rem, 9vw, 7rem)"
components:
  button-primary:
    backgroundColor: "{colors.beam}"
    textColor: "#191307"
    rounded: "{rounded.sm}"
    typography: "{typography.body}"
    padding: "0 1.25rem"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.amber}"
    textColor: "#191307"
    rounded: "{rounded.sm}"
    height: "48px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.sm}"
    height: "48px"
  mark-button:
    backgroundColor: "{colors.amber}"
    textColor: "#1a1206"
    rounded: "{rounded.sm}"
    height: "44px"
---

## Overview

The page is lit by one projector beam in a dark booth. A still is a frame held in
the light, so the interface is dark metal, warm light and film paper — never a
gradient hero with stacked feature cards. The reader should recognise the app's
transport in the first viewport and be able to install it two screens later.

## Colors

**The warm light (primary).** `beam #fff1d0` and `amber #f2a03d` are the only
saturated colours. They light the hero, mark the transport, and colour the copy
button. Amber is also the grease pencil on the contact sheet.

**The booth (neutral).** `booth #08090a`, `metal #101113` and `metal-raised
#17181b` stack by one step to separate the nav and the frames. Text is `cream
#f7f1e3` at full strength for headings, 0.86 for the claim, 0.72 for body, 0.62
for supporting copy.

**The paper (secondary).** The contact sheet is `paper #ece5d5` with `paper-ink
#16171a`; it is the only light surface on the page and it exists to make the
screenshots read as prints.

**Named rules.** *Red is reserved.* `alarm #e2574c` appears only for destructive
actions; nothing decorative may use it. *Hairlines, not boxes.* Surfaces separate
with 1px `hairline`; cards and drop shadows are not the system.

## Typography

Syne 800 carries the wordmark and every heading; Space Grotesk 400/500 carries
prose and controls; JetBrains Mono appears only for timecode, frame numbers and
other data. Faces are self-hosted woff2 files.

Hierarchy steps by roughly 1.6× from display to heading, and headings are set at
-0.03em tracking with `text-wrap: balance`. Body measure stays between 46 and 66
characters.

## Layout

One column is centred at `min(1180px, 100% - 2×padding)`. Sections alternate
between the dark booth and the paper sheet, and each section is separated by a
1px hairline rather than a container. The hero is a two-column grid at 960px and
wider (copy, then the port glass) and stacks below that.

## Elevation & Depth

Depth comes from light, not shadows: the beam, the port glow, and a 3.5% grain
overlay. The only shadows are the phone's own drop shadow and a soft offset under
each screenshot print.

## Motion

One authored moment: the transport. Dragging the rail moves the playhead and
timecode; Mark drops an amber tab. Dust drifts in the beam at 22–34s cycles.
Everything is suppressed under `prefers-reduced-motion`.

## Components

Buttons are 48px tall with a 3px radius; the Mark control is 44px to keep the
hit target. The rail is a 44px tall roving slider with a 2px playhead, film ticks
in two weights, and amber marks that rise 26px. Screenshots sit in a 10px paper
border with a 2px inner radius. Spec rows are a two-column hairline grid (mono
label, body value); install steps use the same grid with the action in the value
column.

## Accessibility

Body text meets 4.5:1; the rail is a focusable slider with arrow, Home/End and
`m` keys plus `aria-valuetext`; every image carries descriptive alt text; focus
rings are 2px amber at 3px offset; motion is optional.
