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
  init();
  drawLoop();
}

var frameCount = 0;
var lastPosL = [];
var lastPosR = [];
var historyL = [];
var historyR = [];

function init(){
  overlayCC.translate(-overlay.width, 0);
  overlayCC.scale(-1, 1);
}

function viewPort(pos){
  var x = pos[0] / videoel.width * overlay.width;
  var y = pos[1] / videoel.height * overlay.height;
  return [x, y];
}

function drawLoop() {
  requestAnimFrame(drawLoop);

  frameCount ++;

  overlayCC.clearRect(0, 0, overlay.width, overlay.height);

  //overlayCC.save();
  overlayCC.translate(overlay.width, 0);
  overlayCC.scale(-1, 1);
  overlayCC.drawImage(vid, 0, 0, overlay.width, overlay.height);
  //overlayCC.restore();
  //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);


  if (ctrack.getCurrentPosition()) {
    var positions = ctrack.getCurrentPosition();

    // if(frameCount % 30 === 0){
    //   lastPosL = positions[27];
    //   lastPosR = positions[32];
    // }

    if(frameCount < 60){
      historyL.push(positions[27]);
      historyR.push(positions[32]);
    }else{
      lastPosL = historyL.shift();
      lastPosR = historyR.shift();
      historyL.push(positions[27]);
      historyR.push(positions[32]);
    }

    if(frameCount % 2 === 0){
      if(blickDetection(positions[27], lastPosL)){
        console.log('left blink!');
      }
      if(blickDetection(positions[32], lastPosR)){
        console.log('right blink!');
      }
    }

    overlayCC.strokeStyle = 'red';
    overlayCC.beginPath();
    var a = viewPort(lastPosL);
    overlayCC.moveTo(a[0], a[1]);
    var b = viewPort(positions[27]);
    overlayCC.lineTo(b[0], b[1]);
    overlayCC.stroke();

    overlayCC.beginPath();
    var a1 = viewPort(lastPosR);
    overlayCC.moveTo(a1[0], a1[1]);
    var b1 = viewPort(positions[32]);
    overlayCC.lineTo(b1[0], b1[1]);
    overlayCC.stroke();

    // ctrack.draw(overlay);
    overlayCC.fillStyle = 'white';
    overlayCC.fillRect(b[0], b[1], 3, 3);
    overlayCC.fillRect(b1[0], b1[1], 3, 3);

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

//how could you keep track of the past??
function blickDetection(pos, lastPos){
  if( pos[1] - lastPos[1] > videoel.height * 0.006 && pos[1] - lastPos[1] < videoel.height * 0.03){
    if( Math.abs( pos[0] - lastPos[0]) < videoel.width * 0.01){
      return true;
    }
    return false;
  }
  return false;
}



// update stats on every iteration
document.addEventListener('clmtrackrIteration', function(event) {
  stats.update();
}, false);