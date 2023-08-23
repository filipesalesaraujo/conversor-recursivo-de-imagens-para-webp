const { Titlebar, Color } = require('custom-electron-titlebar');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { shell } = require('electron');


function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const fileStat = fs.statSync(filePath);

        if (fileStat.isDirectory()) {
            getFiles(filePath, fileList);
        } else if ([".jpg", ".png", ".jpeg"].includes(path.extname(filePath).toLowerCase())) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

function getNonWebpImages(dir) {
    const allFiles = getFiles(dir);
    return allFiles.filter(file => {
        const ext = path.extname(file);
        const withoutExt = file.substring(0, file.lastIndexOf('.'));
        const webpVersion = `${withoutExt}.webp`;
        return (ext === '.jpg' || ext === '.jpeg' || ext === '.png') && !allFiles.includes(webpVersion);
    });
}

function startConversion() {
    const filePickerSrc = document.getElementById('filePickerSrc');
    const srcPath = filePickerSrc.files[0]?.path;

    if (!srcPath) {
        const statusElem = document.getElementById('status');
        statusElem.textContent = "Por favor, selecione a pasta 'src'.";
        statusElem.className = "error";
        return;
    }

    const srcDirPath = path.dirname(srcPath);
    const statusElem = document.getElementById('status');

    if (!srcDirPath) {
        statusElem.textContent = "Por favor, selecione a pasta 'src'.";
        statusElem.className = "error";
        return;
    }

    statusElem.textContent = "Conversão iniciada...";
    statusElem.className = "";

    const imagesToConvert = getNonWebpImages(srcDirPath);

    if (imagesToConvert.length === 0) {
        statusElem.textContent = "Todas as imagens já estão no formato .webp ou não há imagens válidas.";
        statusElem.className = "info";
        return;
    }

    let conversionPromises = imagesToConvert.map(image => {
        return new Promise((resolve, reject) => {
            const destImagePath = image.replace(/\.[^/.]+$/, ".webp");
            
            sharp(image)
                .toFile(destImagePath, (err, info) => {
                    if (err) {
                        console.error("Erro ao converter imagem:", err);
                        reject(err);
                    } else {
                        // Remove the original image after successful conversion
                        fs.unlinkSync(image);
                        resolve();
                    }
                });
        });
    });

    Promise.allSettled(conversionPromises).then(results => {
        const errors = results.filter(r => r.status === 'rejected');

        if (errors.length) {
            statusElem.textContent = "Erro durante a conversão. Por favor, verifique o console para detalhes.";
            statusElem.className = "error";
        } else {
            statusElem.textContent = "Conversão concluída!";
            statusElem.className = "success";
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('convertButton').addEventListener('click', startConversion);
});

document.getElementById('filePickerSrc').addEventListener('change', function() {
    const selectedPath = this.files[0]?.path;
    if (selectedPath) {
        const displayPath = path.dirname(selectedPath);
        document.getElementById('pathDisplay').textContent = `Pasta selecionada: ${displayPath}`;
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const websiteLink = document.getElementById('websiteLink');

    websiteLink.addEventListener('click', function (event) {
        event.preventDefault();
        shell.openExternal(websiteLink.href);
    });
});