var socket = io.connect('http://' + location.host);

var container, stats;

var camera, scene, renderer;

var group, plane;

var speed = 50;

var pointLight;

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

var w = 100;
var h = 75;

var frameCount = 0;

var nothing, goToHell;

var history = [];
var eye = [];
var planes = [];

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

function viewportPair(pos) {
  var x1 = pos[0][0] === -1 ? -1 : ((w - pos[0][0]) / w * 2 - 1) * windowHalfX;
  var y1 = pos[0][1] === -1 ? -1 : (-pos[0][1] / h * 2 + 1) * windowHalfX;
  var x2 = pos[1][0] === -1 ? -1 : ((w - pos[1][0]) / w * 2 - 1) * windowHalfX;
  var y2 = pos[1][1] === -1 ? -1 : (-pos[1][1] / h * 2 + 1) * windowHalfX;
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

      hue += index * 0.01 + delta * 0.00003;
      if (hue < 0.6) hue += 0.6;
      if (hue > 0.7) hue -= 0.7;
      // TODO Create a PointOnShape Action/Zone in the particle engine
      //eyeIndex means left / right eye
      //console.log(index, eyeIndex);
      emitterpos[index][eyeIndex].x = eye[index][eyeIndex][0];
      emitterpos[index][eyeIndex].y = eye[index][eyeIndex][1];
      emitterpos[index][eyeIndex].z = -400 * index;
      //console.log(emitterpos[index][eyeIndex].x)

    }

    //console.log(eyeL[1], eyeR[1])

    // pointLight.position.copy( emitterpos );
    pointLight.position.x = emitterpos[index][eyeIndex].x;
    pointLight.position.y = emitterpos[index][eyeIndex].y;
    pointLight.position.z = -400 * index;

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

  //controls.update();
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
    console.log('wat');
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
        //console.log(eye[index])
        drawEyes(eye[index][0], eye[index][1], index);
      } else {
        sparksEmitters[index][0].addCallback("created", nothing);
        sparksEmitters[index][0].addCallback("updated", goToHell);
        sparksEmitters[index][1].addCallback("created", nothing);
        sparksEmitters[index][1].addCallback("updated", goToHell);
        //removePlane(index);
      }
    });

    group.position.z++;

  }

  group.rotation.y += (targetRotationX - group.rotation.y) * 0.03;
  group.rotation.x += (targetRotationY - group.rotation.x) * 0.03;

  renderer.clear();
  composer.render(0.1);

}

function addPlane(index) {
  planes[index] = new THREE.Mesh(new THREE.PlaneBufferGeometry(400, 400), new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.2
  }));
  planes[index].position.y = 100;
  planes[index].position.z = -200 * index;
  group.add(planes[index]);
}

function removePlane(index) {
  scene.remove(planes[index]);
  // planes[index].traverse(function (item) {
  //     if (item instanceof THREE.Mesh) {
  //       item.geometry.dispose();
  //       item.material.dispose();
  //     }
  //   })
  //planes[index] = null
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

window.onkeydown = function (e) {
  //w or up arrow
  if (e.which === 87 || e.which === 38) {
    e.preventDefault();
    group.position.z += 50;
    // console.log(camera.position.z);
  }
  //s or down arrow
  if (e.which === 83 || e.which === 40) {
    e.preventDefault();
    group.position.z -= 50;
    // console.log(camera.position.z);
  }
  // //a or left
  // if (e.which === 65 || e.which === 37) {
  //   e.preventDefault();
  //   camera.position.x
  // }
  // //d or right
  // if (e.which === 68 || e.which === 39) {

  // }
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
    //addPlane(history.length - 1);
  }
  if (data[1]) {
    history.push(data[1].eye);
    addEyes(history.length - 1, 0);
    addEyes(history.length - 1, 1);
    //addPlane(history.length - 1);
  }
  //console.log(history);
});