#!/usr/bin/env node
// Generates the wide, short banner images in public/banners/: one per forum section plus the home
// banner. Each is a low-poly mesh on bitsocial.net's dark stage, tinted with the section color (the
// same polygon language as bitsocial-web's mesh backgrounds), with a large line icon for what the
// section is about. Output is deterministic: the mesh is seeded by the section code.
//
// Run with `corepack yarn banners:generate` after adding a section or changing its color or icon.

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Bot, Coffee, Coins, Images, Megaphone, MessagesSquare, Network, Server, ShieldCheck, Sprout } from 'lucide-react';
import { FORUM_CATEGORIES } from '../src/data/sections.ts';

const WIDTH = 1600;
const HEIGHT = 320;
const COLUMNS = 17;
const ROWS = 5;
const ICON_SCALE = 9;
const outputDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'banners');

// What each section is about, as a lucide icon.
const SECTION_ICONS = {
  announcements: Megaphone,
  general: MessagesSquare,
  bso: Coins,
  seedit: Sprout,
  '5chan': Images,
  ai: Bot,
  pkc: Network,
  challenges: ShieldCheck,
  infra: Server,
  'off-topic': Coffee,
};

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// mulberry32: a small seeded PRNG so every run draws the same mesh.
function createRandom(seed) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value) => Math.round(value * 10) / 10;

function meshPoints(random) {
  const points = [];
  for (let row = 0; row < ROWS; row++) {
    const line = [];
    for (let column = 0; column < COLUMNS; column++) {
      const isEdgeX = column === 0 || column === COLUMNS - 1;
      const isEdgeY = row === 0 || row === ROWS - 1;
      const x = (column / (COLUMNS - 1)) * WIDTH + (isEdgeX ? 0 : (random() - 0.5) * (WIDTH / (COLUMNS - 1)) * 0.7);
      const y = (row / (ROWS - 1)) * HEIGHT + (isEdgeY ? 0 : (random() - 0.5) * (HEIGHT / (ROWS - 1)) * 0.7);
      line.push([round(x), round(y)]);
    }
    points.push(line);
  }
  return points;
}

// Triangles get brighter toward the glow center and fade toward the left, where text sits.
function meshTriangles(random, colorAt, glowX) {
  const points = meshPoints(random);
  const triangles = [];
  for (let row = 0; row < ROWS - 1; row++) {
    for (let column = 0; column < COLUMNS - 1; column++) {
      const a = points[row][column];
      const b = points[row][column + 1];
      const c = points[row + 1][column];
      const d = points[row + 1][column + 1];
      const pairs =
        (row + column) % 2 === 0
          ? [
              [a, b, d],
              [a, d, c],
            ]
          : [
              [a, b, c],
              [b, d, c],
            ];
      for (const triangle of pairs) {
        const centerX = (triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3;
        const centerY = (triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3;
        const distance = Math.hypot((centerX - glowX) / WIDTH, (centerY - HEIGHT / 2) / HEIGHT / 3);
        const strength = Math.max(0, 1 - distance * 1.6);
        const fillOpacity = round((0.02 + strength * 0.22) * (0.55 + random() * 0.45) * 100) / 100;
        const strokeOpacity = round((0.06 + strength * 0.22) * 100) / 100;
        const color = colorAt(centerX / WIDTH);
        triangles.push(
          `<polygon points="${triangle.map((point) => point.join(',')).join(' ')}" fill="${color}" fill-opacity="${fillOpacity}" stroke="${color}" stroke-opacity="${strokeOpacity}" stroke-width="1"/>`,
        );
      }
    }
  }
  return triangles.join('');
}

function iconMarkup(Icon, color) {
  const markup = renderToStaticMarkup(createElement(Icon, { color, strokeWidth: 1.25 }));
  const inner = markup.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const size = 24 * ICON_SCALE;
  const x = WIDTH * 0.8 - size / 2;
  const y = HEIGHT / 2 - size / 2;
  return `<g transform="translate(${x} ${y}) scale(${ICON_SCALE})" fill="none" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" opacity="0.9">${inner}</g>`;
}

function bannerSvg({ meshColorAt, glows, icon }) {
  const glowDefs = glows
    .map(
      (glow, index) =>
        `<radialGradient id="glow${index}" cx="${glow.x}" cy="${glow.y}" r="${glow.r}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${glow.color}" stop-opacity="${glow.opacity}"/><stop offset="1" stop-color="${glow.color}" stop-opacity="0"/></radialGradient>`,
    )
    .join('');
  const glowRects = glows.map((_, index) => `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow${index})"/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="stage" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0c0c10"/><stop offset="1" stop-color="#121218"/></linearGradient>${glowDefs}</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#stage)"/>${glowRects}
<g>${meshColorAt()}</g>${icon ?? ''}
</svg>
`;
}

function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mixColors(stops, t) {
  const scaled = Math.min(stops.length - 1, Math.max(0, t * (stops.length - 1)));
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const from = hexToRgb(stops[index]);
  const to = hexToRgb(stops[index + 1]);
  const mixed = from.map((channel, channelIndex) => Math.round(channel + (to[channelIndex] - channel) * local));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

mkdirSync(outputDir, { recursive: true });
const sections = FORUM_CATEGORIES.flatMap((category) => category.sections);

for (const section of sections) {
  const Icon = SECTION_ICONS[section.code];
  if (!Icon) throw new Error(`No banner icon for section "${section.code}"; add one to SECTION_ICONS.`);
  const random = createRandom(hashString(section.code));
  const svg = bannerSvg({
    meshColorAt: () => meshTriangles(random, () => section.color, WIDTH * 0.8),
    glows: [{ x: WIDTH * 0.8, y: HEIGHT / 2, r: WIDTH * 0.45, color: section.color, opacity: 0.38 }],
    icon: iconMarkup(Icon, section.color),
  });
  writeFileSync(path.join(outputDir, `${section.code}.svg`), svg);
}

// The home banner spans every section color, left to right, under two blue glows.
const random = createRandom(hashString('home'));
const homeColors = sections.map((section) => section.color);
writeFileSync(
  path.join(outputDir, 'home.svg'),
  bannerSvg({
    meshColorAt: () => meshTriangles(random, (t) => mixColors(homeColors, t), WIDTH * 0.62),
    glows: [
      { x: WIDTH * 0.62, y: HEIGHT * 0.45, r: WIDTH * 0.42, color: '#2563eb', opacity: 0.42 },
      { x: WIDTH * 0.95, y: HEIGHT * 0.2, r: WIDTH * 0.3, color: '#1a4fd0', opacity: 0.35 },
    ],
  }),
);

console.log(`Wrote ${sections.length + 1} banners to ${path.relative(process.cwd(), outputDir)}/`);
