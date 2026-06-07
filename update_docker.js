const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'docker-compose.yml');
let content = fs.readFileSync(filePath, 'utf8');

// Replace variations of riwaya
content = content.replace(/riwaya/g, 'superecom');
content = content.replace(/Riwaya/g, 'SuperEcom');
content = content.replace(/RIWAYA/g, 'SUPERECOM');

fs.writeFileSync(filePath, content);
console.log('docker-compose.yml updated successfully.');
