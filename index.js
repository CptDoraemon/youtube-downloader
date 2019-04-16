const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const rimraf = require('rimraf');
const parseMixList = require('./utilities/parse-mix-list').parseMixList;
const downloadMp3 = require('./utilities/download-mp3').downloadMp3;
const zipper = require('./utilities/zipper').zipper;
require('dotenv').config();

const port = process.env.PORT || 5000;
app.listen(port);

const downloadIDs = {

};

app.use(express.static(myPathJoin('/client/build')));
app.post('/sendid', bodyParser.json(), ensureDomain, (req, res) => {
    const type = req.body.type;
    const value = req.body.value;
    //
    const batchID = type + '-' + value + '-' + (+Date.now()).toString(36);
    const paths = {
        batchID: batchID,
        htmlPath: myPathJoin('/downloads/html/', value + '.html'),
        tempFolder: myPathJoin('/downloads/temp/', batchID),
        zipPath: myPathJoin('/downloads/zip/') + batchID + '.zip'
    };
    //
    switch (type) {
        case 'mixList':
            handleMixList(paths, value, res);
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
function readyForDownloadResponse(res, downloadID, size) {
    res.json({
        type: 'successful',
        downloadID: paths.batchID,
        message: `Your file is ready, total size: ${size}MB. Proceed to download?`
    });
}
function wrongInputResponse(res) {
    res.json({
        type: 'failed',
        message: 'The ID you entered doesn\'t look right'
    })
}
async function handleMixList(paths, value, res) {
    try {
        // parse video ID's from mixlist, return path array
        const videoPathNTitleArray = await parseMixList(value, paths);
        // download mp3 from path array
        const mp3PathArray = await Promise.all(
            videoPathNTitleArray.map(async obj => {
                return await downloadMp3(obj.url, obj.title, paths);
            })
        );
        // path if download successful, null if download failed
        const mp3PathArrayFiltered = mp3PathArray.filter(mp3Path => mp3Path !== null);
        // zip mp3 files
        const zipStatus = await zipper(mp3PathArrayFiltered, paths.zipPath);
        // clean up temp folder
        if (zipStatus){
            rimraf(paths.tempFolder, (e) => {
                if (e) throw e;
                console.log('temp cleared')
            });
        }
        // update downloadID state
        // send response to client
        downloadIDs[paths.batchID] = paths.zipPath;
        const zipStats = await fsp.stat(paths.zipPath);
        const zipSizeInMB = Math.round(zipStats.size / 1024 / 1024);
        readyForDownloadResponse(res, paths.batchID, zipSizeInMB)

    } catch (e) {
        console.log(e);
        if (e.name === 'invalidInput') {
            wrongInputResponse(res)
        }
    }
}

function myPathJoin() {
    return path.join(__dirname, ...arguments)
}

