const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const buildPath = 'build';

const getDirectories = source =>
    fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

const directories = getDirectories(buildPath);

directories.forEach(dirName => {
    const dirPath = path.join(buildPath, dirName);
    const outputFilePath = path.join(buildPath, `${dirName}.zip`);

    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', function() {
        console.log(`${archive.pointer()} total bytes`);
        console.log(`Arquivo ${outputFilePath} criado com sucesso!`);
    });

    archive.on('error', function(err) {
        throw err;
    });

    archive.pipe(output);

    archive.directory(dirPath, false);
    archive.finalize();
});
