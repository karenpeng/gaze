var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
inherits(Widget, EventEmitter);

function Widget() {
  if (!(this instanceof Widget)) return new Widget();
}
Widget.prototype.yell = function (tag, data) {
  this.emit((tag + 'blink'), data);
};

var vid = document.getElementById('videoel');

var ctrack = new clm.tracker({
  useWebGL: true
});
ctrack.init(pModel);

//just some magic number
var yMax = videoel.height * 0.03;
var yMin = videoel.height * 0.008;
var xMax = videoel.width * 0.03;
var preL = false;
var preR = false;
var curL = false;
var curR = false;
var blinkL = new Widget();
var blinkR = new Widget();
exports.largeMove = false;
var moveTredshold = (videoel.width * 0.16) * (videoel.width * 0.16);

function initCam() {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
  // check for camerasupport
  if (navigator.getUserMedia) {
    // set up stream

    var videoSelector = {
      video: true
    };
    if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
      var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
      if (chromeVersion < 20) {
        videoSelector = "video";
      }
    };

    navigator.getUserMedia(videoSelector, function (stream) {
      if (vid.mozCaptureStream) {
        vid.mozSrcObject = stream;
      } else {
        vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
      }
      vid.play();
    }, function () {
      alert("There was some problem trying to fetch video from your webcam, using a fallback video instead.");
    });
  } else {
    alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
  }
  vid.addEventListener('canplay', startVideo, false);
}

initCam();

function startVideo() {
  // start video
  vid.play();
  // start tracking
  ctrack.start(vid);
  // start loop to draw face
  drawLoop();
}

var frameCount = 0;
var lastPosL = [];
var lastPosR = [];
var historyL = [];
var historyR = [];
var positions = [];
positions[27] = [0, 0];
positions[32] = [0, 0];
exports.dL = null;
exports.dR = null;

function drawLoop() {
  requestAnimFrame(drawLoop);

  frameCount++;

  //overlayCC.clearRect(0, 0, overlay.width, overlay.height);

  //overlayCC.save();
  //overlayCC.translate(overlay.width, 0);
  //overlayCC.scale(-1, 1);
  //overlayCC.drawImage(vid, 0, 0, overlay.width, overlay.height);
  //overlayCC.restore();
  //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
  //console.log(overlayCC);

  if (ctrack.getCurrentPosition()) {
    positions = ctrack.getCurrentPosition();

    if (frameCount < 30) {
      historyL.push(positions[27]);
      historyR.push(positions[32]);
    } else {
      lastPosL = historyL.shift();
      lastPosR = historyR.shift();
      historyL.push(positions[27]);
      historyR.push(positions[32]);

      //if(frameCount % 2 === 0){
      curL = blickDetection(positions[27], lastPosL);
      if (preL !== curL) {
        if (curL) {
          blinkL.yell('L');
        }
        preL = curL;
      }
      curR = blickDetection(positions[32], lastPosR)
      if (preR !== curR) {
        if (curR) {
          blinkR.yell('R');
        }

        preR = curR;
      }

      //exports.dL = [lastPosL[0] - positions[27][0], lastPosL[1] - positions[27][1]];
      //exports.dR = [lastPosR[0] - positions[32][0], lastPosR[1] - positions[32][1]];
      exports.largeMove = (largeMoveDetection(positions[27], lastPosL) || largeMoveDetection(positions[32], lastPosR));
    }
    //}

    // overlayCC.strokeStyle = 'red';
    // overlayCC.beginPath();
    // var a = lastPosL;
    // overlayCC.moveTo(a[0], a[1]);
    // var b = positions[27];
    // overlayCC.lineTo(b[0], b[1]);
    // overlayCC.stroke();

    // overlayCC.beginPath();
    // var a1 = lastPosR;
    // overlayCC.moveTo(a1[0], a1[1]);
    // var b1 = positions[32];
    // overlayCC.lineTo(b1[0], b1[1]);
    // overlayCC.stroke();

    // // ctrack.draw(overlay);
    // overlayCC.fillStyle = 'white';
    // overlayCC.fillRect(b[0], b[1], 3, 3);
    // overlayCC.fillRect(b1[0], b1[1], 3, 3);

    // //overlayCC.restore();
    // overlayCC.fillStyle = 'red';
    // overlayCC.fillRect(0, 0, xMax, yMax);
    // overlayCC.fillRect(videoel.width - xMax, videoel.height - yMin, xMax, yMin);

    exports.posL = [Math.round(positions[27][0]), Math.round(positions[27][1])];
    exports.posR = [Math.round(positions[32][0]), Math.round(positions[32][1])];
  }
}

function blickDetection(pos, lastPos) {
  if (pos[1] - lastPos[1] > yMin && pos[1] - lastPos[1] < yMax) {
    if (Math.abs(pos[0] - lastPos[0]) < xMax) {
      return true;
    }
    return false;
  }
  return false;
}

function largeMoveDetection(pos, lastPos) {
  var dis = (pos[0] - lastPos[0]) * (pos[0] - lastPos[0]) + (pos[1] - lastPos[1]) * (pos[1] - lastPos[1]);
  if (dis > moveTredshold) {
    return true;
  }
  return false;
}

exports.blinkR = blinkR;
exports.blinkL = blinkL;
exports.ctrack = ctrack;