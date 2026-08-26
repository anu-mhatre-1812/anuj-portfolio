import Jimp from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = 'C:/Users/ADMIN/Downloads/Gemini_Generated_Image_aw25asaw25asaw25.png';
const OUT = path.join(__dirname, '..', 'public', 'anuj-character.png');

const img = await Jimp.read(SRC);
const { width, height, data } = img.bitmap;
const at = (x, y) => (y * width + x) * 4;
const visited = new Uint8Array(width * height);

const queue = [];
for (let x = 0; x < width; x++) queue.push([x, 0], [x, height - 1]);
for (let y = 0; y < height; y++) queue.push([0, y], [width - 1, y]);

while (queue.length) {
  const [x, y] = queue.pop();
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const p = y * width + x;
  if (visited[p]) continue;
  visited[p] = 1;
  const o = at(x, y);
  if (Math.max(data[o], data[o + 1], data[o + 2]) > 60) continue;
  data[o + 3] = 0;
  queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

for (let pass = 0; pass < 4; pass++) {
  const toClear = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const o = at(x, y);
      if (data[o + 3] === 0) continue;
      if (Math.max(data[o], data[o + 1], data[o + 2]) > 55) continue;
      const n =
        data[at(x + 1, y) + 3] === 0 ||
        data[at(x - 1, y) + 3] === 0 ||
        data[at(x, y + 1) + 3] === 0 ||
        data[at(x, y - 1) + 3] === 0;
      if (n) toClear.push(o);
    }
  }
  toClear.forEach((o) => (data[o + 3] = 0));
}

let minX = width, minY = height, maxX = 0, maxY = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (data[at(x, y) + 3] > 0) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
const pad = 16;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(width - 1, maxX + pad);
maxY = Math.min(height - 1, maxY + pad);

img.crop(minX, minY, maxX - minX + 1, maxY - minY + 1);
await img.quality(90).writeAsync(OUT);
console.log('saved', OUT, img.bitmap.width + 'x' + img.bitmap.height);
