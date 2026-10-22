/** Crop an image file to a centered square and shrink it to `size` px so the data URL stays small. Throws if the file is not a readable image. */
export async function squareImage(file: File, size = 256): Promise<string> {
  const bmp = await createImageBitmap(file)
  const side = Math.min(bmp.width, bmp.height)
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  canvas.getContext("2d")!.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, size, size)
  return canvas.toDataURL("image/jpeg", 0.85)
}
