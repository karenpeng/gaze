(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/karen/Documents/my_project/gaze/public/js/index2.js":[function(require,module,exports){
var socket = io.connect('http://' + location.host);

var container, stats;

var camera, scene, renderer;

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

var particleCloud;

var composer;
var effectBlurX, effectBlurY, hblur, vblur;

var sparksEmitters = [];
var emitterpos = [];

var w = 100;
var h = 75;

var frameCount = 0;

var nothing, goToHell;

var history = [];
var eye = [];

var MAX_NUM = 10;
var SATURATION = 0.3;
var ACCELERATION_X = 0;
var RANDOMESS_X = 10;
var LIFE = 3;

var newpos = require('./particle.js').newpos;
var Pool = require('./particle.js').Pool;
var attributes = require('./particle.js').attributes;

var setTargetParticle;
var onParticleDead;

function viewportPair(pos) {
  var x1 = ((w - pos[0][0]) / w * 2 - 1) * windowHalfX;
  var y1 = (-pos[0][1] / h * 2 + 1) * windowHalfX * 1.2;
  var x2 = ((w - pos[1][0]) / w * 2 - 1) * windowHalfX;
  var y2 = (-pos[1][1] / h * 2 + 1) * windowHalfX * 1.2;
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

      hue += 0.0003 * delta;
      if (hue < 0.6) hue += 0.6;
      if (hue > 0.7) hue -= 0.7;
      // TODO Create a PointOnShape Action/Zone in the particle engine
      //eyeIndex means left / right eye
      //console.log(index, eyeIndex);
      emitterpos[index][eyeIndex].x = eye[index][eyeIndex][0];
      emitterpos[index][eyeIndex].y = eye[index][eyeIndex][1];
      //console.log(emitterpos[index][eyeIndex].x)

    }

    //console.log(eyeL[1], eyeR[1])

    // pointLight.position.copy( emitterpos );
    pointLight.position.x = emitterpos[index][eyeIndex].x;
    pointLight.position.y = emitterpos[index][eyeIndex].y;
    pointLight.position.z = -100 * index;

    particles.vertices[target] = p.position;

    values_color[target].setHSL(hue, SATURATION, 0.1);

    pointLight.color.setHSL(hue, SATURATION, 0.9);
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

  var test = new THREE.Mesh(new THREE.SphereGeometry(2, 2, 2), new THREE.MeshNormalMaterial);
  scene.add(test);

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

  if (frameCount % 2 === 0) {
    render();
  }

  //controls.update();
  stats.update();

}

function addEyes(index, eyeIndex) {
  console.log(index, eyeIndex);

  // try {
  //   var a = sparksEmitters[index];
  // } catch (e) {
  //   sparksEmitters[index] = [];
  //   console.log(sparksEmitters[index])
  // }
  if (sparksEmitters[index] === undefined) {
    sparksEmitters[index] = [];
  }

  sparksEmitters[index][eyeIndex] = new SPARKS.Emitter(new SPARKS.SteadyCounter(MAX_NUM));

  // try {
  //   var a = emitterpos[index]
  // } catch (e) {
  //   emitterpos[index] = [];
  // }
  if (emitterpos[index] === undefined) {
    emitterpos[index] = [];
  }
  emitterpos[index][eyeIndex] = new THREE.Vector3(0, 0, 0);
  //console.log(index, eyeIndex);
  //console.log(sparksEmitters[index])
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
    sparksEmitters[index][eyeIndex].addAction(new SPARKS.Accelerate(Math.random() * -(ACCELERATION_X), 0, -10));
    break;
  case 1:
    //console.log('right')
    sparksEmitters[index][eyeIndex].addAction(new SPARKS.Accelerate(Math.random() * ACCELERATION_X, 0, -10));
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

  if (history.length) {
    //console.log(history)
    history.forEach(function (h, index) {
      if (h.length) {
        var raw = h.shift();
        eye[index] = viewportPair(raw);
        //console.log(eye[index])
        //drawEyes(eye[index][0], eye[index][1], index);
      } else {
        sparksEmitters[index][0].addCallback("created", nothing);
        sparksEmitters[index][0].addCallback("updated", goToHell);
        sparksEmitters[index][1].addCallback("created", nothing);
        sparksEmitters[index][1].addCallback("updated", goToHell);
      }
    });
  }

  group.rotation.y += (targetRotation - group.rotation.y) * 0.05;
  renderer.clear();
  composer.render(0.1);

}

function deQueue(que) {
  return que.shift();
}

function onDocumentMouseMove(event) {

  mouseX = event.clientX - windowHalfX;

  targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;

}

window.onkeydown = function (e) {
  //w or up arrow
  if (e.which === 87 || e.which === 38) {
    e.preventDefault();
    camera.position.z -= 10;
    // console.log(camera.position.z);
  }
  //s or down arrow
  if (e.which === 83 || e.which === 40) {
    e.preventDefault();
    camera.position.z += 10;
    // console.log(camera.position.z);
  }
  //a or left
  if (e.which === 65 || e.which === 37) {
    e.preventDefault();
    camera.position.x
  }
  //d or right
  if (e.which === 68 || e.which === 39) {

  }
}

init();
animate();

socket.on('hello', function () {
  console.log('hello back');
  socket.emit('request');
});

socket.on('data', function (data) {
  if (data[0]) {
    history.push(data[0].eye);
    eye[history.length - 1] = viewportPair(deQueue(history[0]));
    addEyes(history.length - 1, 0);
    addEyes(history.length - 1, 1);
  }
  if (data[1]) {
    history.push(data[1].eye);
    addEyes(history.length - 1, 0);
    addEyes(history.length - 1, 1);
  }
  //console.log(history);
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
