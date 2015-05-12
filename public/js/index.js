var track = require('./track.js');

var container, stats;

var camera, scene, renderer;

var group, plane;

var speed = 50;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var delta = 1,
  clock = new THREE.Clock();

var particleCloud;

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
var MAX_NUM = 20;
var SATURATION = 0.3;
var ACCELERATION_X = 0;
var RANDOMESS_X = 10;
var LIFE = 2;

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

  eyeL = [0, 0];
  eyeR = [0, 0];

  container = document.getElementById('container');
  // CAMERA

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.set(0, 150, 400);

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

      particles.vertices[target] = p.position;

      values_color[target].setHSL(hue, SATURATION, 0.1);

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

  if (keepLooping) {
    requestAnimationFrame(animate);
  }

  frameCount++;

  if (frameCount % 2 === 0) {
    render();
  }

  stats.update();

}

function drawEyes(posL, posR, name) {

  if (posR[0] === -1) {
    sparksEmitters[0].addCallback("created", nothing);
    sparksEmitters[0].addCallback("updated", goToHell);
    setTimeout(function () {
      sparksEmitters[0].addCallback("updated", nothing);
      sparksEmitters[0].addCallback("created", function (p) {
        onParticleCreated(p, name, 0);
      });
    }, Math.random() * 120 + 80);
  } else if (posR !== undefined) {
    eyeR = viewport(posR);
  }

  if (posL[0] === -1) {
    sparksEmitters[1].addCallback("created", nothing);
    sparksEmitters[1].addCallback("updated", goToHell);
    setTimeout(function () {
      sparksEmitters[1].addCallback("updated", nothing);
      sparksEmitters[1].addCallback("created", function (p) {
        onParticleCreated(p, name, 1);
      });
    }, Math.random() * 120 + 80);
  } else if (posL !== undefined) {
    eyeL = viewport(posL);
  }
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

  if (!gameStart) {
    if (rawL !== undefined && rawR !== undefined) {
      gameStart = true;
    }
  }

  if (gameStart) {
    recordCountDown++;

    if (recordCountDown === 10) {
      sparksEmitters.forEach(function (sparksEmitter, index) {
        sparksEmitter.start();
      });
    }

    if (recordCountDown < gap) {

      drawEyes(rawL, rawR, 'me');
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

      setTimeout(function () {
        $('#other').fadeIn('slow');
      }, 3000);
      setTimeout(function () {
        $('#other').fadeOut();
      }, 6000);
    }

    if (startOther && othersRecords.length) {

      var eye = othersRecords.shift();
      drawEyes(eye[0], eye[1], 'other');

    }

    if (startOther && !othersRecords.length) {
      sparksEmitters.forEach(function (sparksEmitter) {
        sparksEmitter.addCallback("created", nothing);
        sparksEmitter.addCallback("updated", goToHell);
      });
      require('./track.js').ctrack.stop();
      setTimeout(function () {
        keepLooping = false;
      }, 1000);
      setTimeout(function () {
        $('#history').fadeIn('slow');
      }, 3000);

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
          //console.log(othersRecords);
          console.log('get other eyes')
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