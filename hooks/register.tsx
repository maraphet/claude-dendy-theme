import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Сатурн в синей ночи: глубокий индиго космоса, небесно-синий акцент,
// песочные полосы планеты и бледное золото колец.
const { theme, problems } = makeColors({
  label: 'Saturn',
  only: 'dark',
  roles: {
    accent: '#3cbcfc', // небесно-синий
    danger: '#f83800', // красный
    success: '#58d854', // зелёный
    warning: '#fca044', // янтарь
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

// ---- Пиксельная сцена: 320×180 ---------------------------------------------

const W = 320
const H = 180

const rect = (x: number, y: number, w: number, h: number, fill: string, extra = ''): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra}/>`

const snap = (n: number): number => Math.round(n / 2) * 2

// Космос: ночной индиго, чуть светлее книзу.
const space =
  rect(0, 0, W, 80, '#0a0a20') + rect(0, 80, W, 50, '#0c0b25') + rect(0, 130, W, 50, '#100d2c')

// Звёзды: один и тот же узор при каждой загрузке.
let seed = 1610
const rand = (): number => {
  seed = (seed * 1103515245 + 12345) % 2147483648

  return seed / 2147483648
}

const STAR_COLORS = ['#f4f0fc', '#f4f0fc', '#3cbcfc', '#e0b060', '#d878f8']
let stars = ''

for (let i = 0; i < 110; i++) {
  const x = Math.floor(rand() * W)
  const y = Math.floor(rand() * H)
  const size = rand() < 0.2 ? 2 : 1
  const color = STAR_COLORS[Math.floor(rand() * STAR_COLORS.length)]!

  stars += rect(x, y, size, size, color, ` class="t${i % 3}"`)
}

// Сатурн: справа, в стороне от текста.
const CX = 240
const CY = 80
const R = 34

// Полосы облаков от полюса к полюсу.
const STRIPES = [
  '#b89058',
  '#cca870',
  '#e0c088',
  '#d4b078',
  '#ecd8a8',
  '#e4c890',
  '#d8b880',
  '#c8a468',
  '#dcbc84',
  '#c09858',
  '#b08850',
  '#a07840',
]

let planet = ''

for (let y = CY - R; y < CY + R; y += 2) {
  const dy = y + 1 - CY
  const half = snap(Math.sqrt(R * R - dy * dy))

  if (half < 2) {
    continue
  }
  const stripe = STRIPES[Math.min(STRIPES.length - 1, Math.floor(((y - (CY - R)) / (2 * R)) * STRIPES.length))]!

  planet += rect(CX - half, y, half * 2, 2, stripe)
  // Ночная сторона: тень слева.
  planet += rect(CX - half, y, snap(half * 0.5), 2, '#1a120a', ' opacity=".5"')
  planet += rect(CX - half + snap(half * 0.5), y, snap(half * 0.3), 2, '#1a120a', ' opacity=".22"')
}

// Одно кольцо между двумя эллипсами; back — дальняя половина, front — ближняя.
const ring = (rxO: number, rxI: number, color: string, side: 'back' | 'front'): string => {
  const flat = 0.23
  const ryO = rxO * flat
  const ryI = rxI * flat
  let out = ''

  for (let y = snap(CY - ryO); y < CY + ryO; y += 2) {
    const dy = y + 1 - CY

    if ((side === 'back') !== dy < 0) {
      continue
    }
    const xo = snap(rxO * Math.sqrt(Math.max(0, 1 - (dy / ryO) ** 2)))
    const xi = Math.abs(dy) < ryI ? snap(rxI * Math.sqrt(1 - (dy / ryI) ** 2)) : 0

    if (xo <= xi) {
      continue
    }
    if (xi === 0) {
      out += rect(CX - xo, y, xo * 2, 2, color)
    } else {
      out += rect(CX - xo, y, xo - xi, 2, color) + rect(CX + xi, y, xo - xi, 2, color)
    }
  }

  return out
}

const rings = (side: 'back' | 'front'): string =>
  ring(78, 70, '#8c7858', side) + // внешнее кольцо
  ring(67, 54, '#e0c898', side) + // яркое среднее, за щелью
  ring(52, 44, '#a89070', side) // тусклое внутреннее

// Тень планеты на дальней половине колец.
const ringShadow = rect(CX - R - 30, CY - 20, 30, 20, '#0a0a20', ' opacity=".55"')

const saturn =
  `<g transform="rotate(-16 ${CX} ${CY})">` +
  rings('back') +
  ringShadow +
  planet +
  rings('front') +
  '</g>'

// Спутники: Титан покрупнее и оранжевый, остальные — светлые точки.
const moons =
  rect(118, 44, 4, 4, '#e8a048') +
  rect(118, 44, 2, 4, '#a86820') +
  rect(152, 122, 2, 2, '#d6ccb8') +
  rect(296, 138, 2, 2, '#d6ccb8') +
  rect(190, 22, 2, 2, '#f6efe2')

// Надпись пиксельным шрифтом 5×7 под планетой.
const CAPTION = 'SOF OF SATURN'

const FONT: Record<string, readonly string[]> = {
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
}

const write = (text: string, centerX: number, top: number, color: string): string => {
  const step = 7
  const left = Math.round(centerX - (text.length * step - 2) / 2)
  let out = ''

  text.split('').forEach((letter, i) => {
    const glyph = FONT[letter]

    if (glyph === undefined) {
      return
    }
    glyph.forEach((row, y) => {
      row.split('').forEach((dot, x) => {
        if (dot === '#') {
          out += rect(left + i * step + x, top + y, 1, 1, color)
        }
      })
    })
  })

  return out
}

const caption = write(CAPTION, CX + 1, 133, '#5c4420') + write(CAPTION, CX, 132, '#e0b060')

const SCENE =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">` +
  '<style>' +
  '@keyframes tw{0%,100%{opacity:1}50%{opacity:.2}}' +
  '.t0{animation:tw 2.8s steps(2) infinite}' +
  '.t1{animation:tw 4.1s steps(2) 1s infinite}' +
  '.t2{animation:tw 5.9s steps(2) 2s infinite}' +
  '@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(2px)}}' +
  '.sat{animation:bob 16s steps(4) infinite}' +
  '@media (prefers-reduced-motion:reduce){.t0,.t1,.t2,.sat{animation:none}}' +
  '</style>' +
  space +
  stars +
  moons +
  `<g class="sat">${saturn}</g>` +
  caption +
  '</svg>'

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: {
    scene: 'saturn',
    // Лёгкая вуаль под панелями, чтобы текст читался, а пиксели не размывались.
    glass: { blur: 2, tint: '#0e0b26', opacity: 0.7 },
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

    return <Svg source={SCENE} alt="Пиксельный Сатурн с кольцами среди звёзд" isInteractive />
  })
}
