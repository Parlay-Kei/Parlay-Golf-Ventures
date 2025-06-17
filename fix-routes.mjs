// This script will fix the duplicate profile routes in App.tsx
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to App.tsx
const appTsxPath = path.join(__dirname, 'src', 'App.tsx');

// Read the current content of App.tsx
let appTsxContent = fs.readFileSync(appTsxPath, 'utf8');

// Fix duplicate profile routes by removing the UserProfile route
appTsxContent = appTsxContent.replace(
  '<Route path="/profile" element={<Profile />} />\n                        <Route path="/coming-soon" element={<ComingSoon />} />\n                        <Route path="/profile" element={<UserProfile />} />',
  '<Route path="/profile" element={<Profile />} />\n                        <Route path="/coming-soon" element={<ComingSoon />} />'
);

// Write the updated content back to App.tsx
fs.writeFileSync(appTsxPath, appTsxContent, 'utf8');

console.log('App.tsx has been fixed to remove duplicate profile routes!');
