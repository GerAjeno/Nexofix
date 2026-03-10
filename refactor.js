import fs from 'fs';
import path from 'path';

// Ruta al directorio src del frontend
const srcDir = path.join(process.cwd(), 'frontend', 'src');

// Función recursiva para leer archivos
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            // Solo procesar archivos JS y JSX
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(srcDir);
const API_BASE_URL = "import.meta.env.VITE_API_URL || 'http://localhost:3000'";
let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Reemplazos específicos comunes
    content = content.replace(/const API_URL = 'http:\/\/localhost:3000\/api';/g, `const API_URL = \`\${${API_BASE_URL}}/api\`;`);
    content = content.replace(/const API_URL = 'http:\/\/localhost:3000\/api\/([^']+)'/g, `const API_URL = \`\${${API_BASE_URL}}/api/$1\``);

    // Reemplazo general para fetch u otros usos
    content = content.replace(/'http:\/\/localhost:3000\/api/g, `\`\${${API_BASE_URL}}/api`);
    content = content.replace(/'http:\/\/localhost:3000\//g, `\`\${${API_BASE_URL}}/`);

    // Casos donde ya usan template literals con backticks
    content = content.replace(/`http:\/\/localhost:3000\/api/g, `\`\${${API_BASE_URL}}/api`);
    content = content.replace(/`http:\/\/localhost:3000\//g, `\`\${${API_BASE_URL}}/`);

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Modificado: ${file}`);
        modifiedCount++;
    }
});

console.log(`\nReemplazo completado. Se modificaron ${modifiedCount} archivos.`);
