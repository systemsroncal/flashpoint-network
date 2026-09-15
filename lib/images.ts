import sharp from "sharp";

export type OptimizedImage = {
  buffer: Buffer;
  contentType: "image/webp";
  extension: "webp";
  width: number;
  height: number;
};

/**
 * Optimize an uploaded image with Sharp (rotate, max width, WebP).
 */
export async function optimizeImage(
  input: Buffer,
  options?: { maxWidth?: number; quality?: number },
): Promise<OptimizedImage> {
  const maxWidth = options?.maxWidth ?? 1920;
  const quality = options?.quality ?? 82;

  const pipeline = sharp(input, { failOn: "none" })
    .rotate()
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    contentType: "image/webp",
    extension: "webp",
    width: info.width,
    height: info.height,
  };
}

/** @deprecated Use optimizeImage — kept for older imports. */
export async function optimizeImageStub(_buffer: Buffer) {
  return {
    ok: false as const,
    message: "Use optimizeImage() instead.",
  };
}
