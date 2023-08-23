const packager = require('electron-packager');
const archiver = require('archiver');
const fs = require('fs');

async function packageAndZipForPlatform(platform) {
    const options = {
        dir: '.',
        out: 'release-builds',
        overwrite: true,
        platform: platform,
        asar: true
    };

    if (platform === 'win32') {
        options.arch = 'ia32,x64'; // Usualmente Windows é fornecido para estas duas arquiteturas.
    } else {
        options.arch = 'x64'; // Para simplificar, vamos criar apenas para x64 em macOS e Linux.
    }

    const appPaths = await packager(options);

    for (const appPath of appPaths) {
        console.log("App Path:", appPath);

        const output = fs.createWriteStream(`${appPath}.zip`);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', function() {
            console.log(archive.pointer() + ' total bytes');
            console.log('Arquivo zipado com sucesso!');

            fs.rmSync(appPath, { recursive: true, force: true });
        });

        archive.on('error', function(err) {
            throw err;
        });

        archive.pipe(output);
        archive.directory(appPath, false);
        archive.finalize();
    }
}

async function packageAndZipAll() {
    const platforms = ['darwin', 'win32', 'linux'];

    for (let platform of platforms) {
        console.log(`Packaging for platform: ${platform}`);
        await packageAndZipForPlatform(platform);
    }
}

packageAndZipAll().catch(err => {
    console.error(err);
});
