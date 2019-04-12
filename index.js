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

const port = process.env.PORT || 5000;
app.listen(port);

const downloadIDs = {

};

app.use(express.static('./client/build'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});



app.post('/sendid', bodyParser.json(), (req, res) => {
    const type = req.body.type;
    const value = req.body.value;
    switch (type) {
        case 'mixList':
            handleMixList(value, res);
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

function handleMixList(videoID, res) {
    const mixListLink = 'https://www.youtube.com/watch?v=' + videoID + '&list=RD' + videoID;
    request(mixListLink, (err, res, body) => {
        fs.appendFile('./downloads/html/' + videoID + '.html', body, (err) => {
            if (err) console.log(err)
        });
        const document = parser.parseFromString(body, "text/html");
        const ol = document.getElementById('playlist-autoscroll-list');
        const liArray = ol.getElementsByTagName('li');

        for (let i=0; i<liArray.length; i++) {
            try {
                const li = liArray[i];
                const title = li.getAttribute('data-video-title').replace(/\s|\//g, '-');
                const url = 'https://www.youtube.com/' + li.getAttribute('data-video-id');
                ffmpeg(ytdl(url))
                    .audioBitrate('128k')
                    .audioCodec('libmp3lame')
                    .audioChannels(2)
                    .format('mp3')
                    .on('error', function(err) {
                        console.log('An error occurred: ' + err.message);
                    })
                    .on('end', function() {
                        console.log('Processing finished !');
                    })
                    .save('./downloads/' + title + '.mp3');
            } catch (e) {
                console.log(e)
            }
        }
    })
}