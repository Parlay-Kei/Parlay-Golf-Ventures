/**
 * CDN Deployment Script for Parlay Golf Ventures
 * 
 * This script deploys static assets to a CDN based on the configuration in cdn-config.js.
 * It supports multiple CDN providers including AWS CloudFront, Cloudflare, and Fastly.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const cdnConfig = require('../cdn-config');

// Check if AWS CLI is installed
const hasAwsCli = () => {
  try {
    execSync('aws --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

// Check if required environment variables are set
const checkEnvironmentVariables = () => {
  const { provider } = cdnConfig;
  
  if (provider === 'aws') {
    const { accessKeyId, secretAccessKey, bucket, region } = cdnConfig.aws;
    if (!accessKeyId || !secretAccessKey || !bucket || !region) {
      console.error('Error: Missing AWS environment variables. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, and AWS_REGION.');
      return false;
    }
  } else if (provider === 'cloudflare') {
    const { apiToken, accountId, zoneId } = cdnConfig.cloudflare;
    if (!apiToken || !accountId || !zoneId) {
      console.error('Error: Missing Cloudflare environment variables. Please set CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, and CLOUDFLARE_ZONE_ID.');
      return false;
    }
  } else if (provider === 'fastly') {
    const { apiKey, serviceId } = cdnConfig.fastly;
    if (!apiKey || !serviceId) {
      console.error('Error: Missing Fastly environment variables. Please set FASTLY_API_KEY and FASTLY_SERVICE_ID.');
      return false;
    }
  } else {
    console.error(`Error: Unsupported CDN provider: ${provider}. Supported providers are 'aws', 'cloudflare', and 'fastly'.`);
    return false;
  }
  
  return true;
};

// Deploy assets to AWS S3 and invalidate CloudFront cache
const deployToAws = async () => {
  const { bucket, region, distributionId } = cdnConfig.aws;
  
  console.log(`Deploying assets to AWS S3 bucket: ${bucket}`);
  
  // Deploy each asset path to S3
  for (const { source, destination } of cdnConfig.assetPaths) {
    const sourcePath = path.resolve(__dirname, '..', source);
    
    if (!fs.existsSync(sourcePath)) {
      console.warn(`Warning: Source path does not exist: ${sourcePath}`);
      continue;
    }
    
    // Set cache-control headers based on file extension
    const cacheControlArgs = Object.entries(cdnConfig.cache.cacheControl.byExtension)
      .map(([ext, value]) => `--cache-control "${value}" --exclude "*" --include "*${ext}"`)
      .join(' ');
    
    // Set content-type metadata based on file extension
    const contentTypeArgs = '--content-type application/octet-stream';
    
    // Deploy to S3 with appropriate cache headers
    const s3SyncCommand = `aws s3 sync ${sourcePath} s3://${bucket}/${destination} --delete ${cacheControlArgs} ${contentTypeArgs} --region ${region}`;
    
    try {
      console.log(`Executing: ${s3SyncCommand}`);
      execSync(s3SyncCommand, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error deploying to S3: ${error.message}`);
      return false;
    }
  }
  
  // Invalidate CloudFront cache if distributionId is provided
  if (distributionId) {
    console.log(`Invalidating CloudFront cache for distribution: ${distributionId}`);
    
    try {
      const invalidationCommand = `aws cloudfront create-invalidation --distribution-id ${distributionId} --paths "/*" --region ${region}`;
      execSync(invalidationCommand, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error invalidating CloudFront cache: ${error.message}`);
      return false;
    }
  }
  
  return true;
};

// Deploy assets to Cloudflare Pages
const deployToCloudflare = async () => {
  const { accountId, zoneId } = cdnConfig.cloudflare;
  
  console.log(`Deploying assets to Cloudflare Pages for account: ${accountId}`);
  
  // Check if wrangler is installed
  try {
    execSync('npx wrangler --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('Error: Wrangler CLI is not installed. Please run: npm install -g wrangler');
    return false;
  }
  
  // Create a temporary wrangler.toml file
  const wranglerConfig = `
    name = "pgv-assets"
    account_id = "${accountId}"
    zone_id = "${zoneId}"
    
    [site]
    bucket = "./dist/client"
    
    [site.upload]
    format = "service-worker"
    
    [cache]
    browser_TTL = 86400
    serve_stale = true
    
    # Cache settings for different file types
    [cache.extensions]
    js = { browser_TTL = 31536000, edge_TTL = 31536000 }
    css = { browser_TTL = 31536000, edge_TTL = 31536000 }
    woff2 = { browser_TTL = 31536000, edge_TTL = 31536000 }
    jpg = { browser_TTL = 2592000, edge_TTL = 2592000 }
    jpeg = { browser_TTL = 2592000, edge_TTL = 2592000 }
    png = { browser_TTL = 2592000, edge_TTL = 2592000 }
    webp = { browser_TTL = 2592000, edge_TTL = 2592000 }
    svg = { browser_TTL = 2592000, edge_TTL = 2592000 }
    ico = { browser_TTL = 2592000, edge_TTL = 2592000 }
    html = { browser_TTL = 3600, edge_TTL = 3600 }
    json = { browser_TTL = 3600, edge_TTL = 3600 }
  `;
  
  fs.writeFileSync(path.resolve(__dirname, '../wrangler.toml'), wranglerConfig);
  
  try {
    // Deploy to Cloudflare Pages
    console.log('Deploying to Cloudflare Pages...');
    execSync('npx wrangler pages publish dist/client --project-name=pgv-assets', { stdio: 'inherit' });
    
    // Clean up temporary wrangler.toml file
    fs.unlinkSync(path.resolve(__dirname, '../wrangler.toml'));
    
    return true;
  } catch (error) {
    console.error(`Error deploying to Cloudflare Pages: ${error.message}`);
    
    // Clean up temporary wrangler.toml file
    if (fs.existsSync(path.resolve(__dirname, '../wrangler.toml'))) {
      fs.unlinkSync(path.resolve(__dirname, '../wrangler.toml'));
    }
    
    return false;
  }
};

// Deploy assets to Fastly
const deployToFastly = async () => {
  const { apiKey, serviceId } = cdnConfig.fastly;
  
  console.log(`Deploying assets to Fastly for service: ${serviceId}`);
  
  // This is a simplified implementation
  // In a real-world scenario, you would use the Fastly API to upload assets
  console.log('Fastly deployment is not fully implemented in this script.');
  console.log('Please refer to the Fastly documentation for deploying assets:');
  console.log('https://developer.fastly.com/reference/api/');
  
  return false;
};

// Main function
const main = async () => {
  console.log('Starting CDN deployment...');
  
  // Check environment variables
  if (!checkEnvironmentVariables()) {
    process.exit(1);
  }
  
  // Deploy based on provider
  let success = false;
  
  if (cdnConfig.provider === 'aws') {
    // Check if AWS CLI is installed
    if (!hasAwsCli()) {
      console.error('Error: AWS CLI is not installed. Please install it first.');
      process.exit(1);
    }
    
    success = await deployToAws();
  } else if (cdnConfig.provider === 'cloudflare') {
    success = await deployToCloudflare();
  } else if (cdnConfig.provider === 'fastly') {
    success = await deployToFastly();
  }
  
  if (success) {
    console.log('CDN deployment completed successfully!');
    console.log(`Assets are now available at: ${cdnConfig.cdnUrl}`);
  } else {
    console.error('CDN deployment failed.');
    process.exit(1);
  }
};

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
