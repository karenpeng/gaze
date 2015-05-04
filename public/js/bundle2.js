(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/karen/Documents/my_project/gaze/node_modules/inherits/inherits_browser.js":[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],"/Users/karen/Documents/my_project/gaze/public/js/index2.js":[function(require,module,exports){
var track = require('./track.js');
var blinkL = track.blinkL;
var blinkR = track.blinkR;

var container, stats;

var camera, scene, renderer;

var controls;

var group, plane;

var speed = 50;

var pointLight;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var delta = 1,
  clock = new THREE.Clock();

var heartShape, particleCloud;
var _rotation = 0;
var timeOnShapePath = 0;

var composer;
var effectBlurX, effectBlurY, hblur, vblur;

var sparksEmitters = [];
var emitterpos = [];

var eyeL, eyeR;

var rawL, rawR;

var w = document.getElementById('videoel').width;
var h = document.getElementById('videoel').height;

var frameCount = 0;
var keepLooping = true;

var nothing, goToHell;

var records = [];
var othersRecords = [];
var recordCountDown = 0;
var progress = document.getElementById('progress');
var gap = 400;
var beginRecord = 500;
var endRecord = 1000;
var startOther = false;
var gameStart = false;
var RADIUS = 40;
var MAX_NUM = 10;
var SATURATION = 0.3;
var ACCELERATION_X = 0;
var RANDOMESS_X = 10;
var LIFE = 3;
var otherBegin = false;

var newpos = require('./particle.js').newpos;
var Pool = require('./particle.js').Pool;
var attributes = require('./particle.js').attributes;
//var uniforms = require('./particle.js').uniforms;
//var shaderMaterial = require('./particle.js').shaderMaterial;
//var composer;

function viewport(pos) {
  var x = ((w - pos[0]) / w * 2 - 1) * windowHalfX * 1.2;
  var y = (-pos[1] / h * 2 + 1) * windowHalfX * 1.5;
  return [x, y];
}

function init() {

  // rawL = require('./track.js').posL;
  // rawR = require('./track.js').posR;

  // eyeL = viewport(rawL);
  // eyeR = viewport(rawR);
  eyeL = [0, 0];
  eyeR = [0, 0];

  container = document.getElementById('container');
  // CAMERA

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.set(0, 150, 400);

  // SCENE

  scene = new THREE.Scene();

  // CONTROLS
  // controls = new THREE.OrbitControls(camera);
  // controls.damping = 0.2;

  // LIGHTS

  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, -1, 1);
  directionalLight.position.normalize();
  scene.add(directionalLight);

  pointLight = new THREE.PointLight(0xffffff, 2, 300);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  group = new THREE.Group();
  scene.add(group);

  // Create particle objects for Three.js

  var particlesLength = 10000;

  var particles = new THREE.Geometry();

  for (i = 0; i < particlesLength; i++) {

    particles.vertices.push(newpos(Math.random() * 200 - 100, Math.random() * 100 + 150, Math.random() * 50));
    Pool.add(i);

  }

  // Create pools of vectors

  var sprite = require('./particle.js').generateSprite();
  //document.body.appendChild(sprite);

  texture = new THREE.Texture(sprite);
  texture.needsUpdate = true;

  uniforms = {

    texture: {
      type: "t",
      value: texture
    }

  };

  var shaderMaterial = new THREE.ShaderMaterial({

    uniforms: uniforms,
    attributes: attributes,

    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent,

    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true

  });

  // PARAMETERS

  // Steadycounter
  // Life
  // Opacity
  // Hue Speed
  // Movement Speed

  particleCloud = new THREE.PointCloud(particles, shaderMaterial);

  var vertices = particleCloud.geometry.vertices;
  var values_size = attributes.size.value;
  var values_color = attributes.pcolor.value;

  for (var v = 0; v < vertices.length; v++) {

    values_size[v] = 50;

    values_color[v] = new THREE.Color(0x000000);

    particles.vertices[v].set(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

  }

  group.add(particleCloud);
  particleCloud.y = 800;

  var hue = 0;

  var setTargetParticle = function () {

    var target = Pool.get();
    values_size[target] = Math.random() * 200 + 100;

    return target;

  };

  onParticleCreated = function (p, c, index) {
    var position = p.position;
    p.target.position = position;

    var target = p.target;

    if (target) {

      // console.log(target,particles.vertices[target]);
      // values_size[target]
      // values_color[target]
      switch (c) {
      case 'me':
        hue += 0.00008 * delta;
        if (hue < 0.4) hue += 0.4;
        if (hue > 0.7) hue -= 0.7;
        break;
      case 'other':
        hue += 0.0003 * delta;
        if (hue < 0.6) hue += 0.6;
        if (hue > 0.7) hue -= 0.7;
        break;
      }
      // TODO Create a PointOnShape Action/Zone in the particle engine

      timeOnShapePath += 0.00035 * delta;
      if (timeOnShapePath > 1) timeOnShapePath -= 1;

      switch (index) {
      case 0:
        emitterpos[index].x = eyeR[0];
        emitterpos[index].y = eyeR[1];
        break;
      case 1:
        emitterpos[index].x = eyeL[0];
        emitterpos[index].y = eyeL[1];
        break;
      }

      //console.log(eyeL[1], eyeR[1])

      // pointLight.position.copy( emitterpos );
      pointLight.position.x = emitterpos.x;
      pointLight.position.y = emitterpos.y;
      pointLight.position.z = 100;

      particles.vertices[target] = p.position;

      values_color[target].setHSL(hue, SATURATION, 0.1);

      pointLight.color.setHSL(hue, SATURATION, 0.9);

    };
  }

  var onParticleDead = function (particle) {

    var target = particle.target;

    if (target) {

      // Hide the particle

      values_color[target].setRGB(0, 0, 0);
      particles.vertices[target].set(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

      // Mark particle system as available by returning to pool

      Pool.add(particle.target);

    }

  };

  var engineLoopUpdate = function () {

  };

  nothing = function () {
    //do nothing
  }

  goToHell = function (particle) {
    particle.age += 1;
  };

  function sparkConfig(index) {

    sparksEmitters[index] = new SPARKS.Emitter(new SPARKS.SteadyCounter(MAX_NUM));

    emitterpos[index] = new THREE.Vector3(0, 0, 0);

    sparksEmitters[index].addInitializer(new SPARKS.Position(new SPARKS.PointZone(emitterpos[index])));
    sparksEmitters[index].addInitializer(new SPARKS.Lifetime(0, LIFE));
    sparksEmitters[index].addInitializer(new SPARKS.Target(null, setTargetParticle));

    sparksEmitters[index].addInitializer(new SPARKS.Velocity(new SPARKS.PointZone(new THREE.Vector3(0, -5, 1))));

    sparksEmitters[index].addAction(new SPARKS.Age(TWEEN.Easing.Quartic.In));
    //sparksEmitter.addAction( new SPARKS.Age() );

    sparksEmitters[index].addAction(new SPARKS.Move());
    sparksEmitters[index].addAction(new SPARKS.RandomDrift(RANDOMESS_X, 5, 100));

    sparksEmitters[index].addCallback("created", function (p) {
      onParticleCreated(p, 'me', index);
    });
    sparksEmitters[index].addCallback("dead", onParticleDead);

    switch (index) {
    case 0:
      sparksEmitters[index].addAction(new SPARKS.Accelerate(Math.random() * -(ACCELERATION_X), 0, -20));
      break;
    case 1:
      sparksEmitters[index].addAction(new SPARKS.Accelerate(Math.random() * ACCELERATION_X, 0, -20));
      break;
    }
  }

  sparkConfig(0);
  sparkConfig(1);

  // sparksEmitter1.start();
  blinkR.on('Rblink', function () {
    //console.log('right blink!');
    sparksEmitters[0].addCallback("created", nothing);
    sparksEmitters[0].addCallback("updated", goToHell);
    setTimeout(function () {
      sparksEmitters[0].addCallback("updated", nothing);
      sparksEmitters[0].addCallback("created", function (p) {
        onParticleCreated(p, 'me', 0);
      });
    }, Math.random() * 120 + 80);
  });

  blinkL.on('Lblink', function () {
    //console.log('left blink!');
    sparksEmitters[1].addCallback("created", nothing);
    sparksEmitters[1].addCallback("updated", goToHell);
    setTimeout(function () {
      sparksEmitters[1].addCallback("updated", nothing);
      sparksEmitters[1].addCallback("created", function (p) {
        onParticleCreated(p, 'me', 1);
      });
    }, Math.random() * 120 + 80);
  });

  // End Particles
  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.left = '0px';
  container.appendChild(stats.domElement);

  // composer = require('./particle.js').effectConfig(scene, camera, renderer);

  var effectFocus = new THREE.ShaderPass(THREE.FocusShader);

  var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
  effectFilm = new THREE.FilmPass(0.5, 0.25, 2048, false);

  var shaderBlur = THREE.TriangleBlurShader;
  effectBlurX = new THREE.ShaderPass(shaderBlur, 'texture');
  effectBlurY = new THREE.ShaderPass(shaderBlur, 'texture');

  var radius = 15;
  var blurAmountX = radius / window.innerWidth;
  var blurAmountY = radius / window.innerHeight;

  hblur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
  vblur = new THREE.ShaderPass(THREE.VerticalBlurShader);

  hblur.uniforms['h'].value = 1 / window.innerWidth;
  vblur.uniforms['v'].value = 1 / window.innerHeight;

  effectBlurX.uniforms['delta'].value = new THREE.Vector2(blurAmountX, 0);
  effectBlurY.uniforms['delta'].value = new THREE.Vector2(0, blurAmountY);

  effectFocus.uniforms['sampleDistance'].value = 0.99; //0.94
  effectFocus.uniforms['waveFactor'].value = 0.003; //0.00125

  var renderScene = new THREE.RenderPass(scene, camera);

  composer = new THREE.EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(hblur);
  composer.addPass(vblur);
  // composer.addPass(effectBlurX);
  // composer.addPass(effectBlurY);
  // composer.addPass(effectCopy);
  // composer.addPass(effectFocus);
  // composer.addPass(effectFilm);

  vblur.renderToScreen = true;
  effectBlurY.renderToScreen = true;
  effectFocus.renderToScreen = true;
  effectCopy.renderToScreen = true;
  effectFilm.renderToScreen = true;

  window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  //

  hblur.uniforms['h'].value = 1 / window.innerWidth;
  vblur.uniforms['v'].value = 1 / window.innerHeight;

  var radius = 15;
  var blurAmountX = radius / window.innerWidth;
  var blurAmountY = radius / window.innerHeight;

  effectBlurX.uniforms['delta'].value = new THREE.Vector2(blurAmountX, 0);
  effectBlurY.uniforms['delta'].value = new THREE.Vector2(0, blurAmountY);

  composer.reset();

}

//

// document.addEventListener( 'mousemove', onDocumentMouseMove, false );

function animate() {

  if (keepLooping) {
    requestAnimationFrame(animate);
  }

  frameCount++;

  if (frameCount % 2 === 0) {
    render();
  }

  //controls.update();
  stats.update();

}

function render() {

  delta = speed * clock.getDelta();

  particleCloud.geometry.verticesNeedUpdate = true;

  attributes.size.needsUpdate = true;
  attributes.pcolor.needsUpdate = true;

  // Pretty cool effect if you enable this
  // particleCloud.rotation.y += 0.05;
  rawL = require('./track.js').posL;
  rawR = require('./track.js').posR;
  var largeMove = require('./track.js').largeMove;

  //group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;
  if (!gameStart) {
    if (rawL !== undefined && rawR !== undefined) {
      gameStart = true;
    }
  }

  if (gameStart) {
    recordCountDown++;

    if (recordCountDown === 10) {
      console.log('hello')
      sparksEmitters.forEach(function (sparksEmitter, index) {
        sparksEmitter.addCallback("updated", nothing);
        sparksEmitter.addCallback("created", function (p) {
          onParticleCreated(p, 'other', index);
        });
        sparksEmitter.start();
      });
      // sparksEmitters[0].start();
      // sparksEmitters[1].start();
    }

    // if (largeMove) {
    //   //console.log('too much!')
    //   sparksEmitters.forEach(function (sparksEmitter) {
    //     sparksEmitter.addCallback("created", nothing);
    //     sparksEmitter.addCallback("updated", goToHell);
    //   });

    // } else {
    //   sparksEmitters.forEach(function (sparksEmitter, index) {
    //     sparksEmitter.addCallback("update", nothing);
    //     sparksEmitter.addCallback("created", function (p) {
    //       //console.log(index)
    //       onParticleCreated(p, 'me', index);
    //     });

    //   });
    // }

    if (recordCountDown < gap) {
      if (rawL !== undefined) {
        eyeL = viewport(rawL);
      }
      if (rawR !== undefined) {
        eyeR = viewport(rawR);
      }
      //console.log(rawL[1], rawR[1])
      //console.log(eyeL[1], eyeR[1])
    }

    if (recordCountDown === gap) {
      //the user will think the detection is incorrect!!!
      //TODE: to make some hints or warning.
      sparksEmitters.forEach(function (sparksEmitter) {
        sparksEmitter.addCallback("created", nothing);
        sparksEmitter.addCallback("updated", goToHell);
      });

    }

    if (startOther && othersRecords.length && !otherBegin) {

      var eye = othersRecords.shift();
      eyeL = viewport(eye[0]);
      eyeR = viewport(eye[1]);

      sparksEmitters.forEach(function (sparksEmitter, index) {
        sparksEmitter.addCallback("updated", nothing);
        sparksEmitter.addCallback("created", function (p) {
          onParticleCreated(p, 'other', index);
        });
      });

      otherBegin = true;

    }

    if (startOther && !othersRecords.length) {
      sparksEmitters.forEach(function (sparksEmitter) {
        sparksEmitter.addCallback("created", nothing);
        sparksEmitter.addCallback("updated", goToHell);
      });
      require('./track.js').ctrack.stop();
      setTimeout(function () {
        keepLooping = false
      }, 6000);
    }

    if (recordCountDown > beginRecord && recordCountDown <= endRecord) {
      records.push([rawL, rawR]);
      var w = window.innerWidth * (recordCountDown - beginRecord) / (endRecord - beginRecord);
      document.getElementById('progress').setAttribute('style', 'width:' + w + 'px;');
    }

    if (recordCountDown === beginRecord) {

      $.ajax({
        url: '/previous',
        method: 'GET',
        //dataType means the data you get
        dataType: 'json',
        error: function (err) {
          console.error(err);
        },
        success: function (data) {
          othersRecords = data.eye;
          console.log(othersRecords);
          startOther = true;
        }
      });
    }

    if (recordCountDown === endRecord) {
      console.log(records.length);
      $.ajax({
        url: '/upload',
        method: 'POST',
        //contentType means the data you sent
        contentType: 'application/json; charset=utf-8',
        //stringify is important
        //see:
        //http://encosia.com/asmx-scriptservice-mistake-invalid-json-primitive/
        data: JSON.stringify({
          eye: records
        }),
        //dataType: 'json',
        error: function (err) {
          console.error(err);
        },
        success: function () {
          console.log('(•ω•)');
        }
      });
    }

  }
  renderer.clear();
  composer.render(0.1);

}

init();
animate();
},{"./particle.js":"/Users/karen/Documents/my_project/gaze/public/js/particle.js","./track.js":"/Users/karen/Documents/my_project/gaze/public/js/track.js"}],"/Users/karen/Documents/my_project/gaze/public/js/particle.js":[function(require,module,exports){
var RADIUS = 40;

exports.generateSprite = function () {

  var canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;

  var context = canvas.getContext('2d');

  context.beginPath();
  context.arc(64, 64, RADIUS, 0, Math.PI * 2, false);

  context.lineWidth = 0.5; //0.05
  context.stroke();
  context.restore();

  var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);

  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.4, 'rgba(200,200,200,1)');
  gradient.addColorStop(1, 'rgba(0,0,0,1)');

  context.fillStyle = gradient;

  context.fill();

  return canvas;

};

