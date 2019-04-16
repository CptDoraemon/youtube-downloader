const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const https = require('https');
const request = require('request');
const DOMParser = require('xmldom').DOMParser;
const parser = new DOMParser();
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const archiver = require('archiver');
const rimraf = require("rimraf");
require('dotenv').config();

const port = process.env.PORT || 5000;
app.listen(port);

const downloadIDs = {

};

app.use(express.static(myPathJoin('/client/build')));
app.post('/sendid', bodyParser.json(), ensureDomain, (req, res) => {
    const type = req.body.type;
    const value = req.body.value;
    switch (type) {
        case 'mixList':
            handleMixList(type, value, res);
            break;
        case 'playlist':
            handlePlaylist(value);
            break;
        case 'singleMusic':
            handleSingleMusic(value);
            break;
        case 'singleVideo':
            handleSingleVideo(value);
            break;
        default:
            res.json({
                type: 'failed',
                message: 'Oops, something unexpected happened, please try again later'
            })
    }
});
app.get('/download', bodyParser.urlencoded({ extended: true }), ensureDomain, (req, res) => {
    const batchID = req.query.id;
    if (downloadIDs[batchID] === undefined) {
        res.status(403).send()
    } else {
        res.download(downloadIDs[batchID], () => {
            console.log('downloaded');
            delete downloadIDs[batchID]
        })
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

function ensureDomain(req, res, next) {
    if (req.hostname === process.env.REQ_HOSTNAME) {
        next()
    } else {
        res.status(403);
        res.send();
    }
}
function invalidValueHandler(res) {
    res.json({
        type: 'failed',
        message: 'The ID you entered doesn\'t look right'
    })
}
function handleMixList(type, videoID, resToClient) {
    try {
        const mixListLink = 'https://www.youtube.com/watch?v=' + videoID + '&list=RD' + videoID;
        const batchID = type + '-' + videoID + '-' + (+Date.now()).toString(36);
        const mp3FolderPath = myPathJoin('/downloads/temp/', batchID);
        const zipPath = myPathJoin('/downloads/zip/') + batchID + '.zip';

        request(mixListLink, (err, res, body) => {
            // save the html requested
            const htmlPath = myPathJoin('/downloads/html/', videoID + '.html');
            fs.appendFile(htmlPath, body, (err) => {
                if (err) console.log(err)
            });
            // parse urls to array
            const document = parser.parseFromString(body, "text/html");
            const ol = document.getElementById('playlist-autoscroll-list');
            if (ol === null) {
                invalidValueHandler(resToClient);
                return
            }
            const liArray = ol.getElementsByTagName('li');
            const downloadMp3PromiseArray = [];
            for (let i=0; i<liArray.length; i++) {
                const li = liArray[i];
                const title = li.getAttribute('data-video-title').replace(/\s|\//g, '-');
                const url = 'https://www.youtube.com/' + li.getAttribute('data-video-id');
                downloadMp3PromiseArray.push(downloadMP3(url, title, mp3FolderPath));
            }

            Promise.all(downloadMp3PromiseArray)
                .then(pathArray => {
                    // zip mp3's
                    pathArray = pathArray.filter(mp3path => mp3path !== null);

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

                    // remove temp/batchID folder
                    zipFile.on('finish', () => {
                        rimraf(mp3FolderPath, (e) => {
                            if (e) console.log(e);
                            console.log('temp removed')
                        });
                        // res to client
                        fs.stat(zipPath, (err, stats) => {
                            if (err) {
                                console.log(err)
                            } else {
                                const zipSizeInMB = Math.round(stats.size / 1024 / 1024);
                                resToClient.json({
                                    type: 'successful',
                                    downloadID: batchID,
                                    message: `Your file is ready, total size: ${zipSizeInMB}MB. Proceed to download?`
                                });
                                // update global downloadIDs
                                downloadIDs[batchID] = zipPath;
                            }
                        });
                    });
                })
                .catch((e) => console.log(e));

        })
    } catch (e) {
        console.log(e)
    }
}
function downloadMP3(url, title, folderPath) {
    // successful download return path, otherwise return null
    if (!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath);
    }
    const mp3path = path.join(folderPath, '/' + title + '.mp3');
    return new Promise((resolve, reject) => {
        ffmpeg(ytdl(url))
            .audioBitrate('128k')
            .audioCodec('libmp3lame')
            .audioChannels(2)
            .format('mp3')
            .on('error', function(err) {
                console.log('An error occurred: ' + err.message);
                resolve(null)
            })
            .on('end', function() {
                console.log('Processing finished !');
                resolve(mp3path)
            })
            .save(mp3path);
    })
}

function myPathJoin() {
    return path.join(__dirname, ...arguments)
}
