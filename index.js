const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const request = require('request');
const DOMParser = require('xmldom').DOMParser;
const parser = new DOMParser();
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const archiver = require('archiver');
require('dotenv').config();

const port = process.env.PORT || 5000;
app.listen(port);

const downloadIDs = {

};

app.use(express.static('./client/build'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});



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
        const mp3FolderPath = './downloads/temp/' + batchID;
        const zipPath = './downloads/zip/' + batchID + '.zip';


        request(mixListLink, (err, res, body) => {
            fs.appendFile('./downloads/html/' + videoID + '.html', body, (err) => {
                if (err) console.log(err)
            });
            const document = parser.parseFromString(body, "text/html");
            const ol = document.getElementById('playlist-autoscroll-list');
            if (ol === null) {
                invalidValueHandler(resToClient);
                return
            }
            const liArray = ol.getElementsByTagName('li');
            const promiseArray = [];
            for (let i=0; i<liArray.length; i++) {
                const li = liArray[i];
                const title = li.getAttribute('data-video-title').replace(/\s|\//g, '-');
                const url = 'https://www.youtube.com/' + li.getAttribute('data-video-id');
                promiseArray.push(downloadMP3(url, title, mp3FolderPath));
            }

            Promise.all(promiseArray)
                .then(pathArray => {
                    pathArray = pathArray.filter(path => path !== null);

                    const zipFile = fs.createWriteStream(zipPath);
                    const archive = archiver('zip', {
                        zlib: { level: 9 }
                    });
                    archive.pipe(zipFile);
                    pathArray.map(path => {
                        const fileName = path.match(/([^\/]+)$/i)[0];
                        archive.file(path, {name: fileName})
                    });
                    archive.finalize();


                    pathArray.map(path => fs.unlink(path, (err) => {
                        if(err) console.log(err)
                    }));
                    resToClient.json({
                        type: 'successful',
                        downloadFileID: batchID
                    })
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
    const path = folderPath + '/' + title + '.mp3';
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
                resolve(path)
            })
            .save(path);
    })
}