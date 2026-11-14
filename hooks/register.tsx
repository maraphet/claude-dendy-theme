import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Вечер у телевизора с 8-битной приставкой: тёмный индиго экрана,
// чистые цвета палитры той эпохи и пиксельный закат за текстом.
const { theme, problems } = makeColors({
  label: 'Dendy 8-bit',
  only: 'dark',
  roles: {
    accent: '#3cbcfc', // небесно-синий
    danger: '#f83800', // красный
    success: '#58d854', // зелёный
    warning: '#fca044', // янтарный
    pro: '#d878f8', // розово-фиолетовый
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0e0b26',
        'surface-1': '#151131',
        'surface-2': '#1c163c',
        'surface-3': '#211a45',
        'text-primary': '#f4f0fc',
        'text-secondary': '#cdc6ea',
        'text-muted': '#aaa2d4',
      },
    },
  },
})

// ---- Пиксельная сцена: 320×180, как кадр старой приставки -----------------

const W = 320
const H = 180

const rect = (x: number, y: number, w: number, h: number, fill: string, extra = ''): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra}/>`

// Небо ступенчатыми полосами: от ночного индиго к закатной малине у горизонта.
const BANDS: readonly (readonly [number, string])[] = [
  [0, '#0a0a20'],
  [64, '#0e0e30'],
  [90, '#161244'],
  [110, '#24145e'],
  [126, '#3c1878'],
  [138, '#641e8c'],
  [148, '#982c90'],
  [156, '#d04878'],
  [162, '#f87858'],
]

const sky = BANDS.map(([y, color], i) => {
  const end = i + 1 < BANDS.length ? BANDS[i + 1]![0] : H

  return rect(0, y, W, end - y, color)
}).join('')

// Звёзды: один и тот же узор при каждой загрузке.
let seed = 1987
const rand = (): number => {
  seed = (seed * 1103515245 + 12345) % 2147483648

  return seed / 2147483648
}

const STAR_COLORS = ['#f4f0fc', '#3cbcfc', '#fca044', '#d878f8']
let stars = ''

for (let i = 0; i < 80; i++) {
  const x = Math.floor(rand() * W)
  const y = Math.floor(rand() * 118)
  const size = rand() < 0.25 ? 2 : 1
  const color = STAR_COLORS[Math.floor(rand() * rand() * STAR_COLORS.length)]!

  stars += rect(x, y, size, size, color, ` class="t${i % 3}"`)
}

// Луна из ступенек.
let moon = ''

for (let row = -6; row < 6; row++) {
  const half = Math.round(Math.sqrt(6.5 * 6.5 - (row + 0.5) * (row + 0.5)))

  moon += rect(262 - half * 2, 34 + row * 2, half * 4, 2, '#fce4a0')
}
moon += rect(256, 28, 4, 2, '#e8c070') + rect(266, 38, 4, 4, '#e8c070') + rect(254, 40, 2, 2, '#e8c070')

// Горы: столбики шириной 8, высота ступеньками по 4.
const ridge = (base: number, amp: number, f1: number, f2: number, color: string): string => {
  let out = ''

  for (let i = 0; i < W / 8; i++) {
    const raw = base + amp * (Math.sin(i * f1) + Math.sin(i * f2 + 1.3))
    const height = Math.max(4, Math.round(raw / 4) * 4)

    out += rect(i * 8, 168 - height, 8, height, color)
  }

  return out
}

const mountains = ridge(34, 11, 0.55, 0.21, '#2c1468') + ridge(16, 7, 0.9, 0.37, '#150b3a')

// Земля: тёмная полоса с травяной кромкой.
let ground = rect(0, 168, W, 12, '#0c0a22') + rect(0, 168, W, 2, '#58d854')

for (let x = 0; x < W; x += 16) {
  ground += rect(x + 4, 170, 4, 2, '#2c9c3c') + rect(x + 12, 174, 4, 2, '#1c1648')
}

// Облако из блоков.
const cloud = (x: number, y: number, cls: string): string =>
  `<g class="${cls}">` +
  rect(x + 8, y, 16, 4, '#3a3488') +
  rect(x + 4, y + 4, 28, 4, '#3a3488') +
  rect(x, y + 8, 40, 4, '#2c2870') +
  '</g>'

const SCENE =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">` +
  '<style>' +
  '@keyframes tw{0%,100%{opacity:1}50%{opacity:.15}}' +
  '.t0{animation:tw 2.4s steps(2) infinite}' +
  '.t1{animation:tw 3.7s steps(2) 1s infinite}' +
  '.t2{animation:tw 5.3s steps(2) 2s infinite}' +
  '@keyframes drift{from{transform:translateX(-80px)}to{transform:translateX(360px)}}' +
  '.c0{animation:drift 140s steps(220) infinite}' +
  '.c1{animation:drift 200s steps(220) -90s infinite}' +
  '@media (prefers-reduced-motion:reduce){.t0,.t1,.t2,.c0,.c1{animation:none}}' +
  '</style>' +
  '<defs><pattern id="scan" width="2" height="2" patternUnits="userSpaceOnUse">' +
  rect(0, 1, 2, 1, '#000000') +
  '</pattern></defs>' +
  sky +
  stars +
  moon +
  cloud(0, 52, 'c0') +
  cloud(0, 84, 'c1') +
  mountains +
  ground +
  `<rect width="${W}" height="${H}" fill="url(#scan)" opacity=".14"/>` +
  '</svg>'

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: {
    scene: 'pixel-dusk',
    // Лёгкая вуаль под панелями, чтобы текст читался, а пиксели не размывались.
    glass: { blur: 2, tint: '#0e0b26', opacity: 0.72 },
  },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="Пиксельный закат: звёзды, луна и горы в стиле 8-битных игр" isInteractive />
  })
}
