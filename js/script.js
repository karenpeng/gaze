var vid = document.getElementById('videoel');
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');

var ctrack = new clm.tracker({useWebGL : true});
ctrack.init(pModel);

stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.getElementById('container').appendChild( stats.domElement );

function enablestart() {
  var startbutton = document.getElementById('startbutton');
  startbutton.value = "start";
  startbutton.disabled = null;
}


navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
// check for camerasupport
if (navigator.getUserMedia) {
  // set up stream

  var videoSelector = {video : true};
  if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
    var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
    if (chromeVersion < 20) {
      videoSelector = "video";
    }
  };

  navigator.getUserMedia(videoSelector, function( stream ) {
    if (vid.mozCaptureStream) {
      vid.mozSrcObject = stream;
    } else {
      vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
    }
    vid.play();
  }, function() {
    alert("There was some problem trying to fetch video from your webcam, using a fallback video instead.");
  });
} else {
  alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
}
vid.addEventListener('canplay', enablestart, false);

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

function drawLoop() {
  requestAnimFrame(drawLoop);

  frameCount ++;

  overlayCC.clearRect(0, 0, 400, 300);
  //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);

  if (ctrack.getCurrentPosition()) {
    var positions = ctrack.getCurrentPosition();

    if(frameCount % 30 === 0){
      lastPosL = positions[27];
      lastPosR = positions[32];
    }

    overlayCC.strokeStyle = 'red';
    overlayCC.beginPath();
    overlayCC.moveTo(lastPosL[0], lastPosL[1]);
    overlayCC.lineTo(positions[27][0], positions[27][1]);
    overlayCC.stroke();

    overlayCC.beginPath();
    overlayCC.moveTo(lastPosR[0], lastPosR[1]);
    overlayCC.lineTo(positions[32][0], positions[32][1]);
    overlayCC.stroke();

    // ctrack.draw(overlay);
    overlayCC.fillStyle = 'white';
    overlayCC.fillRect(positions[27][0], positions[27][1], 3, 3);
    overlayCC.fillRect(positions[32][0], positions[32][1], 3, 3);

    // overlayCC.fillStyle = 'green';

    // overlayCC.fillRect(positions[63][0], positions[63][1], 3, 3);
    // overlayCC.fillRect(positions[24][0], positions[24][1], 3, 3);
    // overlayCC.fillRect(positions[64][0], positions[64][1], 3, 3);
    // overlayCC.fillRect(positions[23][0], positions[23][1], 1, 1);

    // overlayCC.fillRect(positions[66][0], positions[66][1], 3, 3);
    // overlayCC.fillRect(positions[26][0], positions[26][1], 3, 3);
    // overlayCC.fillRect(positions[65][0], positions[65][1], 3, 3);
    // overlayCC.fillRect(positions[25][0], positions[25][1], 1, 1);

    // overlayCC.fillRect(positions[68][0], positions[68][1], 3, 3);
    // overlayCC.fillRect(positions[29][0], positions[29][1], 3, 3);
    // overlayCC.fillRect(positions[67][0], positions[67][1], 3, 3);
    // overlayCC.fillRect(positions[30][0], positions[30][1], 1, 1);

    // overlayCC.fillRect(positions[69][0], positions[69][1], 3, 3);
    // overlayCC.fillRect(positions[31][0], positions[31][1], 3, 3);
    // overlayCC.fillRect(positions[70][0], positions[70][1], 3, 3);
    // overlayCC.fillRect(positions[28][0], positions[28][1], 1, 1);
  }
}

function blickDetection(pos, lastPos){
  // if(lastPos - pos){

  // }
}

// update stats on every iteration
document.addEventListener('clmtrackrIteration', function(event) {
  stats.update();
}, false);