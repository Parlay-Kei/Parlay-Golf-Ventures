// This script will update the App.tsx file to include routes for our new pages
const fs = require('fs');
const path = require('path');

// Path to App.tsx
const appTsxPath = path.join(__dirname, 'src', 'App.tsx');

// Read the current content of App.tsx
let appTsxContent = fs.readFileSync(appTsxPath, 'utf8');

// Add import statements for new pages if they don't exist
if (!appTsxContent.includes("import Profile from")) {
  appTsxContent = appTsxContent.replace(
    "import UserProfile from \"./pages/UserProfile\";\n",
    "import UserProfile from \"./pages/UserProfile\";\nimport Profile from \"./pages/Profile\";\n"
  );
}

if (!appTsxContent.includes("import ComingSoon from")) {
  appTsxContent = appTsxContent.replace(
    "import Profile from \"./pages/Profile\";\n",
    "import Profile from \"./pages/Profile\";\nimport ComingSoon from \"./pages/ComingSoon\";\n"
  );
}

// Add route elements for new pages if they don't exist
if (!appTsxContent.includes('<Route path="/profile" element={<Profile />} />')) {
  appTsxContent = appTsxContent.replace(
    '<Route path="/dashboard" element={<Dashboard />} />',
    '<Route path="/dashboard" element={<Dashboard />} />\n                        <Route path="/profile" element={<Profile />} />'
  );
}

if (!appTsxContent.includes('<Route path="/coming-soon" element={<ComingSoon />} />')) {
  appTsxContent = appTsxContent.replace(
    '<Route path="/profile" element={<Profile />} />',
    '<Route path="/profile" element={<Profile />} />\n                        <Route path="/coming-soon" element={<ComingSoon />} />'
  );
}

// Write the updated content back to App.tsx
fs.writeFileSync(appTsxPath, appTsxContent, 'utf8');

console.log('App.tsx has been updated with new routes!');
