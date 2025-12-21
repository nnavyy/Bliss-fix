import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;

export async function dicomToImage(file: File): Promise<HTMLCanvasElement> {
  const imageId =
    cornerstoneWADOImageLoader.wadouri.fileManager.add(file);

  const image = await cornerstone.loadImage(imageId);

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context error");

  const pixelData = image.getPixelData();
  const imageData = ctx.createImageData(image.width, image.height);

  for (let i = 0; i < pixelData.length; i++) {
    const value = pixelData[i];
    imageData.data[i * 4] = value;
    imageData.data[i * 4 + 1] = value;
    imageData.data[i * 4 + 2] = value;
    imageData.data[i * 4 + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
