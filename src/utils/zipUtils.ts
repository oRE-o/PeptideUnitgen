import JSZip from 'jszip';
import type { Preset } from '../types';

export const exportPresetToZip = async (preset: Preset): Promise<Blob> => {
  const zip = new JSZip();
  const imagesFolder = zip.folder('images');
  if (!imagesFolder) throw new Error("Failed to create root folder in zip.");

  const clonedPreset: Preset = JSON.parse(JSON.stringify(preset));

  // Process units
  for (const unit of clonedPreset.units) {
    if (unit.image && unit.image.startsWith('data:image')) {
      const base64Data = unit.image.split(',')[1];
      const filename = `unit-${unit.id}-main.jpg`;
      imagesFolder.file(filename, base64Data, { base64: true });
      unit.image = `images/${filename}`;
    }
    
    if (unit.images && unit.images.length > 0) {
      const newImagesUrls = [];
      for (let idx = 0; idx < unit.images.length; idx++) {
        const img = unit.images[idx];
        if (img.startsWith('data:image')) {
          const base64Data = img.split(',')[1];
          const filename = `unit-${unit.id}-${idx}.jpg`;
          imagesFolder.file(filename, base64Data, { base64: true });
          newImagesUrls.push(`images/${filename}`);
        } else {
          newImagesUrls.push(img);
        }
      }
      unit.images = newImagesUrls;
    }
  }

  // Process items
  for (const item of clonedPreset.items) {
    if (item.image && item.image.startsWith('data:image')) {
      const base64Data = item.image.split(',')[1];
      const filename = `item-${item.id}.jpg`;
      imagesFolder.file(filename, base64Data, { base64: true });
      item.image = `images/${filename}`;
    }
  }

  zip.file('data.json', JSON.stringify(clonedPreset, null, 2));

  return await zip.generateAsync({ type: 'blob' });
};

export const importPresetFromZip = async (file: File): Promise<Preset> => {
  const zip = await JSZip.loadAsync(file);
  const dataFile = zip.file('data.json');
  if (!dataFile) throw new Error("Invalid preset file: data.json not found inside zip.");
  
  const jsonString = await dataFile.async('string');
  const preset: Preset = JSON.parse(jsonString);

  // Restore unit images
  for (const unit of preset.units) {
    if (unit.image && unit.image.startsWith('images/')) {
      const imgFile = zip.file(unit.image);
      if (imgFile) {
        const base64 = await imgFile.async('base64');
        unit.image = `data:image/jpeg;base64,${base64}`;
      }
    }
    
    if (unit.images && unit.images.length > 0) {
      const restoredImages = [];
      for (const imgPath of unit.images) {
        if (imgPath.startsWith('images/')) {
          const imgFile = zip.file(imgPath);
          if (imgFile) {
             const base64 = await imgFile.async('base64');
             restoredImages.push(`data:image/jpeg;base64,${base64}`);
          } else {
             restoredImages.push(imgPath);
          }
        } else {
          restoredImages.push(imgPath);
        }
      }
      unit.images = restoredImages;
    }
  }

  // Restore item images
  for (const item of preset.items) {
    if (item.image && item.image.startsWith('images/')) {
      const imgFile = zip.file(item.image);
      if (imgFile) {
        const base64 = await imgFile.async('base64');
        item.image = `data:image/jpeg;base64,${base64}`;
      }
    }
  }

  return preset;
};
