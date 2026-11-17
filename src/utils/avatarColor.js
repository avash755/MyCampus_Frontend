const CAMPUS_GREEN = '#08754f';

function toHexColor(value) {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (!match) return null;
  const shortOrFull = match[1];
  const full = shortOrFull.length === 3
    ? [...shortOrFull].map((character) => character + character).join('')
    : shortOrFull;
  return [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16) / 255);
}

export function campusAvatarColor(value) {
  const rgb = toHexColor(value);
  if (!rgb) return CAMPUS_GREEN;
  const [red, green, blue] = rgb;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const chroma = maximum - minimum;
  if (!chroma) return CAMPUS_GREEN;

  let hue;
  if (maximum === red) hue = ((green - blue) / chroma) % 6;
  else if (maximum === green) hue = (blue - red) / chroma + 2;
  else hue = (red - green) / chroma + 4;
  hue = (hue * 60 + 360) % 360;

  // Older accounts used blue and purple avatar shades that clash with the
  // current campus palette. Keep existing green and warm shades as-is.
  return hue >= 165 && hue <= 290 ? CAMPUS_GREEN : value.trim();
}
