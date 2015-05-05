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

  if (ctrack.getCurrentPosition()) {
    positions = ctrack.getCurrentPosition();

    historyL.push(positions[27]);
    historyR.push(positions[32]);

    if (frameCount < 30) {
      exports.posL = [Math.round(positions[27][0]), Math.round(positions[27][1])];
      exports.posR = [Math.round(positions[32][0]), Math.round(positions[32][1])];
    } else {
      lastPosL = historyL.shift();
      lastPosR = historyR.shift();

      curL = blickDetection(positions[27], lastPosL);
      if (preL !== curL) {
        if (curL) {
          exports.posL = [-1, -1];
        }
        preL = curL;
      } else {
        exports.posL = [Math.round(positions[27][0]), Math.round(positions[27][1])];
      }

      curR = blickDetection(positions[32], lastPosR);
      if (preR !== curR) {
        if (curR) {
          exports.posR = [-1, -1];
        }
        preR = curR;
      } else {
        exports.posR = [Math.round(positions[32][0]), Math.round(positions[32][1])];
      }

    }
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

// function largeMoveDetection(pos, lastPos) {
//   var dis = (pos[0] - lastPos[0]) * (pos[0] - lastPos[0]) + (pos[1] - lastPos[1]) * (pos[1] - lastPos[1]);
//   if (dis > moveTredshold) {
//     return true;
//   }
//   return false;
// }

exports.ctrack = ctrack;