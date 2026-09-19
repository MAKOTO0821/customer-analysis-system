const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);

  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

const srcBuild = path.join(__dirname, '../customer-dashboard/build');
const destPublic = path.join(__dirname, '../mcp-customer-server/public');

if (fs.existsSync(srcBuild)) {
  console.log('Copying dashboard build to public folder...');
  copyRecursive(srcBuild, destPublic);
  console.log('Dashboard build copied successfully!');
} else {
  console.log('Dashboard build folder not found:', srcBuild);
}
