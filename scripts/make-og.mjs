import Jimp from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const W = 1200;
const H = 630;

const bg = new Jimp(W, H, '#FAF5E9');

const char = await Jimp.read(path.join(__dirname, '..', 'public', 'anuj-character.png'));
char.resize(Jimp.AUTO, 560);
bg.composite(char, W - char.bitmap.width - 40, H - 560 - 20);

const nameFont = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
const subFont = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
const smallFont = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);

bg.print(nameFont, 70, 170, 'ANUJ MHATRE');
bg.print(subFont, 74, 330, 'AI/ML · Full-stack · Hardware');
bg.print(smallFont, 76, 400, '@a18-n03 — navi mumbai, in');

const bar = new Jimp(430, 10, '#FF9933');
bg.composite(bar, 70, 310);

const badge = new Jimp(150, 44, '#FFD23F');
bg.composite(badge, 70, 460);
bg.print(
  await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK),
  86,
  474,
  'OPEN TO WORK'
);

await bg.writeAsync(path.join(__dirname, '..', 'public', 'og.png'));
console.log('og.png saved', W + 'x' + H);
