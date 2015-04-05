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
    ctrack.draw(overlay);
  }
}

// update stats on every iteration
document.addEventListener('clmtrackrIteration', function(event) {
  stats.update();
}, false);