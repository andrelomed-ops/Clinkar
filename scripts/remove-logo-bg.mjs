// Script: remove white background from SK logo, save transparent PNG
import sharp from 'sharp';

async function removeWhiteBackground() {
    const inputPath  = './public/logo_sk_3d.png';
    const outputPath = './public/logo_sk_transparent.png';

    const { data, info } = await sharp(inputPath)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info; // channels = 4 (RGBA)
    const pixels = Buffer.from(data);

    for (let i = 0; i < width * height; i++) {
        const off = i * 4;
        const r = pixels[off];
        const g = pixels[off + 1];
        const b = pixels[off + 2];

        // Near-white threshold: all channels > 210
        if (r > 210 && g > 210 && b > 210) {
            // Smooth alpha: fully transparent for near-white, partial for edge anti-aliasing
            const brightness = (r + g + b) / 3;
            const alpha = Math.round(255 * Math.max(0, (255 - brightness) / 45));
            pixels[off + 3] = Math.min(pixels[off + 3], alpha);
        }
    }

    await sharp(pixels, {
        raw: { width, height, channels: 4 }
    })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

    console.log(`✓ Transparent PNG saved: ${outputPath}`);
}

removeWhiteBackground().catch(console.error);
