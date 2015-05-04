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