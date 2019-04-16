const request = require('request-promise-native');
const fsp = require('fs').promises;
const DOMParser = require('xmldom').DOMParser;
const parser = new DOMParser();
const ytdl = require('ytdl-core');


module.exports = {
    parseMixList: parseMixList,
    getVideoTitle: getVideoTitle
};

async function parseMixList(videoID, paths) {
    // returns obj with title and url props
    try {
        const mixListLink = 'https://www.youtube.com/watch?v=' + videoID + '&list=RD' + videoID;
        const mixListHtml = await request(mixListLink);
        await fsp.appendFile(paths.htmlPath, mixListHtml);

        const document = parser.parseFromString(mixListHtml, "text/html");
        const ol = document.getElementById('playlist-autoscroll-list');
        if (ol === null) {
            const error = new Error('invalidInput');
            error.name = 'invalidInput';
            throw error
        }
        const liArray = ol.getElementsByTagName('li');
        const resultArray = [];
        for (let i=0; i<liArray.length; i++) {
            const li = liArray[i];
            const title = escapeTitle(li.getAttribute('data-video-title'));
            const url = 'https://www.youtube.com/watch?v=' + li.getAttribute('data-video-id');
            resultArray.push({
                title: title,
                url: url
            });
        }
        return resultArray
    } catch (err) {
        throw err
    }
}

function getVideoTitle(videoID) {
    // return title
    return new Promise((resolve, reject) => {
        const title = ytdl.getBasicInfo(videoID, (err, info) => {
            if (err) {
                console.log(err);
                const error = new Error('invalidInput');
                error.name = 'invalidInput';
                throw error
            } else {
                const title = info.title === undefined ? null : info.title;
                resolve(title)
            }
        })
    })
}

function escapeTitle(rawTitle) {
    return rawTitle.replace(/\s|\//g, '-');
}