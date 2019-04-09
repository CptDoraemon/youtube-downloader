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

app.use(express.static('./client/build'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});



app.post('/getVideoInfo', bodyParser.json(), (req, res) => {
    const videoId = req.body.videoId;
    const mixListLink = 'https://www.youtube.com/watch?v=' + videoId + '&list=RD' + videoId;

    request(mixListLink, (err, res, body) => {
        fs.appendFile('./downloads/html/' + videoId + '.html', body, function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
        const document = parser.parseFromString(body, "text/html");
        const ul = document.getElementById('watch-related');
        const liArray = ul.getElementsByTagName('li');

        for (let i=0; i<liArray.length; i++) {
            try {
                const li = liArray[i];
                const a = li.getElementsByTagName('a')[0];
                if (typeof a !== 'undefined') {
                    const title = a.getAttribute('title').replace(/\s/g, '-').replace(/\//g, '-');
                    const url = 'https://www.youtube.com/' + a.getAttribute('href');

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

                }
            } catch (e) {
                console.log(e)
            }
        }
    })
});