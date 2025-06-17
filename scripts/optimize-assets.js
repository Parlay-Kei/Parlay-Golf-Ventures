/**
 * Asset Optimization Script
 * 
 * This script optimizes static assets like images, SVGs, and other files
 * to reduce file size and improve loading performance.
 * 
 * Usage: node scripts/optimize-assets.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  // Directories to process
  directories: [
    path.join(__dirname, '../public/images'),
    path.join(__dirname, '../public/assets'),
    path.join(__dirname, '../src/assets'),
  ],
  // File extensions to optimize
  extensions: {
    images: ['.jpg', '.jpeg', '.png', '.gif'],
    svg: ['.svg'],
    json: ['.json'],
    js: ['.js'],
    css: ['.css'],
  },
  // Output directory for optimized assets
  outputDir: path.join(__dirname, '../public/optimized'),
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

/**
 * Get all files with specific extensions from a directory recursively
 * @param {string} dir - Directory to search
 * @param {string[]} extensions - File extensions to include
 * @returns {string[]} - Array of file paths
 */
function getFiles(dir, extensions) {
  let results = [];
  
  try {
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively search subdirectories
        results = results.concat(getFiles(filePath, extensions));
      } else {
        // Check if file has one of the specified extensions
        const ext = path.extname(file).toLowerCase();
        if (extensions.includes(ext)) {
          results.push(filePath);
        }
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  
  return results;
}

/**
 * Optimize image files using Sharp
 * @param {string[]} files - Array of image file paths
 */
async function optimizeImages(files) {
  console.log(`Optimizing ${files.length} images...`);
  
  try {
    // Check if sharp is installed
    try {
      require('sharp');
    } catch (error) {
      console.error('Sharp is not installed. Please run: npm install --save-dev sharp');
      return;
    }
    
    const sharp = require('sharp');
    
    for (const file of files) {
      const filename = path.basename(file);
      const outputPath = path.join(config.outputDir, filename);
      
      try {
        // Optimize the image
        await sharp(file)
          .resize(1920, null, { withoutEnlargement: true }) // Resize to max width of 1920px
          .jpeg({ quality: 80, progressive: true }) // For JPEG
          .png({ quality: 80, progressive: true }) // For PNG
          .toFile(outputPath);
        
        console.log(`Optimized: ${filename}`);
      } catch (error) {
        console.error(`Error optimizing ${filename}:`, error);
      }
    }
  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

/**
 * Optimize SVG files using SVGO
 * @param {string[]} files - Array of SVG file paths
 */
async function optimizeSVGs(files) {
  console.log(`Optimizing ${files.length} SVG files...`);
  
  try {
    // Check if SVGO is installed
    try {
      execSync('svgo --version', { stdio: 'ignore' });
    } catch (error) {
      console.error('SVGO is not installed. Please run: npm install -g svgo');
      return;
    }
    
    for (const file of files) {
      const filename = path.basename(file);
      const outputPath = path.join(config.outputDir, filename);
      
      try {
        // Optimize the SVG using SVGO
        execSync(`svgo -i "${file}" -o "${outputPath}"`);
        console.log(`Optimized: ${filename}`);
      } catch (error) {
        console.error(`Error optimizing ${filename}:`, error);
      }
    }
  } catch (error) {
    console.error('Error optimizing SVGs:', error);
  }
}

/**
 * Minify JSON files
 * @param {string[]} files - Array of JSON file paths
 */
function minifyJSON(files) {
  console.log(`Minifying ${files.length} JSON files...`);
  
  for (const file of files) {
    const filename = path.basename(file);
    const outputPath = path.join(config.outputDir, filename);
    
    try {
      // Read the JSON file
      const jsonData = fs.readFileSync(file, 'utf8');
      
      // Parse and stringify to minify
      const minified = JSON.stringify(JSON.parse(jsonData));
      
      // Write the minified JSON
      fs.writeFileSync(outputPath, minified);
      
      console.log(`Minified: ${filename}`);
    } catch (error) {
      console.error(`Error minifying ${filename}:`, error);
    }
  }
}

/**
 * Main function to optimize all assets
 */
async function optimizeAssets() {
  console.log('Starting asset optimization...');
  
  // Process each directory
  for (const dir of config.directories) {
    if (!fs.existsSync(dir)) {
      console.warn(`Directory does not exist: ${dir}`);
      continue;
    }
    
    console.log(`Processing directory: ${dir}`);
    
    // Get files by type
    const imageFiles = getFiles(dir, config.extensions.images);
    const svgFiles = getFiles(dir, config.extensions.svg);
    const jsonFiles = getFiles(dir, config.extensions.json);
    
    // Optimize each file type
    await optimizeImages(imageFiles);
    await optimizeSVGs(svgFiles);
    minifyJSON(jsonFiles);
  }
  
  console.log('Asset optimization complete!');
}

// Run the optimization
optimizeAssets().catch(error => {
  console.error('Error during asset optimization:', error);
});
