const request = require('request-promise-native');
const fsp = require('fs').promises;
const DOMParser = require('xmldom').DOMParser;
const parser = new DOMParser();

module.exports = {
    parseMixList: parseMixList
};

async function parseMixList(videoID, paths) {
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
            const title = li.getAttribute('data-video-title').replace(/\s|\//g, '-');
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