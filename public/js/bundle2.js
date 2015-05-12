(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/karen/Documents/my_project/gaze/public/js/index2.js":[function(require,module,exports){
var socket = io.connect('http://' + location.host);

var container, stats;

var camera, scene, renderer;

var group, plane;

var speed = 50;

var targetRotationX = 0;
var targetRotationY = 0;

var mouseX = 0;
var mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var delta = 1,
  clock = new THREE.Clock();

var particleCloud;

var composer;
var effectBlurX, effectBlurY, hblur, vblur;

var sparksEmitters = [];
var emitterpos = [];
var hue = [];

var w = 100;
var h = 75;

var frameCount = 0;

var nothing, goToHell;

var history = [];
var eye = [];
var start = [];

var MAX_NUM = 20;
var SATURATION = 0.3;
var ACCELERATION_X = 0;
var RANDOMESS_X = 10;
var LIFE = 5;

var newpos = require('./particle.js').newpos;
var Pool = require('./particle.js').Pool;
var attributes = require('./particle.js').attributes;

var setTargetParticle;
var onParticleDead;

var ZGAP = 500;

function viewportPair(pos) {
  var x1 = pos[0][0] === -1 ? -1 : ((w - pos[0][0]) / w * 2 - 1) * windowHalfX;
  var y1 = pos[0][1] === -1 ? -1 : (-pos[0][1] / h * 2 + 1) * windowHalfX;
  var x2 = pos[1][0] === -1 ? -1 : ((w - pos[1][0]) / w * 2 - 1) * windowHalfX;
  var y2 = pos[1][1] === -1 ? -1 : (-pos[1][1] / h * 2 + 1) * windowHalfX;

  if (x1 === 0 || x2 === 0 || y1 === 0 || y2 === 0) console.log('meow');
  return [
    [x1, y1],
    [x2, y2]
  ];
}

function init() {

  container = document.getElementById('container');
  // CAMERA

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.set(0, 100, 400);

  // SCENE
  scene = new THREE.Scene();

  // LIGHTS
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, -1, 1);
  directionalLight.position.normalize();
  scene.add(directionalLight);

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

  setTargetParticle = function () {

    var target = Pool.get();
    values_size[target] = Math.random() * 200 + 100;

    return target;

  };

  onParticleCreated = function (p, index, eyeIndex) {
    var position = p.position;
    p.target.position = position;

    var target = p.target;

    if (target) {

      // console.log(target,particles.vertices[target]);
      // values_size[target]
      // values_color[target]
      // hue += 0.00008 * delta;
      // if (hue < 0.4) hue += 0.4;
      // if (hue > 0.7) hue -= 0.7;
      // break;

      hue[index] = index * 0.04 + delta * 0.00001;
      if (hue[index] < 0.6) hue[index] += 0.6;
      if (hue[index] > 0.7) hue[index] -= 0.7;
      // TODO Create a PointOnShape Action/Zone in the particle engine
      //eyeIndex means left / right eye
      //console.log(index, eyeIndex);
      //if (eye[index][eyeIndex][0] === 0 || eye[index][eyeIndex][1] === 0) console.log('meow');

      emitterpos[index][eyeIndex].x = eye[index][eyeIndex][0];
      emitterpos[index][eyeIndex].y = eye[index][eyeIndex][1];
      emitterpos[index][eyeIndex].z = -ZGAP * index;
      //console.log(emitterpos[index][eyeIndex].x)

    }

    particles.vertices[target] = p.position;

    values_color[target].setHSL(hue[index], SATURATION, 0.1);
  }

  onParticleDead = function (particle) {

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
  document.addEventListener('mousemove', onDocumentMouseMove, false);

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

function animate() {

  requestAnimationFrame(animate);

  frameCount++;

  if (frameCount % 3 === 0) {
    render();
  }

  stats.update();

}

function addEyes(index, eyeIndex) {

  if (sparksEmitters[index] === undefined) {
    sparksEmitters[index] = [];
  }

  sparksEmitters[index][eyeIndex] = new SPARKS.Emitter(new SPARKS.SteadyCounter(MAX_NUM));

  if (emitterpos[index] === undefined) {
    emitterpos[index] = [];
  }
  emitterpos[index][eyeIndex] = new THREE.Vector3(0, 0, 0);

  sparksEmitters[index][eyeIndex].addInitializer(new SPARKS.Position(new SPARKS.PointZone(emitterpos[index][eyeIndex])));
  sparksEmitters[index][eyeIndex].addInitializer(new SPARKS.Lifetime(0, LIFE));
  sparksEmitters[index][eyeIndex].addInitializer(new SPARKS.Target(null, setTargetParticle));

  sparksEmitters[index][eyeIndex].addInitializer(new SPARKS.Velocity(new SPARKS.PointZone(new THREE.Vector3(0, -5, 1))));

  sparksEmitters[index][eyeIndex].addAction(new SPARKS.Age(TWEEN.Easing.Quartic.In));

  sparksEmitters[index][eyeIndex].addAction(new SPARKS.Move());
  sparksEmitters[index][eyeIndex].addAction(new SPARKS.RandomDrift(RANDOMESS_X, 5, 10));

  sparksEmitters[index][eyeIndex].addCallback("created", function (p) {
    onParticleCreated(p, index, eyeIndex);
  });
  sparksEmitters[index][eyeIndex].addCallback("dead", onParticleDead);

  switch (eyeIndex) {
  case 0:
    //console.log('left')
    sparksEmitters[index][eyeIndex].addAction(new SPARKS.Accelerate(Math.random() * -(ACCELERATION_X), 0, -2));
    break;
  case 1:
    //console.log('right')
    sparksEmitters[index][eyeIndex].addAction(new SPARKS.Accelerate(Math.random() * ACCELERATION_X, 0, -2));
    break;
  }

  sparksEmitters[index][eyeIndex].start();
}

function drawEyes(posL, posR, index) {

  if (posR[0] === -1) {
    sparksEmitters[index][0].addCallback("created", nothing);
    sparksEmitters[index][0].addCallback("updated", goToHell);
    setTimeout(function () {
      sparksEmitters[index][0].addCallback("updated", nothing);
      sparksEmitters[index][0].addCallback("created", function (p) {
        onParticleCreated(p, index, 0);
      });
    }, Math.random() * 120 + 80);
  }

  if (posL[0] === -1) {
    sparksEmitters[index][1].addCallback("created", nothing);
    sparksEmitters[index][1].addCallback("updated", goToHell);
    setTimeout(function () {
      sparksEmitters[index][1].addCallback("updated", nothing);
      sparksEmitters[index][1].addCallback("created", function (p) {
        onParticleCreated(p, index, 1);
      });
    }, Math.random() * 120 + 80);
  }
}

function render() {

  delta = speed * clock.getDelta();

  particleCloud.geometry.verticesNeedUpdate = true;

  attributes.size.needsUpdate = true;
  attributes.pcolor.needsUpdate = true;

  //definitely a lot of problem here
  if (history.length) {
    //console.log(history)
    history.forEach(function (h, index) {
      if (h.length) {
        var raw = h.shift();
        eye[index] = viewportPair(raw);
        drawEyes(eye[index][0], eye[index][1], index);
      } else {
        sparksEmitters[index][0].addCallback("created", nothing);
        sparksEmitters[index][0].addCallback("updated", goToHell);
        sparksEmitters[index][1].addCallback("created", nothing);
        sparksEmitters[index][1].addCallback("updated", goToHell);
      }
    });

    group.position.z += 2;

  } else {
    console.log('wat');
  }

  group.rotation.y += (targetRotationX - group.rotation.y) * 0.03;
  group.rotation.x += (targetRotationY - group.rotation.x) * 0.03;

  renderer.clear();
  composer.render(0.1);

}

function deQueue(que) {
  return que.shift();
}

function onDocumentMouseMove(event) {

  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;

  targetRotationX = mouseX * 0.001;
  targetRotationY = mouseY * 0.001;

}

init();
animate();

socket.on('hello', function () {
  console.log('hello back');
  setTimeout(function () {
    $('#hint').fadeIn('slow');
  }, 1000);
  setTimeout(function () {
    $('#hint').fadeOut();
    socket.emit('request');
  }, 4000);

});

socket.on('data', function (data) {
  // if (data[0]) {
  //   history.push(data[0].eye);
  //   eye[history.length - 1] = viewportPair(deQueue(history[history.length - 1]));
  //   addEyes(history.length - 1, 0);
  //   addEyes(history.length - 1, 1);
  // }
  // if (data[1]) {
  //   history.push(data[1].eye);
  //   eye[history.length - 1] = viewportPair(deQueue(history[history.length - 1]));
  //   addEyes(history.length - 1, 0);
  //   addEyes(history.length - 1, 1);
  // }
  //console.log(history);
  console.log('get one pair of eyes');
  history.push(data.eye);
  eye[history.length - 1] = viewportPair(deQueue(history[history.length - 1]));
  console.log(eye[history.length - 1]);
  addEyes(history.length - 1, 0);
  addEyes(history.length - 1, 1);
});
},{"./particle.js":"/Users/karen/Documents/my_project/gaze/public/js/particle.js"}],"/Users/karen/Documents/my_project/gaze/public/js/particle.js":[function(require,module,exports){
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
},{}]},{},["/Users/karen/Documents/my_project/gaze/public/js/index2.js"]);
