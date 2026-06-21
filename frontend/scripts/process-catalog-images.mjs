import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const PUBLIC_DIR = path.resolve("public");
const SOURCE_DIR = path.join(PUBLIC_DIR, "uploads/catalog/source");
const OUTPUT_DIR = path.join(PUBLIC_DIR, "uploads/catalog/items");
const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const SIZE = 960;

function getOutputName(filePath) {
  const parsed = path.parse(filePath);
  return `${parsed.name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")}.webp`;
}

async function collectInputFiles(args) {
  if (args.length > 0) {
    return args.map((filePath) => path.resolve(filePath));
  }

  const entries = await readdir(SOURCE_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(SOURCE_DIR, entry.name))
    .filter((filePath) => SUPPORTED_EXTENSIONS.has(path.extname(filePath).toLowerCase()));
}

async function processImage(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    return null;
  }

  const outputName = getOutputName(filePath);
  const outputPath = path.join(OUTPUT_DIR, outputName);

  await sharp(filePath)
    .rotate()
    .resize({
      width: SIZE,
      height: SIZE,
      fit: "cover",
      position: "centre",
      withoutEnlargement: true,
    })
    .webp({
      quality: 86,
      effort: 6,
    })
    .toFile(outputPath);

  return {
    outputPath,
    publicUrl: `/uploads/catalog/items/${outputName}`,
  };
}

await mkdir(SOURCE_DIR, { recursive: true });
await mkdir(OUTPUT_DIR, { recursive: true });

const inputFiles = await collectInputFiles(process.argv.slice(2));

if (inputFiles.length === 0) {
  console.log(`No images found. Put source images into ${SOURCE_DIR}`);
  process.exit(0);
}

const processed = [];

for (const filePath of inputFiles) {
  const result = await processImage(filePath);
  if (result) {
    processed.push(result);
  }
}

for (const item of processed) {
  console.log(`${item.publicUrl} -> ${item.outputPath}`);
}