exports.Pool = {

  __pools: [],

  // Get a new Vector

  get: function () {

    if (this.__pools.length > 0) {

      return this.__pools.pop();

    }

    console.log("pool ran out!")
    return null;

  },

  // Release a vector back into the pool

  add: function (v) {

    this.__pools.push(v);

  }

};

exports.newpos = function (x, y, z) {

  return new THREE.Vector3(x, y, z);

};

exports.attributes = {

  size: {
    type: 'f',
    value: []
  },
  pcolor: {
    type: 'c',
    value: []
  }

};

// exports.texture = new THREE.Texture(exports.sprite);
// exports.texture.needsUpdate = true;

// exports.uniforms = {

//   texture: {
//     type: "t",
//     value: exports.texture
//   }

// };

// exports.shaderMaterial = new THREE.ShaderMaterial({

//   uniforms: exports.uniforms,
//   attributes: exports.attributes,

//   vertexShader: document.getElementById('vertexshader').textContent,
//   fragmentShader: document.getElementById('fragmentshader').textContent,

//   blending: THREE.AdditiveBlending,
//   depthWrite: false,
//   transparent: true

// });

// exports.effectConfig = function (scene, camera, renderer) {
//   // POST PROCESSING

//   var effectFocus = new THREE.ShaderPass(THREE.FocusShader);

