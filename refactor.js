import fs from 'fs';
import path from 'path';

function findFiles(dir, files = []) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findFiles(fullPath, files);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            files.push(fullPath);
        }
    }
    return files;
}

const files = findFiles(path.join(process.cwd(), 'src'));

for (const file of files) {
    if (file.includes('firebase.js') || file.includes('pdfGenerator.js') || file.includes('refactor.js')) {
        continue;
    }

    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Find firebase imports
    const fbRegex = /import\s+\{([^}]+)\}\s+from\s+['"]firebase\/(firestore|auth|storage|app)['"];?\n?/g;
    let match;
    let importsToAdd = [];

    while ((match = fbRegex.exec(content)) !== null) {
        let imports = match[1].split(',').map(s => s.trim()).filter(s => s);
        importsToAdd.push(...imports);
        changed = true;
    }

    if (changed) {
        // Remove the original firebase imports
        content = content.replace(fbRegex, '');

        // Find the existing local firebase import
        const localFbRegex = /import\s+\{([^}]+)\}\s+from\s+['"](\.\.\/firebase|\.\/firebase)['"];?\n?/;
        const localMatch = content.match(localFbRegex);

        if (localMatch) {
            let existingImports = localMatch[1].split(',').map(s => s.trim());
            let allImports = [...new Set([...existingImports, ...importsToAdd])];
            content = content.replace(localFbRegex, `import { ${allImports.join(', ')} } from '${localMatch[2]}';\n`);
        } else {
            // Need to know relative path
            const relPath = file.includes('pages') || file.includes('components') || file.includes('utils') ? '../firebase' : './firebase';
            let allImports = [...new Set(importsToAdd)];
            content = `import { ${allImports.join(', ')} } from '${relPath}';\n` + content;
        }

        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}
