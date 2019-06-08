require('console-stamp')(console, { pattern: 'dd/mm/yyyy HH:MM:ss.l' });
const cv = require('opencv4nodejs');
var path = require('path');
var express = require('express');
const port = process.env.PORT || 3000;
var app = express();
var server = app.listen(port);
console.log("Sunucu "+port+" portundan dinlenmenilmeye başladı.");

var io = require('socket.io').listen(server);



function lengthInUtf8Bytes(str) {
    var m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
}

const wCap = new cv.VideoCapture(0);

const FPS = 10;

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/face-detect', function (req, res) {
  res.sendFile(path.join(__dirname + '/face-detect.html'));
});
app.get('/image', function (req, res) {
      
      

    var frame = wCap.read();

    const image = cv.imencode('.jpg', frame).toString('base64');
    var img = new Buffer.from(image, 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': img.length
      });
      res.end(img);
});
console.log("Sunucu http://localhost:"+port +" üzerinden webcam yayınına başladı.");

var secoundDataCounter = 0,
    secoundData = 0;
setInterval(() => {
    var frame = wCap.read();
    secoundDataCounter++;
    const image = cv.imencode('.jpg', frame).toString('base64');
    if (secoundDataCounter >= FPS) {
        console.log((secoundData / 1000).toFixed(2) + " mb/s");
        secoundDataCounter = 0;
        secoundData = 0;
    } else {
        secoundData += lengthInUtf8Bytes(image) / 1000
    }
    io.emit('image', image);
}, 1000 / FPS);
