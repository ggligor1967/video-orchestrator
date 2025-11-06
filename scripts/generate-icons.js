// Generate all required icon files for Tauri
// Creates valid PNG and ICO files from scratch

import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join } from 'path';

const iconsDir = './apps/ui/src-tauri/icons';

// Create a simple app icon with gradient background
async function createBaseIcon(size) {
  // Create SVG with app initials "VO" (Video Orchestrator)
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.4}" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="central">VO</text>
    </svg>
  `;

  return sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

async function generateAllIcons() {
  console.log('🎨 Generating Tauri icons...\n');

  try {
    // Generate PNG icons
    const pngSizes = {
      'icon.png': 512,
      '32x32.png': 32,
      '128x128.png': 128,
      '128x128@2x.png': 256
    };

    for (const [filename, size] of Object.entries(pngSizes)) {
      console.log(`  ✓ Creating ${filename} (${size}x${size})`);
      const buffer = await createBaseIcon(size);
      writeFileSync(join(iconsDir, filename), buffer);
    }

    // Generate ICO file (Windows)
    console.log('\n📦 Creating icon.ico with multiple resolutions...');
    const icoSizes = [16, 32, 48, 64, 128, 256];
    const icoBuffers = [];

    for (const size of icoSizes) {
      console.log(`  ✓ Generating ${size}x${size}...`);
      icoBuffers.push(await createBaseIcon(size));
    }

    // Create ICO header
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // Reserved
    header.writeUInt16LE(1, 2); // Type (1 = ICO)
    header.writeUInt16LE(icoSizes.length, 4); // Number of images

    // Create directory entries
    let offset = 6 + (icoSizes.length * 16);
    const directories = [];

    for (let i = 0; i < icoSizes.length; i++) {
      const size = icoSizes[i];
      const buffer = icoBuffers[i];
      const dir = Buffer.alloc(16);

      dir.writeUInt8(size === 256 ? 0 : size, 0); // Width
      dir.writeUInt8(size === 256 ? 0 : size, 1); // Height
      dir.writeUInt8(0, 2); // Color palette
      dir.writeUInt8(0, 3); // Reserved
      dir.writeUInt16LE(1, 4); // Color planes
      dir.writeUInt16LE(32, 6); // Bits per pixel
      dir.writeUInt32LE(buffer.length, 8); // Image size
      dir.writeUInt32LE(offset, 12); // Offset

      directories.push(dir);
      offset += buffer.length;
    }

    const ico = Buffer.concat([header, ...directories, ...icoBuffers]);
    writeFileSync(join(iconsDir, 'icon.ico'), ico);
    console.log(`  ✅ icon.ico created (${ico.length} bytes)`);

    // Generate ICNS for macOS (simple version)
    console.log('\n🍎 Creating icon.icns (macOS)...');
    const icnsBuffer = await createBaseIcon(1024);
    
    // Simple ICNS header (just contains the largest size)
    const icnsHeader = Buffer.alloc(8);
    icnsHeader.write('icns', 0);
    icnsHeader.writeUInt32BE(icnsBuffer.length + 8, 4);
    
    const icns = Buffer.concat([icnsHeader, icnsBuffer]);
    writeFileSync(join(iconsDir, 'icon.icns'), icns);
    console.log(`  ✅ icon.icns created (${icns.length} bytes)`);

    console.log('\n✅ All icons generated successfully!');
    console.log('🚀 Ready for Tauri build!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateAllIcons();
