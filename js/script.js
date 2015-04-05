 // window.onload = function () {
 //   var video = document.getElementById('video');
 //   var canvas = document.getElementById('canvas');
 //   var context = canvas.getContext('2d');

 //   // var tracker = new tracking.ObjectTracker(['face', 'eye']);
 //   var tracker = new tracking.ObjectTracker('eye');
 //   // tracker.setInitialScale(4);
 //   // tracker.setStepSize(2);
 //   // tracker.setEdgesDensity(0.1);

 //   tracking.track('#video', tracker, {
 //     camera: true
 //   });

 //   tracker.on('track', function (event) {
 //     context.clearRect(0, 0, canvas.width, canvas.height);
 //     context.fillStyle = 'black';
 //     context.fillRect(0, 0, canvas.width, canvas.height);

 //     event.data.forEach(function (rect) {
 //       context.beginPath();
 //       context.arc(rect.x + rect.width / 2, rect.y + rect.width / 2, rect.width / 4, 0, 2 * Math.PI, false);
 //       context.fillStyle = 'white';
 //       context.fill();
 //       // context.strokeStyle = '#a64ceb';
 //       // context.strokeRect(rect.x, rect.y, rect.width, rect.height);
 //       // context.font = '11px Helvetica';
 //       // context.fillStyle = "#fff";
 //       // context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
 //       // context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
 //     });
 //   });

 // };

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

function drawLoop() {
  requestAnimFrame(drawLoop);
  overlayCC.clearRect(0, 0, 400, 300);
  //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);

  if (ctrack.getCurrentPosition()) {
    var positions = ctrack.getCurrentPosition();
    // ctrack.draw(overlay);
    overlayCC.fillStyle = 'white';
    overlayCC.fillRect(positions[27][0], positions[27][1], 3, 3);
    overlayCC.fillRect(positions[32][0], positions[32][1], 3, 3);

    overlayCC.fillStyle = 'green';

    overlayCC.fillRect(positions[63][0], positions[63][1], 3, 3);
    overlayCC.fillRect(positions[24][0], positions[24][1], 3, 3);
    overlayCC.fillRect(positions[64][0], positions[64][1], 3, 3);
    overlayCC.fillRect(positions[23][0], positions[23][1], 1, 1);

    overlayCC.fillRect(positions[66][0], positions[66][1], 3, 3);
    overlayCC.fillRect(positions[26][0], positions[26][1], 3, 3);
    overlayCC.fillRect(positions[65][0], positions[65][1], 3, 3);
    overlayCC.fillRect(positions[25][0], positions[25][1], 1, 1);

    overlayCC.fillRect(positions[68][0], positions[68][1], 3, 3);
    overlayCC.fillRect(positions[29][0], positions[29][1], 3, 3);
    overlayCC.fillRect(positions[67][0], positions[67][1], 3, 3);
    overlayCC.fillRect(positions[30][0], positions[30][1], 1, 1);

    overlayCC.fillRect(positions[69][0], positions[69][1], 3, 3);
    overlayCC.fillRect(positions[31][0], positions[31][1], 3, 3);
    overlayCC.fillRect(positions[70][0], positions[70][1], 3, 3);
    overlayCC.fillRect(positions[28][0], positions[28][1], 1, 1);
  }
}

// update stats on every iteration
document.addEventListener('clmtrackrIteration', function(event) {
  stats.update();
}, false);