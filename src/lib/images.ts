import type { ImageMetadata } from 'astro';

// Eagerly glob every downloaded photo so Astro can process and hash them at
// build time. The data files store bare filenames, which keeps bikes.ts free of
// import statements and means the admin prototype can reference a photo by name
// exactly the way a real CMS would.
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/bikes/*.jpg', {
  eager: true,
});

const byName = new Map<string, ImageMetadata>();
for (const [path, module] of Object.entries(files)) {
  const name = path.split('/').pop();
  if (name) byName.set(name, module.default);
}

export function bikePhoto(filename: string | undefined): ImageMetadata | undefined {
  if (!filename) return undefined;
  return byName.get(filename);
}

export function bikePhotos(filenames: string[]): ImageMetadata[] {
  return filenames.map((f) => byName.get(f)).filter((img): img is ImageMetadata => Boolean(img));
}

// Alt text is generated rather than stored. Every bike would otherwise need
// three hand-written strings, and generated text that names the actual bike
// beats a stored string someone forgot to update after swapping a photo.
export function photoAlt(brand: string, model: string, index: number, total: number) {
  if (index === 0) return `${brand} ${model}, main photo`;
  return `${brand} ${model}, photo ${index + 1} of ${total}`;
}
