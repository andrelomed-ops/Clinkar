// Script: remove white background from the ORIGINAL Option C logo, save transparent PNG
import sharp from 'sharp';

async function removeWhiteBackground() {
    // Using the FIRST generated image that the user liked
    const inputPath  = './logo_option_c_acrylic_backlit_1776883257303.png';
    const outputPath = './public/logo_sk_transparent.png';

    console.log(`Processing: ${inputPath}`);

    // Load and remove background
    const image = sharp(inputPath);
    
    const { data, info } = await image
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    const pixels = Buffer.from(data);

    for (let i = 0; i < width * height; i++) {
        const off = i * 4;
        const r = pixels[off];
        const g = pixels[off + 1];
        const b = pixels[off + 2];

        // Aggressive threshold: anything close to white or very light gray
        // The first image has a very light gray background
        if (r > 200 && g > 200 && b > 200) {
            pixels[off + 3] = 0; // Fully transparent
        }
    }

    // Save with trim to remove the empty space/frame
    await sharp(pixels, {
        raw: { width, height, channels: 4 }
    })
    .trim() // REMOVE THE RECTANGULAR FRAME SPACE
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

    console.log(`✓ Hyper-clean Transparent PNG saved: ${outputPath}`);
}

removeWhiteBackground().catch(err => {
    console.error("Error processing logo:", err);
    process.exit(1);
});
