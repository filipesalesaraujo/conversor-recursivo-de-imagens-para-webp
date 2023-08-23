const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDirectory = './src';
const distDirectory = './dist';

function isImage(file) {
    const ext = path.extname(file).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.tif', '.tiff', '.gif', '.bmp', '.svg'].includes(ext);
}

function convertImages(sourcePath, destPath) {
    fs.readdir(sourcePath, (err, items) => {
        if (err) {
            console.error("Erro ao ler o diretório:", err);
            return;
        }

        items.forEach(item => {
            const currentSourcePath = path.join(sourcePath, item);
            const currentDestPath = path.join(destPath, item);

            if (fs.statSync(currentSourcePath).isDirectory()) {
                if (!fs.existsSync(currentDestPath)) {
                    fs.mkdirSync(currentDestPath, { recursive: true });
                }
                convertImages(currentSourcePath, currentDestPath);
            } 
            else if (isImage(item)) {
                const outputPath = path.join(destPath, `${path.basename(item, path.extname(item))}.webp`);
                sharp(currentSourcePath)
                    .toFile(outputPath, (err, info) => {
                        if (err) {
                            console.error(`Erro ao converter a imagem ${item}:`, err);
                        } else {
                            console.log(`Imagem ${item} convertida com sucesso para WEBP.`);
                        }
                    });
            }
        });
    });
}

convertImages(srcDirectory, distDirectory);
