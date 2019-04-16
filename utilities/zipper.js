const archiver = require('archiver');
const fs = require('fs');
const myError = require('./errors');

module.exports = {
    zipper: zipper
};

function zipper(pathArray, zipPath) {
    return new Promise((resolve, reject) => {
        const zipFile = fs.createWriteStream(zipPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });
        archive.pipe(zipFile);
        pathArray.map(mp3path => {
            const fileName = mp3path.match(/([^\/]+)$/i)[0];
            archive.file(mp3path, {name: fileName})
        });
        archive.finalize();

        zipFile.on('finish', () => resolve(true));
        zipFile.on('error', (err) =>{
            console.log(err);
            throw myError.zipError
        })
    });
}