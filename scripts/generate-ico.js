// Generate Windows ICO file from PNG using sharp
// This creates a proper multi-resolution ICO file for Tauri

import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [16, 32, 48, 64, 128, 256];
const sourcePath = join(__dirname, '../apps/ui/src-tauri/icons/icon.png');
const outputPath = join(__dirname, '../apps/ui/src-tauri/icons/icon.ico');

async function generateICO() {
  console.log('📦 Generating Windows ICO file...');
  console.log(`Source: ${sourcePath}`);
  console.log(`Output: ${outputPath}`);

  try {
    // Read source PNG
    const sourceBuffer = await sharp(sourcePath)
      .ensureAlpha()
      .toBuffer();

    // Generate all sizes
    const buffers = await Promise.all(
      sizes.map(async (size) => {
        console.log(`  ✓ Generating ${size}x${size}...`);
        return sharp(sourceBuffer)
          .resize(size, size, { 
            fit: 'contain', 
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer();
      })
    );

    // Create ICO header
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // Reserved (must be 0)
    header.writeUInt16LE(1, 2); // Type (1 = ICO)
    header.writeUInt16LE(sizes.length, 4); // Number of images

    // Create directory entries
    let offset = 6 + (sizes.length * 16); // Header + directory entries
    const directories = [];

    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      const buffer = buffers[i];
      const dir = Buffer.alloc(16);

      dir.writeUInt8(size === 256 ? 0 : size, 0); // Width (0 means 256)
      dir.writeUInt8(size === 256 ? 0 : size, 1); // Height (0 means 256)
      dir.writeUInt8(0, 2); // Color palette (0 = no palette)
      dir.writeUInt8(0, 3); // Reserved
      dir.writeUInt16LE(1, 4); // Color planes
      dir.writeUInt16LE(32, 6); // Bits per pixel
      dir.writeUInt32LE(buffer.length, 8); // Image size
      dir.writeUInt32LE(offset, 12); // Image offset

      directories.push(dir);
      offset += buffer.length;
    }

    // Combine all parts
    const ico = Buffer.concat([
      header,
      ...directories,
      ...buffers
    ]);

    // Write ICO file
    writeFileSync(outputPath, ico);

    console.log(`\n✅ ICO file generated successfully!`);
    console.log(`   Size: ${ico.length} bytes`);
    console.log(`   Resolutions: ${sizes.join('x, ')}x`);
    console.log(`\n🎯 Ready for Tauri build!`);

  } catch (error) {
    console.error('❌ Error generating ICO:', error.message);
    process.exit(1);
  }
}

generateICO();
