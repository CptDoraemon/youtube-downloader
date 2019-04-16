const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');

module.exports = {
    downloadMp3: downloadMp3
};

function downloadMp3(url, title, paths) {
    // successful download return path
    if (!fs.existsSync(paths.tempFolder)){
        fs.mkdirSync(paths.tempFolder);
    }
    //
    const mp3path = path.join(paths.tempFolder, '/' + title + '.mp3');
    return new Promise((resolve, reject) => {
        ffmpeg(ytdl(url))
            .audioBitrate('128k')
            .audioCodec('libmp3lame')
            .audioChannels(2)
            .format('mp3')
            .on('error', (err) => {
                console.log(`${url} CANNOT be downloaded ` + err);
                resolve(null)
            })
            .on('end', () => {
                console.log(`${url} downloaded`);
                resolve(mp3path)
            })
            .save(mp3path);
    })
}