//   var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
//   effectFilm = new THREE.FilmPass(0.5, 0.25, 2048, false);

//   var shaderBlur = THREE.TriangleBlurShader;
//   effectBlurX = new THREE.ShaderPass(shaderBlur, 'texture');
//   effectBlurY = new THREE.ShaderPass(shaderBlur, 'texture');

//   var radius = 15;
//   var blurAmountX = radius / window.innerWidth;
//   var blurAmountY = radius / window.innerHeight;

//   hblur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
//   vblur = new THREE.ShaderPass(THREE.VerticalBlurShader);

//   hblur.uniforms['h'].value = 1 / window.innerWidth;
//   vblur.uniforms['v'].value = 1 / window.innerHeight;

//   effectBlurX.uniforms['delta'].value = new THREE.Vector2(blurAmountX, 0);
//   effectBlurY.uniforms['delta'].value = new THREE.Vector2(0, blurAmountY);

//   effectFocus.uniforms['sampleDistance'].value = 0.99; //0.94
//   effectFocus.uniforms['waveFactor'].value = 0.003; //0.00125

//   var renderScene = new THREE.RenderPass(scene, camera);

//   composer = new THREE.EffectComposer(renderer);
//   composer.addPass(renderScene);
//   composer.addPass(hblur);
//   composer.addPass(vblur);
//   composer.addPass(effectBlurX);
//   composer.addPass(effectBlurY);
//   composer.addPass(effectCopy);
//   composer.addPass(effectFocus);
//   // composer.addPass(effectFilm);

//   vblur.renderToScreen = true;
//   effectBlurY.renderToScreen = true;
//   effectFocus.renderToScreen = true;
//   effectCopy.renderToScreen = true;
//   effectFilm.renderToScreen = true;

//   return composer;
// }
},{}],"/Users/karen/Documents/my_project/gaze/public/js/track.js":[function(require,module,exports){
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
    //console.log(exports.posL[1], exports.posR[1])
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
},{"events":"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js","inherits":"/Users/karen/Documents/my_project/gaze/node_modules/inherits/inherits_browser.js"}],"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},["/Users/karen/Documents/my_project/gaze/public/js/index2.js"]);
