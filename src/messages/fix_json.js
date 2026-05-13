const fs = require('fs');
const path = require('path');

const files = ['fr.json', 'en.json'];

files.forEach(file => {
    const filePath = path.join('c:\\Users\\HP\\Desktop\\riwaya\\src\\messages', file);
    let rawContent = fs.readFileSync(filePath, 'utf8');
    
    // Find the second instance of "Community": {
    const firstIndex = rawContent.indexOf('"Community": {');
    if (firstIndex !== -1) {
        const secondIndex = rawContent.indexOf('"Community": {', firstIndex + 1);
        if (secondIndex !== -1) {
            // Replace the second one with "CommunityTemp": {
            rawContent = rawContent.substring(0, secondIndex) + '"CommunityTemp": {' + rawContent.substring(secondIndex + 14);
            
            const data = JSON.parse(rawContent);
            
            // Deep merge data.Community and data.CommunityTemp
            function deepMerge(target, source) {
                for (const key of Object.keys(source)) {
                    if (source[key] instanceof Object && key in target) {
                        Object.assign(source[key], deepMerge(target[key], source[key]));
                    }
                }
                Object.assign(target || {}, source);
                return target;
            }
            
            deepMerge(data.Community, data.CommunityTemp);
            delete data.CommunityTemp;
            
            // Note: ar.json only has one "Community". We need to make sure we don't accidentally do it there.
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
            console.log(`Successfully merged duplicate "Community" keys in ${file}`);
        } else {
            console.log(`No duplicate "Community" key found in ${file}`);
        }
    }
});
