/**
 * Image Optimization Script
 * 
 * This script optimizes images in the public directory by:
 * - Converting images to WebP format
 * - Resizing images to different dimensions for responsive loading
 * - Compressing images to reduce file size
 * 
 * Usage: node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const config = {
  inputDir: path.join(__dirname, '../public/images'),
  outputDir: path.join(__dirname, '../public/images/optimized'),
  sizes: [320, 640, 1024, 1920], // Responsive image sizes
  quality: 80, // WebP quality (0-100)
  formats: ['webp', 'jpg'] // Output formats
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Get all image files from input directory
const getImageFiles = (dir) => {
  const files = fs.readdirSync(dir);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
  });
};

// Process a single image
const processImage = async (inputFile) => {
  const filename = path.basename(inputFile, path.extname(inputFile));
  const image = sharp(path.join(config.inputDir, inputFile));
  const metadata = await image.metadata();
  
  console.log(`Processing ${inputFile}...`);
  
  // Create optimized versions for each size and format
  for (const size of config.sizes) {
    // Skip sizes larger than the original image
    if (size > metadata.width) continue;
    
    const resizedImage = image.resize(size);
    
    for (const format of config.formats) {
      const outputFilename = `${filename}-${size}.${format}`;
      const outputPath = path.join(config.outputDir, outputFilename);
      
      try {
        if (format === 'webp') {
          await resizedImage.webp({ quality: config.quality }).toFile(outputPath);
        } else if (format === 'jpg' || format === 'jpeg') {
          await resizedImage.jpeg({ quality: config.quality }).toFile(outputPath);
        } else if (format === 'png') {
          await resizedImage.png({ quality: config.quality }).toFile(outputPath);
        }
        
        console.log(`Created ${outputFilename}`);
      } catch (error) {
        console.error(`Error processing ${inputFile} to ${format} at size ${size}:`, error);
      }
    }
  }
  
  // Also create a tiny placeholder image for blur-up effect
  try {
    const placeholderFilename = `${filename}-placeholder.webp`;
    const placeholderPath = path.join(config.outputDir, placeholderFilename);
    
    await image
      .resize(20) // Tiny size for placeholder
      .webp({ quality: 20 })
      .toFile(placeholderPath);
      
    console.log(`Created placeholder ${placeholderFilename}`);
  } catch (error) {
    console.error(`Error creating placeholder for ${inputFile}:`, error);
  }
};

// Main function
const optimizeImages = async () => {
  try {
    const imageFiles = getImageFiles(config.inputDir);
    
    if (imageFiles.length === 0) {
      console.log('No images found in the input directory.');
      return;
    }
    
    console.log(`Found ${imageFiles.length} images to process.`);
    
    // Process each image
    for (const file of imageFiles) {
      await processImage(file);
    }
    
    console.log('Image optimization complete!');
    
    // Generate a manifest file with image information
    generateManifest(imageFiles);
    
  } catch (error) {
    console.error('Error optimizing images:', error);
  }
};

// Generate a manifest file with information about the optimized images
const generateManifest = (imageFiles) => {
  const manifest = {};
  
  for (const file of imageFiles) {
    const filename = path.basename(file, path.extname(file));
    
    manifest[filename] = {
      sizes: {},
      placeholder: `${filename}-placeholder.webp`
    };
    
    for (const size of config.sizes) {
      manifest[filename].sizes[size] = {};
      
      for (const format of config.formats) {
        const outputFilename = `${filename}-${size}.${format}`;
        const outputPath = path.join(config.outputDir, outputFilename);
        
        if (fs.existsSync(outputPath)) {
          manifest[filename].sizes[size][format] = outputFilename;
        }
      }
    }
  }
  
  // Write manifest to file
  fs.writeFileSync(
    path.join(config.outputDir, 'image-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('Generated image manifest file.');
};

// Run the optimization
optimizeImages();
