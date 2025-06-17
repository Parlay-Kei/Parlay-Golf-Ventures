/**
 * CDN Configuration for Parlay Golf Ventures
 * 
 * This file contains configuration for deploying assets to a CDN.
 * It supports multiple CDN providers including AWS CloudFront, Cloudflare, and Fastly.
 */

module.exports = {
  // CDN provider - can be 'cloudflare', 'aws', or 'fastly'
  provider: process.env.CDN_PROVIDER || 'cloudflare',
  
  // CDN URL - the base URL for the CDN
  cdnUrl: process.env.CDN_URL || 'https://assets.parlayventures.com',
  
  // AWS CloudFront configuration
  aws: {
    distributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
    region: process.env.AWS_REGION || 'us-west-2',
    bucket: process.env.AWS_S3_BUCKET || 'pgv-assets',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  
  // Cloudflare configuration
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
  },
  
  // Fastly configuration
  fastly: {
    apiKey: process.env.FASTLY_API_KEY,
    serviceId: process.env.FASTLY_SERVICE_ID,
  },
  
  // Asset paths to deploy to CDN
  assetPaths: [
    { source: 'dist/client/assets', destination: 'assets' },
    { source: 'dist/client/images', destination: 'images' },
    { source: 'dist/client/fonts', destination: 'fonts' },
  ],
  
  // Cache configuration
  cache: {
    // Cache TTL in seconds
    defaultTtl: 86400, // 1 day
    
    // Cache TTL for specific file types
    ttlByExtension: {
      // Long cache for static assets with content hash in filename
      '.js': 31536000, // 1 year
      '.css': 31536000, // 1 year
      '.woff2': 31536000, // 1 year
      '.jpg': 2592000, // 30 days
      '.jpeg': 2592000, // 30 days
      '.png': 2592000, // 30 days
      '.webp': 2592000, // 30 days
      '.svg': 2592000, // 30 days
      '.ico': 2592000, // 30 days
      
      // Shorter cache for HTML and JSON files
      '.html': 3600, // 1 hour
      '.json': 3600, // 1 hour
    },
    
    // Cache-Control headers
    cacheControl: {
      // Default Cache-Control header
      default: 'public, max-age=86400',
      
      // Cache-Control headers for specific file types
      byExtension: {
        '.js': 'public, max-age=31536000, immutable',
        '.css': 'public, max-age=31536000, immutable',
        '.woff2': 'public, max-age=31536000, immutable',
        '.jpg': 'public, max-age=2592000',
        '.jpeg': 'public, max-age=2592000',
        '.png': 'public, max-age=2592000',
        '.webp': 'public, max-age=2592000',
        '.svg': 'public, max-age=2592000',
        '.ico': 'public, max-age=2592000',
        '.html': 'public, max-age=3600',
        '.json': 'public, max-age=3600',
      },
    },
  },
  
  // Compression configuration
  compression: {
    // Enable Brotli compression
    brotli: true,
    
    // Enable Gzip compression
    gzip: true,
    
    // File types to compress
    compressTypes: [
      '.html',
      '.js',
      '.css',
      '.json',
      '.svg',
      '.xml',
      '.txt',
    ],
  },
  
  // Security headers
  securityHeaders: {
    // Content Security Policy
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://assets.parlayventures.com; style-src 'self' 'unsafe-inline' https://assets.parlayventures.com; img-src 'self' data: https://assets.parlayventures.com; font-src 'self' data: https://assets.parlayventures.com; connect-src 'self' https://api.parlayventures.com;",
    
    // Other security headers
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
};
