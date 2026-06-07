const fs = require('fs');
const path = require('path');

// 1. Rename files back
const renames = [
  { from: 'src/lib/faceproduct-pixel.ts', to: 'src/lib/facebook-pixel.ts' },
  { from: 'src/components/FaceproductPixel.tsx', to: 'src/components/FacebookPixel.tsx' },
  { from: 'src/app/api/webhooks/faceproduct', to: 'src/app/api/webhooks/facebook' }
];

renames.forEach(r => {
  const fromPath = path.join(__dirname, r.from);
  const toPath = path.join(__dirname, r.to);
  if (fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, toPath);
    console.log(`Renamed back: ${fromPath} -> ${toPath}`);
  }
});

// 2. Fix imports in codebase
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    content = content.replace(/faceproduct/g, 'facebook').replace(/Faceproduct/g, 'Facebook');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed faceproduct in: ' + filePath);
    }
  }
});
