import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    const compressedFile = new File(
      [compressedBlob],
      file.name,
      { type: compressedBlob.type }
    );
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file;
  }
}
